class Pokemon {
    constructor(dex, hp, attack, defense, spAttack, spDefense, speed, types) {
        this.dex = dex; 
        this.hp = hp;
        this.attack = attack;
        this.defense = defense;
        this.spAttack = spAttack;
        this.spDefense = spDefense;
        this.speed = speed;
        this.types = types;
    }

    obterSimilaridade(pokemon) {
        let soma = 0;
        for(stat of Object.keys(STAT))
            soma += obterSimilaridadeNumero(this[stat], pokemon[stat], STAT[stat].min, STAT[stat].max);
        // SIMILARIDADE ENTRE TIPOS
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
    hp: Stat(1, 255),
    attack: Stat(5, 190),
    defense: Stat(5, 230),
    spAttack: Stat(10, 194),
    spDefense: Stat(20, 230),
    speed: Stat(5, 150)
}

function obterSimilaridadeNumero(a, b, min, max) {
    return 1- Math.abs(a - b) / (max - min);
}

function obterSimilaridadeTipo(a, b) {

}