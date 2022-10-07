import { shadowhunters } from "./module/config.js";
import * as Chat from "./module/chat.js";
import shItemSheet from "./module/sheets/shItemSheet.js";
import shCharacterSheet from "./module/sheets/shCharacterSheet.js";

Hooks.once("init", function() {
    console.log("Shadowhunters | Initialising system...");

    CONFIG.shadowhunters = shadowhunters;

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("shadowhunters", shItemSheet, {makeDefault: true});

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("shadowhunters", shCharacterSheet, {makeDefault: true});

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