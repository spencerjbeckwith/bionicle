import BattleController from './battleController';
import StatCollection from '../data/stats';
import { BattlerTemplate } from '../data/battlerTemplate';
import { BattlerBeginTurnEvent, BattlerEndTurnEvent, BattlerBeginRoundEvent, BattlerEndRoundEvent, BattlerDamageEvent, BattlerKnockOutEvent, BattlerEventTypes, BattlerHealEvent, BattlerStatusAppliedEvent, BattlerStatusRemovedEvent, BattlerEvent } from '../data/events';
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

    /** Dispatches two BattlerEvents before and after a given executor, which is provided the first event and must return a promise. Should be to surround a promise with events on either side, before and after events. Executes all listeners on the provided events as well as the executor in the given order. When all done, this method's promise resolves to the second event. */
    dispatchEventTriad<ev1, ev2>(before: ev1 & BattlerEvent, after: ev2 & BattlerEvent, execute: (firstEvent: ev1 & BattlerEvent) => Promise<void>): Promise<ev2 & BattlerEvent> {
        return new Promise<ev2 & BattlerEvent>((resolve, reject) => {
            // Fire first event
            this.dispatchPromisedEvent(before).then((firstEvent) => {
                // First event resolved, do our execution
                execute(firstEvent).then(() => {
                    // Execution done, fire second event
                    this.dispatchPromisedEvent(after).then((secondEvent) => {
                        // Second event done, resolve outer promise
                        resolve(secondEvent);
                    }).catch((err) => {
                        console.error(`Battler ${this.template.name}: Event triad rejected second event!`);
                        reject(err);
                    });
                }).catch((err) => {
                    console.error(`Battler ${this.template.name}: Event triad rejected execution!`);
                    reject(err);
                })
            }).catch((err) => {
                console.error(`Battler ${this.template.name}: Event triad rejected first event!`);
                reject(err);
            });
        });
    }

    /** Executes an action. The action must have this Battler as its executor. This also fires the BattlerBeginTurnEvent before the action, and the BattlerAfterTurnEvent after the action. Returns a promise which resolves to the initial action after all events have fired. */
    doTurn(action: Action, instantaneous = false): Promise<Action> {
        return new Promise((resolve, reject) => {
            if (action.executor !== this) {
                // We should only execute our own actions!
                reject(`Battler ${this.template.name}: Battler-action mismatch!`);
            } else {
                this.dispatchEventTriad(new BattlerBeginTurnEvent(this, action, instantaneous), new BattlerEndTurnEvent( this, action, instantaneous), (firstEvent) => {
                    return firstEvent.action.execute(this.bc);
                }).then((secondEvent) => {
                    resolve(secondEvent.action);
                }).catch((err) => {
                    console.error(`Battler ${this.template.name}: doTurn() event triad rejected!`);
                    reject(err);
                });
            }
        });
    }

    /** Should be called at the start of every round, before any Battler begins their actions. */
    beginRound(instantaneous = false): Promise<BattlerBeginRoundEvent> {
        return this.dispatchPromisedEvent(new BattlerBeginRoundEvent(this, instantaneous));
    }

    /** Should be called at the end of every round, after all Battler's actions are done. */
    endRound(instantaneous = false): Promise<BattlerEndRoundEvent> {
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
                    resolve(this.dispatchPromisedEvent(new BattlerEndRoundEvent(this, instantaneous)));
                }).catch((err) => {
                    console.error(`Battler ${this.template.name}: Rejected status removal!`);
                    reject(err);
                });
            } else {
                // No status to remove: resolve with our new promise
                resolve(this.dispatchPromisedEvent(new BattlerEndRoundEvent(this, instantaneous)));
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
    applyStatus(status: StatusEffect, turns: number, instantaneous = false): Promise<BattlerStatusAppliedEvent | null> {
        return new Promise((resolve, reject) => {
            if (this.template.immunities.includes(status)) {
                // We're immune, ha ha
                resolve(null);
            } else {
                const index = this.getStatusIndex(status);
                if (index === null) {
                    this.dispatchPromisedEvent(new BattlerStatusAppliedEvent(this,status, turns, instantaneous)).then((event) => {
                        // Add status and call init on us
                        this.statusEffects.push(new AppliedStatusEffect(event.status, Math.min(event.turns, status.maxTurns)));
                        event.status.init(this);

                        // effect?
                        resolve(event);
                    }).catch((err) => {
                        console.error(`Battler ${this.template.name}: Rejected status applied event!`);
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
    removeStatus(status: StatusEffect, force = false, instantaneous = false): Promise<BattlerStatusRemovedEvent | null> {
        return new Promise((resolve, reject) => {
            const index = this.getStatusIndex(status);
            if (index !== null) {
                if (status.curable || force) {
                    return this.dispatchPromisedEvent(new BattlerStatusRemovedEvent(this, status, force, instantaneous)).then((event) => {
                        // We have the status, splice its index out and call deinit
                        this.statusEffects.splice(index,1);
                        status.deinit(this);

                        // effect?
                        resolve(event);
                    }).catch((err) => {
                        console.error(`Battler ${this.template.name}: Rejected status removed event!`);
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
    damage(amount: number, stat: 'hp' | 'nova' = 'hp', source: 'attack' | 'special' | 'item' | 'status' | 'mask' = 'attack', instantaneous = false): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.dispatchPromisedEvent<BattlerDamageEvent>(new BattlerDamageEvent(this, amount, stat, source, instantaneous)).then((event) => {
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
                console.error(`Battler ${this.template.name}: Rejected damage event!`);
                reject(err);
            });
        });
    }

    /** Restores this Battler's HP or nova by a certain amount. */
    heal(amount: number, stat: 'hp' | 'nova' = 'hp', source: 'special' | 'item' | 'status' | 'mask' = 'item', instantaneous = false): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.dispatchPromisedEvent(new BattlerHealEvent(this, amount, stat, source, instantaneous)).then((event) => {
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
                console.error(`Battler ${this.template.name}: Rejected heal event!`);
                reject(err);
            });
        });
    }

    /** KOs the Battler. */
    knockOut(cause: 'attack' | 'special' | 'item' | 'status' | 'mask' = 'attack', instantaneous = false): Promise<void> {
        return new Promise((resolve,reject) => {
            this.dispatchPromisedEvent(new BattlerKnockOutEvent(this, cause, instantaneous)).then((event) => {
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
                console.error(`Battler ${this.template.name}: Rejected KO event!`);
                reject(err);
            });
        });
    }

    /** Returns what side in a battle we belong to. Return "allies", "foes", or false if this Battler is neither... somehow. */
    getSide(): 'allies' | 'foes' | false {
        if (!this.bc) {return false;}
        if (this.bc.allies.includes(this)) {
            return 'allies';
        } else if (this.bc.foes.includes(this)) {
            return 'foes';
        }

        return false;
    }

    determineAction(bc: BattleController, instantaneous = false): Promise<Action> {
        if (!this.bc || this.bc.battleOver) {
            // Set controller if it hasn't been set yet
            this.bc = bc;
        }
        return new Promise((resolve, reject) => {

            // If the local player, open HUD and allow for action selection

            // If not the local player and playing online, wait for an online action response

            // If not the local player and playing locally, use AI to evaluate best action

            resolve(new Action('attack',this,null));

        });
    }

    getAllActions(): Action[] {
        const possibilities: Action[] = [];

        // Add an attack action for every battler on the opposite side

        // Add a special action for every valid target of each move

        // Add an item action for every valid target of each item
        
        // Add a mask action for every valid target of every mask

        // Add a protect action for every valid target of a protect move

        return [];
    }

    // Add methods to save and load a battler - like a Toa - in-between sessions? Via JSON?
}

export default Battler;