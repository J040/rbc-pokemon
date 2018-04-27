require("../util/type.class.js")();

class Pokemon {
    constructor(dex, hp, attack, defense, spAttack, spDefense, speed, type1, type2 = type1) {
        this.dex = dex; 
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
        
        for(stat of Object.keys(STAT))
            sum += getSimilarityNumberValue(this[stat], pokemon[stat], STAT[stat].min, STAT[stat].max);
        
        
        let sim1 = 2 * getSimilarityTypeValue(this.types[0], pokemon.types[0])
                 + 2 * getSimilarityTypeValue(this.types[1], pokemon.types[1]);

        let sim2 = 2 * getSimilarityTypeValue(this.types[0], pokemon.types[1])
                 + 2 * getSimilarityTypeValue(this.types[1], pokemon.types[0]);

        sum += (sim1 > sim2) ? sim1 : sim2;
        
        return soma;
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

function getSimilarityTypeValue(ef1, ef2) {
    let similarities = 0;
    for(let i = 0; i < ef1.length; i++)
        similarities += (ef1[i] == ef2[i]) ? 1 : 0;
    return similarities;
}