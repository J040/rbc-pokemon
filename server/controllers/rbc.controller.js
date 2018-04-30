const fs = require('fs');

module.exports = function(router) {
    // GET
    router.get('/batalha/:p1/:p2', seguir);

    function seguir(request, response) {
        let result = new Combat(
            POKEMONS[request.params.p1],
            POKEMONS[request.params.p2],
            0
        );

        let similarities = [];

        let highestSim = 0;
        for(let i = 0; i < COMBATS.length; i++) {
            let similarity1 = 0;
            similarity1 += result.pokemon1.getSimilarityValue(POKEMONS[COMBATS[i].pokemon1]);
            similarity1 += result.pokemon2.getSimilarityValue(POKEMONS[COMBATS[i].pokemon2]);
            similarity1 /= 2;

            let similarity2 = 0;
            similarity2 += result.pokemon1.getSimilarityValue(POKEMONS[COMBATS[i].pokemon2]);
            similarity2 += result.pokemon2.getSimilarityValue(POKEMONS[COMBATS[i].pokemon1]);
            similarity2 /= 2;
                        
            let similarity;
            let winner;
            if(similarity1 > similarity2) {
                similarity = similarity1;
                winner = (COMBATS[i].winner === COMBATS[i].pokemon1) ? result.pokemon1.dex : result.pokemon2.dex;
            } else {
                similarity = similarity2;
                winner = (COMBATS[i].winner === COMBATS[i].pokemon1) ? result.pokemon2.dex : result.pokemon1.dex;
            }

            if(similarity >= highestSim) {
                highestSim = similarity;
                if(similarity1 > similarity2)
                    result.winner = (winner === COMBATS[i].pokemon1) ? result.pokemon1.dex : result.pokemon2.dex;
                else
                    result.winner = (winner === COMBATS[i].pokemon1) ? result.pokemon2.dex : result.pokemon1.dex;
            }

            similarities.push({
                p1: POKEMONS[COMBATS[i].pokemon1], 
                p2: POKEMONS[COMBATS[i].pokemon2], 
                winner: COMBATS[i].winner, 
                similarity: similarity
            });
        }
        console.log("VENCEDORRRR: ", result.winner);
        similarities
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 10)
            .forEach(s => console.log('sim: ', s.similarity, ' p1: ', s.p1.dex, s.p1.name, ' p2: ', s.p2.dex, s.p2.name, ' w: ', s.winner));        

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
let EFFECTIVENESS_TABLE;
let COMBATS;
let POKEMONS;
generateEffectivenessTable();
getCombatsLog();
getPokemons();

/* POKEMON */

class Pokemon {
    constructor(dex, name, stats, type1, type2) {
        this.dex = dex;
        this.name = name;
        this.stats = stats;
        type2 = type2 || type1;
        this.types = [new Type(type1), new Type(type2)];
    }

    getSimilarityValue(pokemon) {
        let sum = 0;
        for(const s of Object.keys(this.stats))
            sum += getSimilarityNumberValue(this.stats[s], pokemon.stats[s], STATS[s].min, STATS[s].max);
        
        let sim1 = 3 * getSimilarityTypeValue(this.types[0], pokemon.types[0])
                 + 3 * getSimilarityTypeValue(this.types[1], pokemon.types[1]);

        let sim2 = 3 * getSimilarityTypeValue(this.types[0], pokemon.types[1])
                 + 3 * getSimilarityTypeValue(this.types[1], pokemon.types[0]);        
        sum += (sim1 > sim2) ? sim1 : sim2;
        
        return sum / (Object.keys(this.stats).length + 6);
    }
}

class Stats {
    constructor(hp, attack, defense, spAttack, spDefense, speed) {
        this.hp = hp;
        this.attack = attack;
        this.defense = defense;
        this.spAttack = spAttack;
        this.spDefense = spDefense;
        this.speed = speed;
    }
}

class MinMaxStat {
    constructor(min, max) {
        this.min = min;
        this.max = max;
    }
}

const STATS = {
    hp: new MinMaxStat(1, 255),
    attack: new MinMaxStat(5, 190),
    defense: new MinMaxStat(5, 230),
    spAttack: new MinMaxStat(10, 194),
    spDefense: new MinMaxStat(20, 230),
    speed: new MinMaxStat(5, 150)
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

function getPokemons(dex) {
    POKEMONS = {};
    fs.readFile("./data/pokemon.csv", "utf-8", (error, pokemon) => {
        let pokemons = pokemon.split('\n');
        for(let i = 1; i < pokemons.length; i++) {
            let p = pokemons[i].split(',');
            POKEMONS[p[0]] = new Pokemon(
                                p[0], p[1], 
                                new Stats(p[4], p[5], p[6], p[7], p[8], p[9]), 
                                p[2], p[3]
                            );
        }
    });
}

function getCombatsLog() {
    fs.readFile("./data/combats.csv", "utf-8", (error, combats) => {
        combats = combats.split('\n');        
        COMBATS = [];
        fs.readFile("./data/pokemon.csv", "utf-8", (error, pokemons) => {            
            pokemons = pokemons.split('\n');
            for(let i = 1; i < pokemons.length; i++) {
                let pokemon1 = combats[i].split(',')[0];
                let pokemon2 = combats[i].split(',')[1];
                let winner = combats[i].split(',')[2];
                let found = 0;
                for(let j = 1; j < pokemons.length; j++) {
                    let p = pokemons[j].split(',');                    
                    if(typeof(pokemon1) != 'object' && pokemon1 == p[0]) {
                        pokemon1 = p[0];
                        found++;
                    }
                    if(typeof(pokemon2) != 'object' && pokemon2 == p[0]) {
                        pokemon2 = p[0];
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