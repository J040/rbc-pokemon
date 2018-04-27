const fs = require('fs');

module.exports = function(router) {
    // GET
    router.get('/batalha/:p1/:p2', seguir);

    function seguir(request, response) {
        let result = new Combat(
            new Pokemon(39, 52, 43, 60, 50, 65, 'fire'),
            new Pokemon(45, 49, 49, 65, 65, 45, 'grass', 'poison'),
            0
        );

        let highestSim = 0;
        let bestCase;
        for(let i = 0; i < COMBATS.length; i++) {
            let similarity1 = 0;
            similarity1 += result.pokemon1.getSimilarityValue(COMBATS[i].pokemon1);
            similarity1 += result.pokemon2.getSimilarityValue(COMBATS[i].pokemon2);
            similarity1 /= 2;

            let similarity2 = 0;
            similarity2 += result.pokemon1.getSimilarityValue(COMBATS[i].pokemon2);
            similarity2 += result.pokemon2.getSimilarityValue(COMBATS[i].pokemon1);
            similarity2 /= 2;

            let similarity = (similarity1 > similarity2) ? similarity1 : similarity2;
            console.log(i, similarity);
            if(similarity >= highestSim) {                
                bestCase = COMBATS[i];
            }
        }
        result.winner = bestCase.winner;

        response.send(`<div style='display: -webkit-flex;
                                display: -ms-flexbox;
                                display: flex;
                                justify-content: center;
                                width: 100%;
                                position: fixed;
                                float: left;
                                top: 40%'>
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${result.winner}.png"/> </div>`);
    }
}

/* INITIALIZING */
const MAX_NUM_COMBATS = 30;
let EFFECTIVENESS_TABLE;
let COMBAT;
generateEffectivenessTable();
getCombatsLog();

/* POKEMON */

class Pokemon {
    constructor(hp, attack, defense, spAttack, spDefense, speed, type1, type2) {
        this.hp = hp;
        this.attack = attack;
        this.defense = defense;
        this.spAttack = spAttack;
        this.spDefense = spDefense;
        this.speed = speed;
        type2 = type2 || type1;
        this.types = [new Type(type1), new Type(type2)];
    }

    getSimilarityValue(pokemon) {
        let sum = 0;
        for(const stat of Object.keys(STAT))
            sum += getSimilarityNumberValue(this[stat], pokemon[stat], STAT[stat].min, STAT[stat].max);
        
        let sim1 = 3 * getSimilarityTypeValue(this.types[0], pokemon.types[0])
                 + 3 * getSimilarityTypeValue(this.types[1], pokemon.types[1]);

        let sim2 = 3 * getSimilarityTypeValue(this.types[0], pokemon.types[1])
                 + 3 * getSimilarityTypeValue(this.types[1], pokemon.types[0]);        
        sum += (sim1 > sim2) ? sim1 : sim2;
        
        return sum / (Object.keys(STAT).length + 6);
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
class Type {
    constructor(name) {
        this.name = name;
        this.effectiveness = getEffectiveness(name);
    }
}

function getEffectiveness(type) {
    return EFFECTIVENESS_TABLE[type.toLowerCase()];
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

class Combat {
    constructor(pokemon1, pokemon2, winner) {
        this.pokemon1 = pokemon1;
        this.pokemon2 = pokemon2;
        this.winner = winner;
    }
}

function getCombatsLog() {
    fs.readFile("./data/combats.csv", "utf-8", (error, combats) => {
        combats = combats.split('\n');        
        COMBATS = [];
        fs.readFile("./data/pokemon.csv", "utf-8", (error, pokemons) => {            
            pokemons = pokemons.split('\n');
            for(let i = 1; i < MAX_NUM_COMBATS; i++) {
                let pokemon1 = combats[i].split(',')[0];
                let pokemon2 = combats[i].split(',')[1];
                let winner = (combats[i].split(',')[2] == pokemon1) ? 1 : 2;
                let found = 0;
                for(let j = 1; j < pokemons.length; j++) {
                    let p = pokemons[j].split(',');                    
                    if(typeof(pokemon1) != 'object' && pokemon1 == p[0]) {
                        pokemon1 = new Pokemon(p[4], p[5], p[6], p[7], p[8], p[9], p[2], p[3]);
                        found++;
                    }
                    if(typeof(pokemon2) != 'object' && pokemon2 == p[0]) {
                        pokemon2 = new Pokemon(p[4], p[5], p[6], p[7], p[8], p[9], p[2], p[3]);
                        found++;
                    }
                    if(found == 2)
                        break;
                }
                COMBATS.push(new Combat(pokemon1, pokemon2, winner));
            }
        });
    });
}