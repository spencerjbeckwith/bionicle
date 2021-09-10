import BattleController from './battleController';
import StatCollection from '../data/stats';
import { BattlerTemplate } from '../data/battlerTemplate';
import { BattlerBeginTurnEvent, BattlerEndTurnEvent, BattlerDamageEvent, BattlerKnockOutEvent, BattlerEvent, BattlerEventTypes, BattlerHealEvent, BattlerStatusAppliedEvent, BattlerStatusRemovedEvent } from '../data/events';
import { Action } from './actions';
import { Weapon } from '../data/inventory/weapons';
import { Equipment } from '../data/inventory/equipment';
import { UsableItem, InventoryItem } from '../data/inventory/items';
import { Accessory } from '../data/inventory/accessories';
import { AppliedStatusEffect, StatusEffect } from '../data/statuses';
import { PromisedEventTarget } from '../promisedEventTarget';

/** Represents an instance of a BattlerTemplate, to be used in battle for ephemeral actions and effects that change over time. */
class Battler extends PromisedEventTarget {
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
    isKOed: boolean;

    /** Creates a new Battler instance based off of a BattlerTemplate. */
    constructor(public template: BattlerTemplate, bc?: BattleController) {
        super();
        this.stats = new StatCollection(template.stats);
        this.statusEffects = [];
        
        this.myPlayer = null;
        this.isMe = false;
        this.isFriendly = false;
        this.isToa = false;
        this.isKOed = false;
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

    addPromisedEventListener<ev>(type: BattlerEventTypes, listener: (event: ev) => Promise<ev>, priority?: number, once?: boolean) {
        super.addPromisedEventListener(type, listener, priority, once);
    }

    beginTurn(): Promise<BattlerBeginTurnEvent> {
        return super.dispatchPromisedEvent(new BattlerBeginTurnEvent(this));
    }

    endTurn(): Promise<BattlerEndTurnEvent> {
        return new Promise((resolve, reject) => {
            // This looks nasty at first but lemme explain
            // To return the correct event, we must asynchronously dispatch the removeStatus event when statuses get removed
            // If there are none, it makes no difference. Otherwise, the event's listeners will fire before the battler's turn ends and this function's returned promise resolves.

            // Get all the statuses that have to be removed
            let toRemove: StatusEffect[] = [];
            for (let i = 0; i < this.statusEffects.length; i++) {
                const appliedStatus = this.statusEffects[i];
                appliedStatus.turnsRemaining--;
                if (appliedStatus.turnsRemaining <= 0) {
                    // Out of turns, remove the status
                    toRemove.push(appliedStatus.status);
                }
            }

            if (toRemove.length > 0) {
                // Remove the statuses
                let promise = this.removeStatus(toRemove[0],true);
                for (let i = 1; i < toRemove.length; i++) {
                    // Chain together status removal events into one promise
                    promise = promise.then(() => {
                        return this.removeStatus(toRemove[i],true);
                    });
                }

                // Resolve our main promise only after the statuses are removed
                promise.then(() => {
                    resolve(super.dispatchPromisedEvent(new BattlerEndTurnEvent(this)));
                }).catch((err) => {
                    reject(err);
                });
            } else {
                // No status to remove: resolve with our new promise
                resolve(super.dispatchPromisedEvent(new BattlerEndTurnEvent(this)));
            } 
        });
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

    /** Applies a new status to this Battler. If the status is already present, the turns are added together up the status's max possible turns. Returns a promise which will only reject if there's an error on the BattlerStatusAppliedEvent. */
    applyStatus(status: StatusEffect, turns: number): Promise<BattlerStatusAppliedEvent | null> {
        return new Promise((resolve, reject) => {
            if (this.template.immunities.includes(status)) {
                // We're immune, ha ha
                resolve(null);
            } else {
                const index = this.getStatusIndex(status);
                if (index === null) {
                    this.dispatchPromisedEvent(new BattlerStatusAppliedEvent(this,status,turns)).then((event) => {
                        // Add status and call init on us
                        this.statusEffects.push(new AppliedStatusEffect(event.status, Math.min(event.turns, status.maxTurns)));
                        event.status.init(this);

                        // effect?
                        resolve(event);
                    }).catch((err) => {
                        reject(err);
                    });
                } else {
                    // We already have init'ed this status, so just add more turns
                    this.statusEffects[index].turnsRemaining = Math.min(this.statusEffects[index].turnsRemaining + turns, status.maxTurns);

                    // effect?
                    resolve(null);
                }
            }
        });
    }

    /** Removes a specific curable status from this Battler. If force is true, it will be removed even if it is not curable. Returns a promise which will only reject if there's an error on the BattlerStatusRemovedEvent. */
    removeStatus(status: StatusEffect, force = false): Promise<BattlerStatusRemovedEvent | null> {
        return new Promise((resolve, reject) => {
            const index = this.getStatusIndex(status);
            if (index !== null) {
                if (status.curable || force) {
                    return this.dispatchPromisedEvent(new BattlerStatusRemovedEvent(this,status,force)).then((event) => {
                        // We have the status, splice its index out and call deinit
                        this.statusEffects.splice(index,1);
                        status.deinit(this);

                        // effect?
                        resolve(event);
                    }).catch((err) => {
                        reject(err);
                    });
                }
            }
            
            // If we don't have the status, nothing happens
            resolve(null);
        });
    }

    /** Removes all curable statuses from this Battler. If force is true, all statuses will be removed, including ones that aren't curable. THIS DOES NOT CAUSE THE BattlerStatusRemovedEvent to fire!*/
    removeAllStatuses(force = false) {
        this.statusEffects = this.statusEffects.filter(appliedStatus => {
            const status = appliedStatus.status;
            if (status.curable || force) {
                // Status removable, call deinit and return false so its removed by filter
                status.deinit(this);
                
                // dispatch status removed event?

                return false;
            }
            return true; // Could not remove this status, so keep in our array
        },this);
    }

    /** Returns the index of a status effect applied to this Battler. If this status isn't present, returns null. */
    getStatusIndex(status: StatusEffect): number | null {
        for (let i = 0; i < this.statusEffects.length; i++) {
            const appliedStatus = this.statusEffects[i];
            if (appliedStatus.status === status) {
                return i;
            }
        }

        return null;
    }

    /** Damages this Battler's HP or nova by a certain amount. */
    damage(amount: number, stat: 'hp' | 'nova' = 'hp', source: 'attack' | 'special' | 'item' | 'status' | 'mask' = 'attack'): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.dispatchPromisedEvent<BattlerDamageEvent>(new BattlerDamageEvent(this,amount,stat,source)).then((event) => {
                event.amount = Math.round(event.amount);
                if (stat === 'hp') {
                    this.stats.hp -= event.amount;
                    if (this.stats.hp <= 0) {
                        // This damage killed us
                        this.stats.hp = 0;

                        // effect promise chain here?
                        this.knockOut(source).then(() => {
                            resolve();
                        });
                    } else {
                        // We survived the damage
        
                        // effect promise chain here?
                        resolve();
                    }
                } else {
                    this.stats.nova -= event.amount;
                    if (this.stats.nova < 0) {
                        this.stats.nova = 0;
                    }

                    // effect promise chain here?

                    resolve();
                }
            }).catch((err) => {
                reject(err);
            });
        });
    }

    /** Restores this Battler's HP or nova by a certain amount. */
    heal(amount: number, stat: 'hp' | 'nova' = 'hp', source: 'special' | 'item' | 'status' | 'mask' = 'item'): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.dispatchPromisedEvent(new BattlerHealEvent(this,amount,stat,source)).then((event) => {
                event.amount = Math.round(event.amount);
                if (stat === 'hp') {
                    this.stats.hp += event.amount;
                    if (this.stats.hp > this.stats.maxHP) {
                        this.stats.hp = this.stats.maxHP;
                    }

                    // effect promise chain here?
                    resolve();
                } else {
                    this.stats.nova += event.amount;
                    if (this.stats.nova > this.stats.maxNova) {
                        this.stats.nova = this.stats.maxNova;
                    }

                    // effect promise chain here?
                    resolve();
                }
            }).catch((err) => {
                reject(err);
            });
        });
    }

    /** KOs the Battler. */
    knockOut(cause: 'attack' | 'special' | 'item' | 'status' | 'mask' = 'attack'): Promise<void> {
        return new Promise((resolve,reject) => {
            this.dispatchPromisedEvent(new BattlerKnockOutEvent(this,cause)).then((event) => {
                this.isKOed = true;
                if (this.isToa) {
                    // Don't die for real - just KO

                    // effect promise chain here?
                    resolve();
                } else {
                    // Die for real

                    // call to BattleController to remove us from the battle?

                    // effect promise chain here?
                    resolve();
                }
            }).catch((err) => {
                reject(err);
            });
        });
    }

    // Add methods to save and load a battler - like a Toa - in-between sessions? Via JSON?

    // What other methods will go here? Different battle events?
    // Method: getAllActions

    // You'll want some AI methods:
    //  Determine what actions could be taken -> getAllActions
    //  Evaluate, using template AI weights, which actions have the most favorable effects via minimax... hm...
}

export default Battler;