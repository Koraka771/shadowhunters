import { shadowhunters } from "./config.js";

export async function AttributeDialog(attribute, actor) {
    new Dialog({
        title: game.i18n.localize(shadowhunters.attributesLong[attribute]).concat(" ").concat(game.i18n.localize("shadowhunters.attributeCheck")),
        content: game.i18n.localize("shadowhunters.chooseRolltype"),
        buttons: {
            advantage: {
                label: game.i18n.localize("shadowhunters.rolltypes.advantage"),
                callback: () => AttributeRoll(attribute, actor, "2", "kh")
            },
            normal: {
                label: game.i18n.localize("shadowhunters.rolltypes.normal"),
                callback: () => AttributeRoll(attribute, actor, "1", "")
            },
            disadvantage: {
                label: game.i18n.localize("shadowhunters.rolltypes.disadvantage"),
                callback: () => AttributeRoll(attribute, actor, "2", "kl")
            }
        }
    }).render(true);
}

export async function AttributeRoll(attribute, actor, n, mode) {
    let rollFormula = n.concat("d20").concat(mode).concat("+@attribute");
    let rollData = {
        attribute: actor.system[attribute]
    };
    let roll = await new Roll(rollFormula, rollData).roll({async:true});

    let critfumble = "";
    if (roll.total - actor.system[attribute] == 20) {
        critfumble = "crit";
    };
    if (roll.total - actor.system[attribute] == 1) {
        critfumble = "fumble"
    };
    
    let chatTemplate = "systems/shadowhunters/templates/chat/attribute-card.hbs"

    let speaker = ChatMessage.getSpeaker({actor: actor});
    if (game.user.character != actor ||	!game.user.character) {
        speaker = ChatMessage.getSpeaker({actor: actor, alias: actor.name.concat(" (").concat(game.user.name).concat(")")});
    };

    let chatData = {
        user: game.user._id,
        speaker: speaker,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        rolls: [roll],
        rollMode: game.settings.get("core", "rollMode")
    };
    let rolltype = "normal";
    switch (mode) {
        case "kh": {
            rolltype = "advantage";
            break;
        }
        case "kl": rolltype = "disadvantage";
    };

    let fate = false;
    if (actor.system.fate > 0) {fate = true};
    
    let cardData = {
        attribute: game.i18n.localize(shadowhunters.attributesLong[attribute]),
        rollmode: game.i18n.localize(shadowhunters.rolltypes[rolltype]),
        rollTotal: roll.total,
        rollFormula: rollFormula.replace("attribute", game.i18n.localize(shadowhunters.attributesLong[attribute])),
        resultDetail: roll.result,
        fate: fate,
        critfumble: critfumble
    };
    chatData.content = await renderTemplate(chatTemplate, cardData);    

    let chatmessage =  await ChatMessage.create(chatData);
    await chatmessage.setFlag("shadowhunters", "chatTemplate", chatTemplate);
    await chatmessage.setFlag("shadowhunters", "rollAttribute", attribute);
    await chatmessage.setFlag("shadowhunters", "rollType", rolltype);
    await chatmessage.setFlag("shadowhunters", "rollTotal", roll.total);
    await chatmessage.setFlag("shadowhunters", "resultDetail", roll.result);
    await chatmessage.setFlag("shadowhunters", "rollFormula", rollFormula.replace("attribute", game.i18n.localize(shadowhunters.attributesLong[attribute])));
    await chatmessage.setFlag("shadowhunters", "fateDiceRolled", 0);
    await chatmessage.setFlag("shadowhunters", "fateDiceResult", 0);
    await chatmessage.setFlag("shadowhunters", "rollCritFumble", critfumble);
}

export async function FateDiceRoll(chatmessage) {
    // Check if fate dice available

    console.log(chatmessage);

    let actor = game.actors.get(chatmessage.speaker.actor);
    if (actor.system.fate === 0) {
        return(ui.notifications.error(game.i18n.localize("shadowhunters.noFateDiceAvailable")));
    };

    // Roll Fate Dice To temporary chat message, that will be deleted later
    let roll = await new Roll("1d6").roll({async:true});    
    if (game.dice3d) {
        await game.dice3d.showForRoll(roll);
    } else {
        await roll.toMessage();
    };
    
    // Prepare updated message
    let fatediceresult = chatmessage.flags.shadowhunters.fateDiceResult + roll.total;
    let fatedicerolled = chatmessage.flags.shadowhunters.fateDiceRolled + 1;
    let chatTemplate = chatmessage.flags.shadowhunters.chatTemplate;
    let attribute = chatmessage.flags.shadowhunters.rollAttribute;
    let rolltype = chatmessage.flags.shadowhunters.rollType;
    let rolltotal = chatmessage.flags.shadowhunters.rollTotal;
    let resultdetail = chatmessage.flags.shadowhunters.resultDetail;
    let rollformula = chatmessage.flags.shadowhunters.rollFormula;
    let weaponname = chatmessage.flags.shadowhunters.weaponName;
    let spellname = chatmessage.flags.shadowhunters.spellName;
    let critfumble = chatmessage.flags.shadowhunters.rollCritFumble;

    rolltotal += roll.total;
    resultdetail = resultdetail.concat(" + ").concat(fatediceresult);    
    let fate = false;
    if (actor.system.fate > 1) {fate = true};
    let cardData = {
        attribute: game.i18n.localize(shadowhunters.attributesLong[attribute]),
        rollmode: game.i18n.localize(shadowhunters.rolltypes[rolltype]),
        rollTotal: rolltotal,
        rollFormula: rollformula.concat("+").concat(fatedicerolled).concat("d6"),
        resultDetail: resultdetail,
        weaponname: weaponname,
        spellname: spellname,
        fate: fate,
        critfumble: critfumble
    };
    let newContent = await renderTemplate(chatTemplate, cardData);
    let oldContent = chatmessage.content;
    if (!oldContent.includes('<div class="details hidden">')) {
        newContent = newContent.replace('<div class="details hidden">', '<div class="details">');
    };

    // update message and store updated values to flags
    await chatmessage.setFlag("shadowhunters", "rollTotal", rolltotal);
    await chatmessage.setFlag("shadowhunters", "fateDiceRolled", fatedicerolled);
    await chatmessage.setFlag("shadowhunters", "fateDiceResult", fatediceresult);

    await chatmessage.update({content: newContent}); 

    actor.deductFate();
}

export async function AttackDialog(actor, weapon) {
    new Dialog({
        title: game.i18n.localize("shadowhunters.attackWith").concat(weapon.name),
        content: game.i18n.localize("shadowhunters.chooseRolltype"),
        buttons: {
            advantage: {
                label: game.i18n.localize("shadowhunters.rolltypes.advantage"),
                callback: () => AttackRoll(actor, weapon, "2", "kh")
            },
            normal: {
                label: game.i18n.localize("shadowhunters.rolltypes.normal"),
                callback: () => AttackRoll(actor, weapon, "1", "")
            },
            disadvantage: {
                label: game.i18n.localize("shadowhunters.rolltypes.disadvantage"),
                callback: () => AttackRoll(actor, weapon, "2", "kl")
            }
        }
    }).render(true);
}

export async function AttackRoll(actor, weapon, n, mode) {

    let attribute = "str";
    switch (weapon.system.weaponType) {
        case "ranged": {
            attribute = "wis";
            break;
        };
        case "thrown": {
            attribute = "dex";
            break;
        };
    };

    let rollFormula = n.concat("d20").concat(mode).concat("+@attribute");
    let rollData = {
        attribute: actor.system[attribute]
    };

    let roll = await new Roll(rollFormula, rollData).roll({async:true});

    let critfumble = "";
    if (roll.total - actor.system[attribute] == 20) {
        critfumble = "crit";
    };
    if (roll.total - actor.system[attribute] == 1) {
        critfumble = "fumble"
    };

    let chatTemplate = "systems/shadowhunters/templates/chat/attack-card.hbs"
    let speaker = ChatMessage.getSpeaker({actor: actor});
    if (game.user.character != actor ||	!game.user.character) {
        speaker = ChatMessage.getSpeaker({actor: actor, alias: actor.name.concat(" (").concat(game.user.name).concat(")")});
    };
    let chatData = {
        user: game.user._id,
        speaker: speaker,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        rolls: [roll],
        rollMode: game.settings.get("core", "rollMode")
    };
    let rolltype = "normal";
    switch (mode) {
        case "kh": {
            rolltype = "advantage";
            break;
        }
        case "kl": rolltype = "disadvantage";
    };
    let fate = false;
    if (actor.system.fate > 0) {fate = true};
    let cardData = {
        rollmode: game.i18n.localize(shadowhunters.rolltypes[rolltype]),
        rollTotal: roll.total,
        rollFormula: rollFormula.replace("attribute", game.i18n.localize(shadowhunters.attributesLong[attribute])),
        resultDetail: roll.result,
        weaponname: weapon.name,
        fate: fate,
        critfumble: critfumble
    };
    chatData.content = await renderTemplate(chatTemplate, cardData);    

    let chatmessage =  await ChatMessage.create(chatData);
    await chatmessage.setFlag("shadowhunters", "chatTemplate", chatTemplate);
    await chatmessage.setFlag("shadowhunters", "weaponName", weapon.name);
    await chatmessage.setFlag("shadowhunters", "rollAttribute", attribute);
    await chatmessage.setFlag("shadowhunters", "rollType", rolltype);
    await chatmessage.setFlag("shadowhunters", "rollTotal", roll.total);
    await chatmessage.setFlag("shadowhunters", "resultDetail", roll.result);
    await chatmessage.setFlag("shadowhunters", "rollFormula", rollFormula.replace("attribute", game.i18n.localize(shadowhunters.attributesLong[attribute])));
    await chatmessage.setFlag("shadowhunters", "fateDiceRolled", 0);
    await chatmessage.setFlag("shadowhunters", "fateDiceResult", 0);
    await chatmessage.setFlag("shadowhunters", "rollCritFumble", critfumble);
}

export async function DamageDialog(attacker, weapon) {
    new Dialog({
        title: game.i18n.localize("shadowhunters.damageWith").concat(weapon.name),
        content: game.i18n.localize("shadowhunters.chooseRolltype"),
        buttons: {
            advantage: {
                label: game.i18n.localize("shadowhunters.rolltypes.normal"),
                callback: () => DamageRoll(attacker, weapon, "normal")
            },
            normal: {
                label: game.i18n.localize("shadowhunters.criticalHit"),
                callback: () => DamageRoll(attacker, weapon, "crit")
            }
        }
    }).render(true);
}

export async function DamageRoll(actor, weapon, mode) {
    let attribute = "str";
    switch (weapon.system.weaponType) {
        case "ranged": {
            attribute = "wis";
            break;
        };
        case "thrown": {
            attribute = "dex";
            break;
        };
    };

    let rollFormula = weapon.system.damage.concat("+@attribute");
    if (mode === "crit") {
        rollFormula = weapon.system.damage.slice(1).concat("+").concat(weapon.system.damage).concat("+@attribute");
    };

    let rollData = {
        attribute: actor.system[attribute]
    };

    let roll = await new Roll(rollFormula, rollData).roll({async:true});
    
    let chatTemplate = "systems/shadowhunters/templates/chat/damage-card.hbs"
    let speaker = ChatMessage.getSpeaker({actor: actor});
    if (game.user.character != actor ||	!game.user.character) {
        speaker = ChatMessage.getSpeaker({actor: actor, alias: actor.name.concat(" (").concat(game.user.name).concat(")")});
    };
    let chatData = {
        user: game.user._id,
        speaker: speaker,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        rolls: [roll],
        rollMode: game.settings.get("core", "rollMode")
    };
    let rolltype = "normal";
    if (mode === "crit") {rolltype = "crit";};
    let fate = false;
    if (actor.system.fate > 0) {fate = true};
    let cardData = {
        rollmode: game.i18n.localize(shadowhunters.rolltypes[rolltype]),
        rollTotal: roll.total,
        rollFormula: rollFormula.replace("attribute", game.i18n.localize(shadowhunters.attributesLong[attribute])),
        resultDetail: roll.result,
        weaponname: weapon.name,
        fate: fate
    };
    chatData.content = await renderTemplate(chatTemplate, cardData);    

    let chatmessage =  await ChatMessage.create(chatData);
    await chatmessage.setFlag("shadowhunters", "chatTemplate", chatTemplate);
    await chatmessage.setFlag("shadowhunters", "weaponName", weapon.name);
    await chatmessage.setFlag("shadowhunters", "rollAttribute", attribute);
    await chatmessage.setFlag("shadowhunters", "rollType", rolltype);
    await chatmessage.setFlag("shadowhunters", "rollTotal", roll.total);
    await chatmessage.setFlag("shadowhunters", "resultDetail", roll.result);
    await chatmessage.setFlag("shadowhunters", "rollFormula", rollFormula.replace("attribute", game.i18n.localize(shadowhunters.attributesLong[attribute])));
    await chatmessage.setFlag("shadowhunters", "fateDiceRolled", 0);
    await chatmessage.setFlag("shadowhunters", "fateDiceResult", 0);
}

export async function SpellDamageDialog(attacker, weapon) {
    new Dialog({
        title: game.i18n.localize("shadowhunters.damageWith").concat(weapon.name),
        content: game.i18n.localize("shadowhunters.chooseRolltype"),
        buttons: {
            advantage: {
                label: game.i18n.localize("shadowhunters.rolltypes.normal"),
                callback: () => SpellDamageRoll(attacker, weapon, "normal")
            },
            normal: {
                label: game.i18n.localize("shadowhunters.criticalHit"),
                callback: () => SpellDamageRoll(attacker, weapon, "crit")
            }
        }
    }).render(true);
}

export async function SpellCheckDialog(actor, item) {
    new Dialog({
        title: game.i18n.localize("shadowhunters.spellcheckFor").concat(item.name),
        content: game.i18n.localize("shadowhunters.chooseRolltype"),
        buttons: {
            advantage: {
                label: game.i18n.localize("shadowhunters.rolltypes.advantage"),
                callback: () => SpellCheckRoll(actor, item, "2", "kh")
            },
            normal: {
                label: game.i18n.localize("shadowhunters.rolltypes.normal"),
                callback: () => SpellCheckRoll(actor, item, "1", "")
            },
            disadvantage: {
                label: game.i18n.localize("shadowhunters.rolltypes.disadvantage"),
                callback: () => SpellCheckRoll(actor, item, "2", "kl")
            }
        }
    }).render(true);
}

export async function SpellCheckRoll(actor, item, n, mode) {

    let attribute = "int";

    let rollFormula = n.concat("d20").concat(mode).concat("+@attribute");
    let rollData = {
        attribute: actor.system[attribute]
    };

    let roll = await new Roll(rollFormula, rollData).roll({async:true});

    let critfumble = "";
    if (roll.total - actor.system[attribute] == 20) {
        critfumble = "crit";
    };
    if (roll.total - actor.system[attribute] == 1) {
        critfumble = "fumble"
    };
    
    let chatTemplate = "systems/shadowhunters/templates/chat/spellcheck-card.hbs"
    let speaker = ChatMessage.getSpeaker({actor: actor});
    if (game.user.character != actor ||	!game.user.character) {
        speaker = ChatMessage.getSpeaker({actor: actor, alias: actor.name.concat(" (").concat(game.user.name).concat(")")});
    };
    let chatData = {
        user: game.user._id,
        speaker: speaker,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        rolls: [roll],
        rollMode: game.settings.get("core", "rollMode")
    };
    let rolltype = "normal";
    switch (mode) {
        case "kh": {
            rolltype = "advantage";
            break;
        }
        case "kl": rolltype = "disadvantage";
    };
    let fate = false;
    if (actor.system.fate > 0) {fate = true};
    let cardData = {
        rollmode: game.i18n.localize(shadowhunters.rolltypes[rolltype]),
        rollTotal: roll.total,
        rollFormula: rollFormula.replace("attribute", game.i18n.localize(shadowhunters.attributesLong[attribute])),
        resultDetail: roll.result,
        spellname: item.name,
        fate: fate,
        critfumble: critfumble
    };
    chatData.content = await renderTemplate(chatTemplate, cardData);    

    let chatmessage =  await ChatMessage.create(chatData);
    await chatmessage.setFlag("shadowhunters", "chatTemplate", chatTemplate);
    await chatmessage.setFlag("shadowhunters", "spellName", item.name);
    await chatmessage.setFlag("shadowhunters", "rollAttribute", attribute);
    await chatmessage.setFlag("shadowhunters", "rollType", rolltype);
    await chatmessage.setFlag("shadowhunters", "rollTotal", roll.total);
    await chatmessage.setFlag("shadowhunters", "resultDetail", roll.result);
    await chatmessage.setFlag("shadowhunters", "rollFormula", rollFormula.replace("attribute", game.i18n.localize(shadowhunters.attributesLong[attribute])));
    await chatmessage.setFlag("shadowhunters", "fateDiceRolled", 0);
    await chatmessage.setFlag("shadowhunters", "fateDiceResult", 0);
    await chatmessage.setFlag("shadowhunters", "rollCritFumble", critfumble);
}

export async function SpellDamageRoll(actor, item, mode) {
    let attribute = "int";

    let rollFormula = item.system.damage.concat("+@attribute");
    if (mode === "crit") {
        rollFormula = "2*(".concat(item.system.damage).concat("+@attribute").concat(")");
    };
    
    let rollData = {
        attribute: actor.system[attribute]
    };

    let roll = await new Roll(rollFormula, rollData).roll({async:true});
    
    let chatTemplate = "systems/shadowhunters/templates/chat/damage-card.hbs"
    let speaker = ChatMessage.getSpeaker({actor: actor});
    if (game.user.character != actor ||	!game.user.character) {
        speaker = ChatMessage.getSpeaker({actor: actor, alias: actor.name.concat(" (").concat(game.user.name).concat(")")});
    };
    let chatData = {
        user: game.user._id,
        speaker: speaker,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        rolls: [roll],
        rollMode: game.settings.get("core", "rollMode")
    };
    let rolltype = "normal";
    if (mode === "crit") {rolltype = "crit";};
    let fate = false;
    if (actor.system.fate > 0) {fate = true};
    let cardData = {
        rollmode: game.i18n.localize(shadowhunters.rolltypes[rolltype]),
        rollTotal: roll.total,
        rollFormula: rollFormula.replace("attribute", game.i18n.localize(shadowhunters.attributesLong[attribute])),
        resultDetail: roll.result,
        spellname: item.name,
        fate: fate
    };
    chatData.content = await renderTemplate(chatTemplate, cardData);    

    let chatmessage =  await ChatMessage.create(chatData);
    await chatmessage.setFlag("shadowhunters", "chatTemplate", chatTemplate);
    await chatmessage.setFlag("shadowhunters", "spellName", item.name);
    await chatmessage.setFlag("shadowhunters", "rollAttribute", attribute);
    await chatmessage.setFlag("shadowhunters", "rollType", rolltype);
    await chatmessage.setFlag("shadowhunters", "rollTotal", roll.total);
    await chatmessage.setFlag("shadowhunters", "resultDetail", roll.result);
    await chatmessage.setFlag("shadowhunters", "rollFormula", rollFormula.replace("attribute", game.i18n.localize(shadowhunters.attributesLong[attribute])));
    await chatmessage.setFlag("shadowhunters", "fateDiceRolled", 0);
    await chatmessage.setFlag("shadowhunters", "fateDiceResult", 0);
}