export async function AttributeRoll({ attributeID = null, actor = null } = {}) {
    
    let rollFormula = "1d20 + @attribute";
    let rollData = {
        attribute: actor.system[attributeID]
    }
    let messageData = {
        flavor: "Irgendein Text",
        speaker: ChatMessage.getSpeaker()
    }

    let roll = await new Roll(rollFormula, rollData).roll({async:true});
    await roll.toMessage(messageData);
}

export async function ItemRoll({ item = null } = {}) {

    const actor = item.parent;

    let chatTemplate = "systems/shadowhunters/templates/chat/item-card.hbs"

    let chatData = {
        user: game.user._id,
        speaker: ChatMessage.getSpeaker(),
    }

    let cardData = {
        ...item,
        _id: item._id,
        owner: item.parent._id
    };

    chatData.content = await renderTemplate(chatTemplate, cardData);

    return ChatMessage.create(chatData);
}

export async function Attack(attacker, weapon) {
    new Dialog({
        title: "Vorteil / Nachteil",
        content: "Content",
        buttons: {
            advantage: {
                label: "Vorteil",
                callback: () => rollAttack(attacker, weapon, "2", "kh")
            },
            normal: {
                label: "Normal",
                callback: () => rollAttack(attacker, weapon, "1", "")
            },
            disadvantage: {
                label: "Nachteil",
                callback: () => rollAttack(attacker, weapon, "2", "kl")
            }
        }
    }).render(true);
}

export async function rollAttack(attacker, weapon, n, mode) {
    let attackAttribute = "str";

    console.log("AttackAttribute: ", attackAttribute);

    switch (weapon.system.weaponType) {
        case "ranged": {
            attackAttribute = "wis";
            break;
        };
        case "thrown": {
            attackAttribute = "dex";
            break;
        };
    }

    console.log("AttackAttribute: ", attackAttribute);

    let rollFormula = n.concat("d20").concat(mode).concat(" + @attribute");

    let rollData = {
        attribute: attacker.system[attackAttribute]
    }
    let messageData = {
        flavor: "Angriff mit ".concat(weapon.name),
        speaker: ChatMessage.getSpeaker()
    }

    let roll = await new Roll(rollFormula, rollData).roll({async:true});
    await roll.toMessage(messageData);

}

export async function Damage(attacker, weapon) {
    new Dialog({
        title: "Schaden",
        content: "Content",
        buttons: {
            advantage: {
                label: "Normal",
                callback: () => rollDamage(attacker, weapon, "normal")
            },
            normal: {
                label: "Kritischer Treffer",
                callback: () => rollDamage(attacker, weapon, "crit")
            }
        }
    }).render(true);
}


export async function rollDamage(attacker, weapon, mode) {
    let attackAttribute = "str";
    switch (weapon.system.weaponType) {
        case "ranged": {
            attackAttribute = "wis";
            break;
        };
        case "thrown": {
            attackAttribute = "dex";
            break;
        };
    }

    let rollFormula = "";
    if (mode === "normal") {
        rollFormula = weapon.system.damage.concat(" + @attribute");
    };
    if (mode === "crit") {
        rollFormula = weapon.system.damage.slice(1).concat("+").concat(weapon.system.damage).concat(" + @attribute");
    };

    let rollData = {
        attribute: attacker.system[attackAttribute]
    }
    let messageData = {
        flavor: "Schaden durch ".concat(weapon.name),
        speaker: ChatMessage.getSpeaker()
    }

    let roll = await new Roll(rollFormula, rollData).roll({async:true});
    // await roll.toMessage(messageData);

    // ************************************
    // TEST CHAT CARD WITH FATE DICE BUTTON

    // await roll.evaluate(); 
    // console.log(roll);

    let chatTemplate = "systems/shadowhunters/templates/chat/damage-card.hbs"

    let chatData = {
        user: game.user._id,
        speaker: ChatMessage.getSpeaker(),
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        rolls: [roll],
        rollMode: game.settings.get("core", "rollMode")
    }

    let cardData = {
        ...weapon,
        rollTotal: roll.total
    };

    chatData.content = await renderTemplate(chatTemplate, cardData);    
    let chatmessage =  await ChatMessage.create(chatData);

    await chatmessage.setFlag("shadowhunters", "damageRollTotal", roll.total);
    
    console.log("Chatmessage: ", chatmessage);
    
    /* Experimente ... zum merken für chatkarten Update

    cardData.messageID = chatmessage._id;
    console.log("CardDataUpdate: ", cardData);
    let new_content = await renderTemplate(chatTemplate, cardData);
    console.log("New Content: ", new_content);
    chatmessage.update({content: new_content});
    */
}