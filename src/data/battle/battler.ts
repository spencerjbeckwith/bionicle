import { BattlerTemplate } from './battlerTemplate';
import StatCollection from './stats';

/** Represents an instance of a BattlerTemplate, to be used in battle for ephemeral actions and effects that change over time. */
class Battler {
    /** The template from which this Battler draws its default configuration and stats */
    template: BattlerTemplate;

    /** The effective stats of this Battler */
    stats: StatCollection;

    /** Current applicable effects on this Battler */
    statusEffects: null[]; // TYPE ME

    /** will be used for netcode - not implemeneted yet */
    myPlayer: null;

    /** Indicates if this Battler is the current player for this instance of the game */
    isMe: boolean;

    /** Indiciates if this battler is on the current player's side in a battle */
    isFriendly: boolean;

    /** Indicates if this battler is a Toa, which are typically controlled by other players */
    isToa: boolean;

    // These determine the options presented to a player or an AI each turn, along with the template's moves.
    /** What this Battler is wielding in their right hand */
    rightHand: null; // TYPE ME
    /** What this Battler is wielding in their left hand */
    leftHand: null; // TYPE ME
    /** What this Battler is wearing */
    equipment: null; // TYPE ME
    /** What accessory this Battler has equipped */
    accessory: null; // TYPE ME
    /** What items this Battler has access to */
    inventory: null[]; // TYPE ME

    /** How much money this Battler is carrying - not applicable if not a Toa. */
    money: number;

    /** Creates a new Battler instance based off of a BattlerTemplate. */
    constructor(template: BattlerTemplate) {
        this.template = template;
        this.stats = new StatCollection(template.stats);
        this.statusEffects = [];
        
        this.myPlayer = null;
        this.isMe = false;
        this.isFriendly = false;
        this.isToa = false;

        this.rightHand = template.rightHand;
        this.leftHand = template.leftHand;
        this.equipment = template.equipment;
        this.accessory = template.accessory;
        this.inventory = template.inventory;
        this.money = 0;
    }

    // Add methods to save and load a battler - like a Toa - in-between sessions?

    // What other methods will go here? Different battle events?
}

// Player Toa will be Battler instances that persist between battles - just be sure to wipe the statusEffects when appropriate.
// Toa are based on unique templates each, which are NOT part of the general battlerTemplates list. They can and should be mutated when appropriate.
// For example, to teach a Toa a new move or change their name, you'd have to modify the template

// A Battler instance's stats indicate their effective stats, including whatever modifiers you'll add.
// A BattlerTemplate instance's stats indicate that Battler's default stats - the values to set their effective stats to when modifiers are over, for example
// A Toa's template's stats must increase when they level up.

export default Battler;