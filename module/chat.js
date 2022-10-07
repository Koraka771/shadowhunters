import * as Dice from "./dice.js";

export function addChatListeners(html) {
    html.on('click', '.weapon-buttons .attack', onAttack);
    html.on('click', '.weapon-buttons .damage', onDamage);
    html.on('click', '.damage .fate-dice', onDamageFateDice);
}

function onAttack(event) {
    const button = event.currentTarget;
    const card = button.closest(".item")
    let attacker = game.actors.get(card.dataset.ownerId);
    let weapon = attacker.items.get(card.dataset.itemId);

    Dice.Attack(attacker, weapon);
}

function onDamage(event) {
    const button = event.currentTarget;
    const card = button.closest(".item")
    let attacker = game.actors.get(card.dataset.ownerId);
    let weapon = attacker.items.get(card.dataset.itemId);

    Dice.Damage(attacker, weapon);
}

async function onDamageFateDice(event) {
    const button = event.currentTarget;
    const card = button.closest(".damage")
    const message = button.closest(".chat-message");

    console.log(message.dataset);

    let chatmessage = game.messages.get(message.dataset.messageId);

    console.log(chatmessage);

    console.log(chatmessage.flags.shadowhunters.damageRollTotal);

    // Roll Fatedice
    let fateDiceResult = 99;

    // update Flag
    await chatmessage.setFlag("shadowhunters", "damageRollTotal", fateDiceResult);

    // UPDATE MESSAGE

    let chatTemplate = "systems/shadowhunters/templates/chat/damage-card.hbs"

    let cardData = {
        rollTotal: fateDiceResult
    };

    let new_content = await renderTemplate(chatTemplate, cardData);    

    chatmessage.update({content: new_content});
}


