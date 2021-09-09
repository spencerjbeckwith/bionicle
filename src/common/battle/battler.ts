import BattleController from './battleController';
import StatCollection from '../data/stats';
import { BattlerTemplate } from '../data/battlerTemplate';
import { BattlerEvent, BattlerEventTypes } from '../data/events';
import { Action } from './actions';
import { Weapon } from '../data/inventory/weapons';
import { Equipment } from '../data/inventory/equipment';
import { UsableItem, InventoryItem } from '../data/inventory/items';
import { Accessory } from '../data/inventory/accessories';
import { AppliedStatusEffect, StatusEffect } from '../data/statuses';

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
    puppet: boolean;
    server: boolean;

    /** Indicates if this Battler is the current player for this instance of the game */
    isMe: boolean;

    /** Reference to the battler's current battle. */
    bc: BattleController | null;

    /** Indiciates if this battler is on the current player's side in a battle */
    isFriendly: boolean;

    /** Indicates if this battler is a Toa, which are typically controlled by other players */
    isToa: boolean;

    // These determine the options presented to a player or an AI each turn, along with the template's moves.
    /** What this Battler is using to attack */
    weapon: Weapon | null;
    /** What this Battler is wearing */
    equipment: Equipment | null;
    /** What accessory this Battler has equipped */
    accessory: Accessory | null;
    /** What items this Battler has access to */
    inventory: (Weapon | Equipment | Accessory | UsableItem | InventoryItem | null)[];
    /** Indicates which mask of the template's mask list is currently worn by this battler. */
    currentMask: number | null;

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
        this.puppet = false;
        this.server = false;

        // Equip our template's equipment
        this.equipWeapon(template.weapon);
        this.equipEquipment(template.equipment);
        this.equipAccessory(template.accessory);
        this.currentMask = null;
        if (this.template.masks.length > 0) {
            this.equipMask(0);
        }

        // Other inventory
        this.inventory = template.inventory;
        this.money = 0;

        // Battle control
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

        // For every status effect, tick down turns remaining by 1
        // If the turns left is 0, remove the status via removeStatus

        // ...?
    }

    /** Equips a weapon to this Battler. Returns the previous Weapon, or null if none was equipped. */
    equipWeapon(item: Weapon | null): Weapon | null {
        let value: Weapon | null = null;
        if (this.weapon) {
            value = this.weapon;
            this.weapon.deinit(this);
        }

        this.weapon = item;
        if (this.weapon) {
            this.weapon.init(this);
        }
        return value;
    }

    /** Equips equipment to this Battler. Returns the previous Equipment, or null if none was equipped. */
    equipEquipment(item: Equipment | null): Equipment | null {
        let value: Equipment | null = null;
        if (this.equipment) {
            value = this.equipment;
            this.equipment.deinit(this);
        }

        this.equipment = item;
        if (this.equipment) {
            this.equipment.init(this);
        }
        return value;
    }

    /** Equips an accessory to this Battler. Returns the previous Accessory, or null if none was equipped. */
    equipAccessory(item: Accessory | null): Accessory | null {
        let value: Accessory | null = null;
        if (this.accessory) {
            value = this.accessory;
            this.accessory.deinit(this);
        }

        this.accessory = item;
        if (this.accessory) {
            this.accessory.init(this);
        }
        return value;
    }

    /** Switches this battler to a different mask, as long as it is available on the template. Be mindful masks are referred to by their index in the template's mask array, so their order matters! */
    equipMask(templateMaskIndex: number | null): number | null {
        let value: number | null = null;
        if (this.currentMask !== null) {
            value = this.currentMask;
            this.template.masks[this.currentMask].deinit(this);
        }

        this.currentMask = templateMaskIndex;
        if (this.currentMask !== null) {
            this.template.masks[templateMaskIndex].init(this);
        }
        return value;
    }

    damage() {

    }

    heal() {

    }

    applyStatus(status: StatusEffect, turns: number) {
        // Make sure we don't already have the status
        // If so, just give it more turns
        // If not, push a new applied status effect instance to our statuseffects array
        //  Be sure to call the status init()!
    }

    removeStatus(status: StatusEffect) {
        // Make sure we have the status applied
        // Splice it out of our statuseffecst array
        //  Be sure to call the status deinit()!
    }

    removeAllStatuses() {
        // cycle all current statuses
        // call deinit
        // set status array to be empty
    }

    getStatusIndex(status: StatusEffect): number {
        // Returns -1 if no status found, otherwise returns its index in this.statusEffects array

        // cycle through until you find a status with a match, then break and return that index

        return -1;
    }

    die() {
        
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