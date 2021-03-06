import BattleController from './battleController';
import StatCollection from '../data/stats';
import { BattlerTemplate } from '../data/battlerTemplate';
import { BattlerBeginTurnEvent, BattlerEndTurnEvent, BattlerBeginRoundEvent, BattlerEndRoundEvent, BattlerDamageEvent, BattlerKnockOutEvent, BattlerEventTypes, BattlerHealEvent, BattlerStatusAppliedEvent, BattlerStatusRemovedEvent, BattlerEvent, BattlerBeforeAffectedEvent, BattlerReviveEvent } from '../data/events';
import { Action } from './actions';
import { Weapon } from '../data/inventory/weapons';
import { Equipment } from '../data/inventory/equipment';
import { Usable } from '../data/usable';
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

    fled: boolean;

    // These determine the options presented to a player or an AI each turn, along with the template's moves.
    /** What this Battler is using to attack */
    weapon: Weapon | null;
    /** What this Battler is wearing */
    equipment: Equipment | null;
    /** What accessory this Battler has equipped */
    accessory: Accessory | null;
    /** What items this Battler has access to in battle */
    inventory: (UsableItem | null)[];
    /** What other things this Battler is carrying */
    backpack: (Weapon | Equipment | Accessory | InventoryItem | null)[];
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
        this.fled = false;

        // Equip our template's equipment
        this.weapon = null;
        this.equipment = null;
        this.accessory = null;
        this.equipWeapon(template.weapon);
        this.equipEquipment(template.equipment);
        this.equipAccessory(template.accessory);
        this.currentMask = null;
        if (this.template.masks.length > 0) {
            this.equipMask(0);
        }

        // Other inventory
        this.inventory = [ ...template.inventory ];
        this.backpack = [ ...template.backpack ];
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

    /** Dispatches event triads for a variety of Battlers. The before events will all be fired, then the executors called, and then all after events fired. "execute" is an array of functions that must each return a Promise. */
    static dispatchMultipleEventTriads<ev1, ev2>(battlers: Battler[], before: (ev1 & BattlerEvent)[], after: (ev2 & BattlerEvent)[], execute: Promise<void>[]): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (battlers.length === 0) {
                // If no battlers are to be affected, resolve immediately
                console.warn('Attempted to dispatch multiple triads on empty Battler array!');
                return resolve();
            }

            if (battlers.length !== before.length || battlers.length !== after.length || battlers.length !== execute.length) {
                console.error(`Failed to dispatch multiple event triads! Array length mismatch: battlers ${battlers.length}, before ${before.length}, after ${after.length}, execute ${execute.length}`);
                return reject();
            }

            let beforePromise = battlers[0].dispatchPromisedEvent(before[0]);
            for (let b = 1; b < battlers.length; b++) {
                // Chain more events on
                beforePromise = beforePromise.then(() => {
                    return battlers[b].dispatchPromisedEvent(before[b]);
                });
            }

            beforePromise.then(() => {
                // All before affected events done - run the move's effect on each battler
                let middlePromise = execute[0];
                for (let b = 1; b < battlers.length; b++) {
                    // Chain more uses
                    middlePromise = middlePromise.then(() => execute[b]);
                }

                middlePromise.then(() => {
                    // All uses done - fire the BattlerAfterAffectEvents

                    let afterPromise = battlers[0].dispatchPromisedEvent(after[0]);
                    for (let b = 1; b < battlers.length; b++) {
                        afterPromise = afterPromise.then(() => {
                            return battlers[b].dispatchPromisedEvent(after[b]);
                        });
                    }

                    afterPromise.then(() => {
                        // ALL DONE! Sheesh, finally.
                        resolve();
                    }).catch((err) => {
                        // afterPromise rejected promise rejected
                        reject(err);
                    });
                }).catch((err) => {
                    // execute method rejected
                    reject(err);
                });
            }).catch((err) => {
                // beforePromise promise rejected
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
                    return firstEvent.action.execute();
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
        if (this.currentMask !== null && typeof templateMaskIndex === 'number') {
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
    damage(amount: number, stat: 'hp' | 'nova' = 'hp', cause: Action | null = null, instantaneous = false): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.dispatchPromisedEvent<BattlerDamageEvent>(new BattlerDamageEvent(this, amount, stat, cause, instantaneous)).then((event) => {
                event.amount = Math.round(event.amount);
                if (stat === 'hp') {
                    this.stats.hp -= event.amount;
                    if (this.stats.hp <= 0) {
                        // This damage killed us
                        this.stats.hp = 0;

                        // effect promise chain here?
                        this.knockOut(cause).then(() => {
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
    heal(amount: number, stat: 'hp' | 'nova' = 'hp', cause: Action | null = null, instantaneous = false): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.dispatchPromisedEvent(new BattlerHealEvent(this, amount, stat, cause, instantaneous)).then((event) => {
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
    knockOut(cause: Action | null = null, instantaneous = false): Promise<void> {
        return new Promise((resolve,reject) => {
            this.dispatchPromisedEvent(new BattlerKnockOutEvent(this, cause, instantaneous)).then((event) => {
                // Remove all our listeners and set our KO flag - don't remove all listeners, though
                this.removeAllStatuses(true);
                this.isKOed = true;

                if (this.isToa || this.template.surviveKO) {
                    // Don't die for real - just KO
                    if (instantaneous) {
                        resolve();
                    } else {

                        // effect promise chain here?

                        resolve();
                    }
                } else {
                    // Die for real
                    // call to BattleController to remove us from the battle?
                    if (instantaneous) {
                        resolve();
                    } else {
                        
                        // effect promise chain here?

                        resolve();
                    }
                }
            }).catch((err) => {
                console.error(`Battler ${this.template.name}: Rejected KO event!`);
                reject(err);
            });
        });
    }

    /** Revives the Battler. */
    revive(newHP: number, cause: Action | null = null, instantaneous = false): Promise<void> {
        return new Promise((resolve, reject) => {
            // Unlike KO event, restore us first and then fire the event
            this.stats.hp = Math.min(this.stats.maxHP, Math.round(newHP));
            this.isKOed = false;
            this.dispatchPromisedEvent(new BattlerReviveEvent(this, cause, instantaneous)).then((event) => {
                if (instantaneous) {
                    resolve();
                } else {

                    // effect promise chain here?

                    resolve();
                }
            }).catch((err) => {
                console.error(`Battler ${this.template.name}: Rejected revive event!`);
                reject(err);
            });
        })
    }

    /** Returns what side in a battle we belong to. Returns "allies" or "foes". */
    getSide(): 'allies' | 'foes' {
        if (this.bc?.allies.includes(this)) {
            return 'allies';
        } else {
            return 'foes';
        }
    }

    /** Returns the enemy side in a battle we belong to. Returns "allies" or "foes",. */
    getOtherSide(): 'allies' | 'foes' {
        const mySide = this.getSide();
        if (mySide === 'allies') {
            return 'foes';
        } else {
            return 'allies';
        }
    }

    /** Returns an array of all possible Actions this Battler could do with a Usable, depending on its targeting properties. */
    getUseTargets(thing: Usable, instantaneous = false): Action[] {
        const possibilities: Action[] = [];
        if (!this.bc) { return []; } // No BattleController set? Then no targets

        const friendlies = this.bc[this.getSide()];
        const enemies = this.bc[this.getOtherSide()];

        if (thing.targetType === 'single' && thing.defaultTarget === 'friendly') {
            // Add an action for every friendly
            for (let f = 0; f < friendlies.length; f++) {
                const friendly = friendlies[f];
                possibilities.push(new Action('use', this, friendly, thing, instantaneous));
            }
        } else if (thing.targetType === 'single' && thing.defaultTarget === 'enemy') {
            // Add an action for every enemy
            for (let f = 0; f < enemies.length; f++) {
                const enemy = enemies[f];
                possibilities.push(new Action('use', this, enemy, thing, instantaneous));
            }
        } else if (thing.targetType === 'multiple' && thing.defaultTarget === 'friendly') {
            // Add one action for all friendlies
            possibilities.push(new Action('use', this, friendlies, thing, instantaneous));
        } else if (thing.targetType === 'multiple' && thing.defaultTarget === 'enemy') {
            // Add one action or all enemies
            possibilities.push(new Action('use', this, enemies, thing, instantaneous));
        } else {
            // Add one action for everyone
            possibilities.push(new Action('use', this, null, thing, instantaneous));
        }

        return possibilities;
    }

    /** Returns an array of all possible Actions this Battler could do. Should be called at the start of every turn. */
    getAllActions(instantaneous = false): Action[] {
        // Here's an important distinction in our vocabulary: "allies"/"friendlies" vs. "foes"/"enemies"
        //  "allies" is the player team, while "friendlies" refers to Battlers on the same side as this one
        //  "foes" is the enemy, AI team, while "enemies" refers to Battlers on the opposite side as this one
        // For example: the allies' friendlies are the allies, the allies' enemies are the foes.
        // And the foes' friendlies are the foes, and the foes' enemies are the allies.

        // In this method: should we assign a "weight" to each action to help the AI?

        const possibilities: Action[] = [];
        if (!this.bc) { return []; } // No BattleController? Then no actions

        // For every enemy:
        const enemies = this.bc[this.getOtherSide()];
        for (let f = 0; f < enemies.length; f++) {
            // Add a basic attack possiblity
            const enemy = enemies[f];
            possibilities.push( new Action('attack', this, enemy, null, instantaneous));

            // Add an attack possiblity for each of our elements
            for (let e = 0; e < this.template.elements.length; e++) {
                const action = new Action('attack', this, enemy, null, instantaneous);
                action.element = this.template.elements[e];
                possibilities.push(action);
            }
        }

        // For every move we know, add action for each move's target
        for (let m = 0; m < this.template.moves.length; m++) {
            const move = this.template.moves[m];
            if (move) {
                possibilities.push(...this.getUseTargets(move, instantaneous));
            }
        }

        // For every item we have, add an action for each item's target
        for (let i = 0; i < this.inventory.length; i++) {
            const item = this.inventory[i];
            if (item) {
                possibilities.push(...this.getUseTargets(item, instantaneous));
            }
        }
        
        // Add a mask action for our current mask
        if (this.currentMask !== null) {
            possibilities.push(...this.getUseTargets(this.template.masks[this.currentMask], instantaneous));
        }

        // Add a pass action
        possibilities.push(new Action('pass', this, null, null, instantaneous));

        // New action types go here

        // Filter out impossible actions and return the rest
        return possibilities.filter((action) => {
            return !action.isImpossible();
        });
    }

    // TO-DO:

    determineAction(bc: BattleController, instantaneous = false): Promise<Action> {
        if (!this.bc || this.bc.battleOver) {
            // Sets controller if it hasn't been set yet
            this.bc = bc;
        }

        return new Promise((resolve, reject) => {

            // In client context:

            // If local player offline, open HUD and resolve with whatever the player picks
            // If not local player offline, use local AI

            // If local player online, open HUD but DON'T resolve with the Action - send it to the server instead. Then wait for the server confirmation response, THEN resolve with our action
            // If not local player online, wait for server response with our action and resolve with it


            // In server context:
            
            // If an NPC, use AI and send the resulting action
            // If a player, wait for the client to propose their action. Then confirm it and wait for the rest of the actions to be ready

            // Eh... My brain hurts. This is all probably gonna have to split into different methods in different places. Where? Gosh I have no clue.

            resolve(new Action('attack',this,this));
        });
    }

    // Add methods to save and load a battler - like a Toa - in-between sessions? Via JSON?
}

export default Battler;