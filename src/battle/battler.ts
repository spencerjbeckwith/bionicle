import BattleController from './battleController';
import StatCollection from '../data/stats';
import { BattlerTemplate } from '../data/battlerTemplate';
import { BattlerEvent, BattlerEventTypes } from '../data/events';
import { Action } from './actions';
import { Weapon } from '../data/inventory/weapons';
import { Equipment } from '../data/inventory/equipment';
import { InventoryItem } from '../data/inventory/items';
import { Accessory } from '../data/inventory/accessories';
import { AppliedStatusEffect } from '../data/statuses';

/** Represents an instance of a BattlerTemplate, to be used in battle for ephemeral actions and effects that change over time. */
class Battler extends EventTarget {
    /** The template from which this Battler draws its default configuration and stats */
    template: BattlerTemplate;

    /** The effective stats of this Battler */
    stats: StatCollection;

    /** Current applicable effects on this Battler */
    statusEffects: AppliedStatusEffect[];

    /** will be used for netcode - not implemeneted yet */
    myPlayer: null;

    /** Indicates if this Battler is the current player for this instance of the game */
    isMe: boolean;

    /** Reference to the battler's current battle. */
    bc: BattleController | null;

    /** Indiciates if this battler is on the current player's side in a battle */
    isFriendly: boolean;

    /** Indicates if this battler is a Toa, which are typically controlled by other players */
    isToa: boolean;

    // These determine the options presented to a player or an AI each turn, along with the template's moves.
    /** What this Battler is wielding in their right hand */
    rightHand: Weapon | null;
    /** What this Battler is wielding in their left hand */
    leftHand: Weapon | null;
    /** What this Battler is wearing */
    equipment: Equipment | null;
    /** What accessory this Battler has equipped */
    accessory: Accessory | null;
    /** What items this Battler has access to */
    inventory: (Weapon | Equipment | Accessory | InventoryItem | null)[];

    /** How much money this Battler is carrying - not applicable if not a Toa. */
    money: number;

    action: Action | null;

    /** Creates a new Battler instance based off of a BattlerTemplate. */
    constructor(template: BattlerTemplate, bc?: BattleController) {
        super();
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
        this.bc = bc || null;

        this.action = null;
    }

    addEventListener(type: BattlerEventTypes, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
        super.addEventListener(type, listener, options);
    }

    beginTurn() {
        this.dispatchEvent(new BattlerEvent('beforeTurn',{
            battler: this,
        }));

        // ...?
    }

    endTurn() {
        this.dispatchEvent(new BattlerEvent('afterTurn',{
            battler: this,
        }));

        // ...?
    }

    // Add methods to save and load a battler - like a Toa - in-between sessions? Via JSON?

    // Add methods when equipping or un-equipping weapons and stuff?

    // What other methods will go here? Different battle events?
    // Method: getAllActions

    // You'll want some AI methods:
    //  Determine what actions could be taken -> getAllActions
    //  Evaluate, using template AI weights, which actions have the most favorable effects via minimax... hm...
}

export default Battler;