module.exports = function(router) {
    // GET
    router.get('/batalha/:p1/:p2', seguir);

    function seguir(request, response) {
        let p1 = new Pokemon(75, 40, 38, 67, 55, 44, 'dark', 'water');
        let p2 = new Pokemon(60, 35, 89, 30, 30, 27, 'rock', 'ghost');
        console.log(p1.getSimilarityValue(p2));
        let winner = Math.random() >= 0.5 ? +request.params.p1 : +request.params.p1;
        response.send(`<div style='display: -webkit-flex;
                                display: -ms-flexbox;
                                display: flex;
                                justify-content: center;
                                width: 100%;
                                position: fixed;
                                float: left;
                                top: 40%'>
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${winner}.png"/> </div>`);
    }
}

/* POKEMON */

class Pokemon {
    constructor(hp, attack, defense, spAttack, spDefense, speed, type1, type2 = type1) {
        this.hp = hp;
        this.attack = attack;
        this.defense = defense;
        this.spAttack = spAttack;
        this.spDefense = spDefense;
        this.speed = speed;
        this.types = [new Type(type1), new Type(type2)];
    }

    getSimilarityValue(pokemon) {
        let sum = 0;
        for(const stat of Object.keys(STAT))
            sum += getSimilarityNumberValue(this[stat], pokemon[stat], STAT[stat].min, STAT[stat].max);
        
        let sim1 = 2 * getSimilarityTypeValue(this.types[0], pokemon.types[0])
                 + 2 * getSimilarityTypeValue(this.types[1], pokemon.types[1]);

        let sim2 = 2 * getSimilarityTypeValue(this.types[0], pokemon.types[1])
                 + 2 * getSimilarityTypeValue(this.types[1], pokemon.types[0]);        
        sum += (sim1 > sim2) ? sim1 : sim2;
        
        return sum / (Object.keys(STAT).length + 4);
    }
}

class Stat {
    constructor(min, max) {
        this.min = min;
        this.max = max;
    }
}

const STAT = {
    hp: new Stat(1, 255),
    attack: new Stat(5, 190),
    defense: new Stat(5, 230),
    spAttack: new Stat(10, 194),
    spDefense: new Stat(20, 230),
    speed: new Stat(5, 150)
}

function getSimilarityNumberValue(a, b, min, max) {
    return 1- Math.abs(a - b) / (max - min);
}

function getSimilarityTypeValue(type1, type2) {
    let similarities = 0;
    let size = type1.effectiveness.length;
    for(let i = 0; i < size; i++)
        similarities += (type1.effectiveness[i] == type2.effectiveness[i]) ? 1 : 0;
    return similarities / size;
}

/* TYPE */
const fs = require('fs');
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