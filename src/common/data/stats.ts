/** Represents either a collection of default stats when in a BattlerTemplate, or the current stat situation when in a Battler instance. */
class StatCollection {
    hp: number;
    maxHP: number;
    nova: number;
    maxNova: number;

    attack: number;
    defense: number;
    spAttack: number;
    spDefense: number;
    speed: number;

    evasion: number;
    accuracy: number;
    critical: number;

    level: number;
    xp: number;

    /** Use the constructor to generate a new StatCollection instance for a Battler instance, from a BattlerTemplate. */
    constructor(stats: StatCollection) {
        this.hp = stats.hp;
        this.maxHP = stats.maxHP;
        this.nova = stats.nova;
        this.maxNova = stats.maxNova;

        this.attack = stats.attack;
        this.defense = stats.defense;
        this.spAttack = stats.spAttack;
        this.spDefense = stats.spDefense;
        this.speed = stats.speed;

        this.evasion = stats.evasion;
        this.accuracy = stats.accuracy;
        this.critical = stats.critical;

        this.level = stats.level;
        this.xp = stats.xp;
    }

    // Helper methods to calculate stat changes, provided another StatCollection?
}

export default StatCollection;