export default class shItemSheet extends ItemSheet {
    
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 500,
            height: 400,
            classes: ["shadowhunters", "sheet", "item"]
        });
    }
    
    get template() {
        return `systems/shadowhunters/templates/sheets/${this.item.type}-sheet.hbs`;
    }

    getData() {
        const data = super.getData();

        data.config = CONFIG.shadowhunters;

        return data;
    }
}