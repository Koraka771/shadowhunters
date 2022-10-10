import * as Dice from "./dice.js";

export function addChatListeners(html) {
    html.on('click', '.weapon-attack button', onWeaponAttack);
    html.on('click', '.weapon-damage button', onWeaponDamage);
    html.on('click', '.spell-check button', onSpellCheck);
    html.on('click', '.spell-damage button', onSpellDamage);
    html.on('click', '.fate-dice', onFateDice);
    html.on('click', '.result', onResult);
}

function onWeaponAttack(event) {
    const button = event.currentTarget;
    const card = button.closest(".item")
    let attacker = game.actors.get(card.dataset.ownerId);
    let weapon = attacker.items.get(card.dataset.itemId);

    Dice.AttackDialog(attacker, weapon);
}

function onWeaponDamage(event) {
    const button = event.currentTarget;
    const card = button.closest(".item")
    let attacker = game.actors.get(card.dataset.ownerId);
    let weapon = attacker.items.get(card.dataset.itemId);

    Dice.DamageDialog(attacker, weapon);
}

function onSpellCheck(event) {
    const button = event.currentTarget;
    const card = button.closest(".item")
    let actor = game.actors.get(card.dataset.ownerId);
    let spell = actor.items.get(card.dataset.itemId);

    Dice.SpellCheckDialog(actor, spell);
}

function onSpellDamage(event) {
    const button = event.currentTarget;
    const card = button.closest(".item")
    let actor = game.actors.get(card.dataset.ownerId);
    let spell = actor.items.get(card.dataset.itemId);

    Dice.SpellDamageDialog(actor, spell);
}


async function onFateDice(event) {
    const button = event.currentTarget;
    let chatmessage = game.messages.get(button.closest(".chat-message").dataset.messageId);
    let cardtype = "";
    return await Dice.FateDiceRoll(chatmessage);
}

async function onResult(event) {

    const button = event.currentTarget;
    const message = button.closest(".chat-message");
    let chatmessage = game.messages.get(message.dataset.messageId);
    let oldContent = chatmessage.content;
    let newContent = "";

    // CHECK THIS: https://github.com/javierriveracastro/betteroll-swade/blob/15ca6af5e61532781dc5ac065cd03047b53bdf6f/betterrolls-swade2/scripts/cards_common.js#L377

    if (oldContent.includes('<div class="details hidden">')) {
        newContent = oldContent.replace('<div class="details hidden">', '<div class="details">');
    } else {
        newContent = oldContent.replace('<div class="details">', '<div class="details hidden">');
    }

    chatmessage.update({content: newContent});

}