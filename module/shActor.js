export default class shActor extends Actor {
    prepareData() {
        super.prepareData();
    }

    prepareDerivedData() {
        super.prepareDerivedData();

        if (this.type == "character") {
            this.system.defense = 10 + Math.round((this.system.str + this.system.dex + this.system.con)/3) + this.getArmorDefense();
            this.system.encumberance.max = 10 + this.system.con;
            this.system.encumberance.current = this.getCurrentEmcumberance();
        };
        if (this.type == "npc") {
            this.system.defense = 10 + Math.round((this.system.str + this.system.dex + this.system.con)/3) + this.getArmorDefense();
        };
    }

    getCurrentEmcumberance() {
        let n = 0;
        let items=this.items;

        items.forEach((item) => {
            if (item.type === "armor" || item.type === "weapon" || item.type === "equipemnt") {
                n = n + item.system.weight;
            };
        });

        return (n);
    }

    getArmorDefense() {
        let def = 0;
        let items = this.items;

        items.forEach((item) => {
            if (item.type === "armor" && item.system.equipped) {
                def += item.system.defense;
            };
        });

        return (def);

        // ADD CHECKS THAT ONLY 1 ARMOR AND 1 SHIELD ARE EQUIPPED

    }

    deductFate() {
        let currentfate = this.system.fate;
        let newfate = currentfate - 1;

        this.update({system: {fate: newfate}});

        let speaker = ChatMessage.getSpeaker({actor: this});
        if (game.user.character != this ||	!game.user.character) {
            speaker = ChatMessage.getSpeaker({actor: this, alias: this.name.concat(" (").concat(game.user.name).concat(")")});
        };

        let chatOptions = {
            user: game.user._id,
            speaker: speaker,
            content: game.i18n.format("shadowhunters.fateDiceSpent", {actor: this.name, n: newfate})
         };
         ChatMessage.create(chatOptions);
    }

    addFate() {
        let currentfate = this.system.fate;
        let newfate = currentfate + 1;

        this.update({system: {fate: newfate}});

        let speaker = ChatMessage.getSpeaker({actor: this});
        if (game.user.character != this ||	!game.user.character) {
            speaker = ChatMessage.getSpeaker({actor: this, alias: this.name.concat(" (").concat(game.user.name).concat(")")});
        };

        let chatOptions = {
            user: game.user._id,
            speaker: speaker,
            content: game.i18n.format("shadowhunters.fateDiceReceived", {actor: this.name, n: newfate})
         };
         ChatMessage.create(chatOptions);
    }

    deductCorruption() {
        this.update({system: {corruption: this.system.corruption - 1}});

        let speaker = ChatMessage.getSpeaker({actor: this});
        if (game.user.character != this ||	!game.user.character) {
            speaker = ChatMessage.getSpeaker({actor: this, alias: this.name.concat(" (").concat(game.user.name).concat(")")});
        };

        let chatOptions = {
            user: game.user._id,
            speaker: speaker,
            content: game.i18n.format("shadowhunters.corruptionLost", {actor: this.name})
         };
         ChatMessage.create(chatOptions);
    }

    addCorruption() {
        this.update({system: {corruption: this.system.corruption + 1}});

        let speaker = ChatMessage.getSpeaker({actor: this});
        if (game.user.character != this ||	!game.user.character) {
            speaker = ChatMessage.getSpeaker({actor: this, alias: this.name.concat(" (").concat(game.user.name).concat(")")});
        };

        let chatOptions = {
            user: game.user._id,
            speaker: speaker,
            content: game.i18n.format("shadowhunters.corruptionGained", {actor: this.name})
         };
         ChatMessage.create(chatOptions);
    }
}