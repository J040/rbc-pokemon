const fs = require('fs');

module.exports = function(router) {
    // GET
    router.get('/batalha/:p1/:p2', batalhar);
    router.get('/pokemons', getPokemonList);
    router.get('/script', script);

    function batalhar(request, response) {
        let combat = new Combat(
            POKEMONS[request.params.p1],
            POKEMONS[request.params.p2],
            0
        );

        let rank = getSimilarityRank(combat);

        combat.winner = rank.winner;
        console.log("VENCEDORRRR: ", combat.winner);
        console.log(rank);
        response.json(rank);
    }

    function getPokemonList(req, res) {
        let pokemons = [];
        for(key of Object.keys(POKEMONS))
            pokemons.push(POKEMONS[key]);
        res.json(pokemons.sort((a, b) => parseInt(a.dex) - parseInt(b.dex)));
    }
}

function getSimilarityRank(combat) {
    let similarities = [];
    
    let highestSim = 0;
    for(let i = 0; i < COMBATS.length; i++) {
        let pokemon1 = POKEMONS[COMBATS[i].pokemon1];
        let pokemon2 = POKEMONS[COMBATS[i].pokemon2];

        let similarity1 = 0;
        similarity1 += combat.pokemon1.getSimilarityValue(pokemon1);
        similarity1 += combat.pokemon2.getSimilarityValue(pokemon2);
        similarity1 /= 2;

        let similarity2 = 0;
        similarity2 += combat.pokemon1.getSimilarityValue(pokemon2);
        similarity2 += combat.pokemon2.getSimilarityValue(pokemon1);
        similarity2 /= 2;
                    
        let similarity;
        if(similarity1 > similarity2) {
            similarity = similarity1;
        } else {
            similarity = similarity2;
            let p = pokemon1;
            pokemon1 = pokemon2;
            pokemon2 = p;
        }

        if(similarity > highestSim) {
            combat.winner = (COMBATS[i].winner == pokemon1.dex) ? combat.pokemon1.dex : combat.pokemon2.dex;    
            highestSim = similarity;
        }
        
        similarities.push({
            p1: pokemon1,
            p2: pokemon2,
            winner: COMBATS[i].winner, 
            similarity: similarity
        });
    }
    return {
        winner: combat.winner,
        rank: similarities
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 10)
            .map(s => ({sim: s.similarity, p1: s.p1.dex, p2: s.p2.dex, winner: s.winner}))
    };
}

/* INITIALIZING */
let TYPE_WEIGHT = 2;
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
        
        let sim1 = TYPE_WEIGHT * getSimilarityTypeValue(this.types[0], pokemon.types[0])
                 + TYPE_WEIGHT * getSimilarityTypeValue(this.types[1], pokemon.types[1]);

        let sim2 = TYPE_WEIGHT * getSimilarityTypeValue(this.types[0], pokemon.types[1])
                 + TYPE_WEIGHT * getSimilarityTypeValue(this.types[1], pokemon.types[0]);        
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
    return 1- Math.abs(parseInt(a) - parseInt(b)) / (parseInt(max) - parseInt(min));
}

function getSimilarityTypeValue(type1, type2) {
    let similarities = 0;
    let size = type1.effectiveness.length;
    for(let i = 0; i < size; i++)
        similarities += getSimilarityNumberValue(type1.effectiveness[i], type2.effectiveness[i], 0, 2);
        //similarities += (type1.effectiveness[i] == type2.effectiveness[i]) ? 1 : 0;
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

function script() {
    let combats = [], old = [], pokemons = [];
    getFileContent("./data/combats_old.csv").then(res => {
        combats = res.split("\n").slice(1).map(r => r.split(","));
        console.log("combats: ", combats.length);
        getFileContent("./data/pokemon_old.csv").then(res => {
            old = res.split("\n").slice(1).map(r => r.split(",").slice(0, 2));
            console.log("old: ", old.length);
            getFileContent("./data/pokemon.csv").then(res => {
                pokemons = res.split("\n").slice(1).map(r => r.split(",").slice(0, 2));
                console.log("new: ", pokemons.length);
                writeNewFile("./data/combats.csv", combats, pokemons, old);
            });
        });
    });
}

function writeNewFile(path, combats, pokemons, old) {
    let newCombats = [];
    combats.forEach((c, i) => {
        let n = [0, 0, 0];
        let o1 = old[ parseInt(c[0]) - 1 ];
        let o2 = old[ parseInt(c[1]) - 1 ];
        for(p of pokemons)
            if(o1[1] == p[1]) {
                n[0] = p[0];
                if(o1[0] == c[2])
                    n[2] = p[0];
            }
        for(p of pokemons)
            if(o2[1] == p[1]) {
                n[1] = p[0];
                if(o2[1] == c[2])
                    n[2] = p[0];
            }
        if(n[0] && n[1] && n[2]) {
            newCombats.push(n.join(","));
            console.log(c, " -> ", n);
        }
    });
    setTimeout(() => {
        console.log("Writing...");
        fs.writeFile(path, newCombats.join("\n"));
    }, 1000);
}

function getFileContent(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, "utf-8", (error, result) => {
            resolve(result);
        });
    });
}