import { shadowhunters } from "./module/config.js";
import shItemSheet from "./module/sheets/shItemSheet.js";

Hooks.once("init", function() {
    console.log("Shadowhunters | Initialising system...");

    CONFIG.shadowhunters = shadowhunters;

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("shadowhunters", shItemSheet, {makeDefault: true});
});