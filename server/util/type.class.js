const fs = require('fs');

module.exports = () => {
    class Type {
        constructor(name) {
            this.name = name;
            this.effectiveness = getEffectiveness(name);
        }
    }
    
    let EFFECTIVENESS_TABLE;

    generateEffectivenessTable();

    function getEffectiveness(type) {
        return EFFECTIVENESS_TABLE[type];
    }

    function generateEffectivenessTable(table) {
        EFFECTIVENESS_TABLE = {};
        fs.readFile("./data/effectiveness_table.csv", "utf-8", (error, text) => {
            let types = text.split('\n');
            for(let i = 1; i < types.length; i++) {
                let splited = types[i].split(',');
                let typeName = splited[0];
                EFFECTIVENESS_TABLE[typeName] = splited.slice(1);
            }
        });
    }
}