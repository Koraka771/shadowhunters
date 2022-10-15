export default class shCharTweaks extends FormApplication {
    constructor(actor) {
        super(actor);
        this.actor = actor;
    }

    static get defaultOptions() {        
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: "systems/shadowhunters/templates/sheets/shCharTweaks.hbs",
            title: game.i18n.localize('shadowhunters.tweaks'),
            id: 'sheet-tweaks',
            width: 300,
            classes: ['shadowhunters-app', 'tweaks'],
            closeOnSubmit: true,
            submitOnClose: false,
            submitOnChange: false,
            baseApplication: "shActorSheet"
        });
    }

    getData() {
        const data=super.getData().object.system;
        return(data);
    }

    activateListeners(html) {
        super.activateListeners(html);
    }

    async _updateObject(event, formData) {
        console.log(formData);
        this.actor.update({system: formData});
    }
}

window.shCharTweaks = shCharTweaks;