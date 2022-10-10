import * as Dice from "../dice.js";
import * as shItem from "../shItem.js";

export default class shCharacterSheet extends ActorSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "systems/shadowhunters/templates/sheets/character-sheet.hbs",
            classes: ["shadowhunters", "sheet", "character"],
            width: 700,
            height: 800
        });
    }

    getData() {
        const data = super.getData();
        data.config = CONFIG.shadowhunters;
        data.weapons = data.items.filter(function (item) { return item.type == "weapon" });
        data.armor = data.items.filter(function (item) { return item.type == "armor" });
        data.equipment = data.items.filter(function (item) { return item.type =="equipment" });
        data.feats = data.items.filter(function (item) { return item.type =="feat" });
        data.spells = data.items.filter(function (item) { return item.type =="spell" });
        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find(".item-control").click(this._onItemControl.bind(this));

        html.find(".fatedice").click(this._onFateDiceClick.bind(this));
        html.find(".fatedice").contextmenu(this._onFateDiceRightClick.bind(this));
        
        html.find(".corruption").click(this._onCorruptionClick.bind(this));
        html.find(".corruption").contextmenu(this._onCorruptionRightClick.bind(this));

        html.find(".attribute-name").click(this._onAttributeName.bind(this));
        html.find(".item-name").click(this._onItemName.bind(this));

        if (this.actor.owner) {
            let handler = ev => this._onDragStart(ev);
            // Find all items on the character sheet.
            html.find('li.item').each((i, li) => {
              // Add draggable attribute and dragstart listener.
              li.setAttribute("draggable", true);
              li.addEventListener("dragstart", handler, false);
            });
          }
    }

    _onItemName(event) {
        event.preventDefault();
        const button = event.currentTarget;
        const li = button.closest(".item");
        const item = this.actor.items.get(li.dataset.itemId);

        shItem.ItemCard(item, this.actor)
    }

    _onAttributeName(event) {
        event.preventDefault();
        let attribute = event.currentTarget.dataset.attribute;

        Dice.AttributeDialog(attribute, this.actor)
    }
    
    _onItemControl(event) {
        event.preventDefault();

        // Obtain event data
        const button = event.currentTarget;
        const li = button.closest(".item");

        // Handle different actions
        switch ( button.dataset.action ) {
        case "create": {
            const itemtype = button.dataset.type;
            return createItem(itemtype, this.actor);
        };
        case "edit": {
            const item = this.actor.items.get(li.dataset.itemId);
            return item.sheet.render(true);
        };
        case "delete": {
            const item = this.actor.items.get(li.dataset.itemId);
            return item.delete();
        };
        case "equip": {
            const item = this.actor.items.get(li.dataset.itemId);
            return item.update({system: {equipped: !item.system.equipped}});
        };
        };
    }

    _onFateDiceClick(event) {
        if (this.actor.system.fate < 10) {
            this.actor.addFate();
        };
    }

    _onFateDiceRightClick(event) {
        if (this.actor.system.fate > 0) {
            this.actor.deductFate();
        };
    }

    _onCorruptionClick(event) {
        if (this.actor.system.corruption < 10) {
            this.actor.addCorruption();
        };
    }

    _onCorruptionRightClick(event) {
        if (this.actor.system.corruption > 0) {
            this.actor.deductCorruption();
        };
    }
}

async function createItem (itemtype, actor) {                
    const cls = getDocumentClass("Item");
    let item = await cls.create({name: game.i18n.localize("shadowhunters.itemNew"), type: itemtype}, {parent: actor});
    console.log(item);
    return item.sheet.render(true);
}