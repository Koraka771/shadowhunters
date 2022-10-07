import * as Dice from "../dice.js";

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

        html.find(".attribute-roll").click(this._onAttributeRoll.bind(this));
        html.find(".item-name").click(this._onItemName.bind(this));

    }

    _onItemName(event) {
        event.preventDefault();
        const button = event.currentTarget;
        const li = button.closest(".item");
        const item = this.actor.items.get(li.dataset.itemId);

        Dice.ItemRoll({item})
    }

    _onAttributeRoll(event) {
        event.preventDefault();
        let attributeID = event.currentTarget.dataset.attribute;

        Dice.AttributeRoll({
            attributeID: attributeID,
            actor: this.actor
        })
    }
    
    _onItemControl(event) {
        event.preventDefault();

        // Obtain event data
        const button = event.currentTarget;
        const li = button.closest(".item");

        // Handle different actions
        switch ( button.dataset.action ) {
        case "create": {
            const cls = getDocumentClass("Item");
            return cls.create({name: game.i18n.localize("shadowhunters.itemNew"), type: button.dataset.type}, {parent: this.actor});
        };
        case "edit": {
            const item = this.actor.items.get(li.dataset.itemId);
            return item.sheet.render(true);
        };
        case "delete": {
            const item = this.actor.items.get(li.dataset.itemId);
            return item.delete();
        };
        }
    }

    _onFateDiceClick(event) {
        let newValue = 0;
        if (this.actor.system.fate < 10) {
            newValue = this.actor.system.fate + 1;
        } else {
            newValue = this.actor.system.fate;
        }
        
        return this.actor.update({system: {fate: newValue}});
    }

    _onFateDiceRightClick(event) {
        let newValue = 0;
        if (this.actor.system.fate > 0) {
            newValue = this.actor.system.fate - 1;
        } else {
            newValue = this.actor.system.fate;
        }

        return this.actor.update({system: {fate: newValue}});
    }

    _onCorruptionClick(event) {
        let newValue = 0;
        if (this.actor.system.corruption < 10) {
            newValue = this.actor.system.corruption + 1;
        } else {
            newValue = this.actor.system.corruption;
        }
        
        return this.actor.update({system: {corruption: newValue}});
    }

    _onCorruptionRightClick(event) {
        let newValue = 0;
        if (this.actor.system.corruption > 0) {
            newValue = this.actor.system.corruption - 1;
        } else {
            newValue = this.actor.system.corruption;
        }

        return this.actor.update({system: {corruption: newValue}});
    }
}
