import { shadowhunters } from "./module/config.js";
import * as Chat from "./module/chat.js";
import shItemSheet from "./module/sheets/shItemSheet.js";
import shCharacterSheet from "./module/sheets/shCharacterSheet.js";
import shNpcSheet from "./module/sheets/shNpcSheet.js";
import shMonsterSheet from "./module/sheets/shMonsterSheet.js";
import shActor from "./module/shActor.js";
import shItem from "./module/shItem.js";
import * as shItemFunctions from "./module/shItem.js";

Hooks.once("init", function() {
    console.log("Shadowhunters | Initialising system...");

    game.shadowhunters = {
        shActor,
        shItem,
        createHotbarMacro,
        createItemCard
      };

    CONFIG.shadowhunters = shadowhunters;
    CONFIG.Actor.documentClass = shActor;
    CONFIG.Item.documentClass = shItem;


    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("shadowhunters", shItemSheet, {makeDefault: true});

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("shadowhunters", shCharacterSheet, {
        makeDefault: true,
        types: ["character"]
    });
    Actors.registerSheet("shadowhunters", shNpcSheet, {
        makeDefault: true,
        types: ["npc"]
    });
    Actors.registerSheet("shadowhunters", shMonsterSheet, {
        makeDefault: true,
        types: ["monster"]
    });

    Handlebars.registerHelper("times", function (n, content) {
        let result = "";
        for (let i = 0; i < n; ++i) {
            result += content.fn(i);
        }

        return result;
    });

    Handlebars.registerHelper("10-times", function (n, content) {
        let result = "";
        let m = 10 - n;
        for (let i = 0; i < m; ++i) {
            result += content.fn(i);
        }

        return result;
    });
});

Hooks.on("renderChatLog", (app, html, data) => Chat.addChatListeners(html));


Hooks.once("ready", function() {
    Hooks.on("hotbarDrop", (bar, data, slot) => {
        if (data.type == "Item") createHotbarMacro(data, slot);
        return false;
    });    
})

async function createHotbarMacro(data, slot) {
    let uuid = data.uuid.split(".");
    let actor = game.actors.get(uuid[1]);
    let item = actor.items.get(uuid[3]);
    if (item.type != "weapon" && item.type != "spell" && item.type != "monsterattack") return false;

    console.log("Create Hotbar Macro fired...");
    const command = `game.shadowhunters.createItemCard("`.concat(item._id).concat(`", "`).concat(actor._id).concat(`");`);
    console.log(command);
    let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));
    console.log(macro);
    if (!macro) {
        macro = await Macro.create({
            name: item.name,
            type: "script",
            command: command,
            img: item.img
        });
    };
    game.user.assignHotbarMacro(macro, slot);
}

async function createItemCard(itemId, actorId) {
    const actor = game.actors.get(actorId);
    const item = actor.items.get(itemId);
    shItemFunctions.ItemCard(item, actor);
}
