export default class shItem extends Item {
    prepareData() {
      super.prepareData();
    }
}

export async function ItemCard(item, actor) {

    let chatTemplate = "systems/shadowhunters/templates/chat/item-card.hbs";

    let speaker = ChatMessage.getSpeaker({actor: actor});
    if (game.user.character != actor ||	!game.user.character) {
        speaker = ChatMessage.getSpeaker({actor: actor, alias: actor.name.concat(" (").concat(game.user.name).concat(")")});
    };

    let chatData = {
        user: game.user._id,
        speaker: speaker,
    }

    let cardData = {
        ...item,
        _id: item._id,
        owner: item.parent._id
    };

    chatData.content = await renderTemplate(chatTemplate, cardData);

    return ChatMessage.create(chatData);
}