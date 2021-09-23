import { Action } from '../battle/actions';
import BattleController from '../battle/battleController';
import Battler from '../battle/battler';
import { PromisedEvent } from '../promisedEventTarget';
import { UsableItem } from './inventory/items';
import { StatusEffect } from './statuses';

type BattleControllerEventTypes = 'start' | 'end' | 'beginRound' | 'endRound';

type BattlerEventTypes = 'start' | 'end' | 'beginTurn' | 'endTurn' | 'beginRound' | 'endRound' | 'flee' | 'given' 
    | 'damage' | 'heal' | 'knockOut' | 'revive' | 'statusApplied' | 'statusRemoved' | 'beforeAffected' | 'afterAffected';

// BATTLER EVENTS

class BattlerEvent extends PromisedEvent {
    constructor(public type: BattlerEventTypes, public battler: Battler, instantaneous = false) {
        super(type, instantaneous);
    }
}

/** Fires immediately before this Battler executes an action. */
class BattlerBeginTurnEvent extends BattlerEvent {
    constructor(battler: Battler, public action: Action, instantaneous = false) {
        super('beginTurn', battler, instantaneous);
    }
}

/** Fires after this Battler executes an action, after each target is affected. */
class BattlerEndTurnEvent extends BattlerEvent {
    constructor(battler: Battler, public action: Action, instantaneous = false) {
        super('endTurn', battler, instantaneous);
    }
}

/** Fires at the beginning of a round, before any Battler takes an action, in same order that actions are taken. */
class BattlerBeginRoundEvent extends BattlerEvent {
    constructor(battler: Battler, instantaneous = false) {
        super('beginRound', battler, instantaneous);
    }
}

/** Fires at the end of a round, after every Battler takes their action, in same order that actions are taken. */
class BattlerEndRoundEvent extends BattlerEvent {
    constructor(battler: Battler, instantaneous = false) {
        super('endRound', battler, instantaneous);
    }
}

/** Fires immediately before this Battler takes a flee action. */
class BattlerFleeEvent extends BattlerEvent {
    constructor(battler: Battler, public success: boolean, instantaneous = false) {
        super('flee', battler, instantaneous);
    }
}

/** Fires immediately before this Battler is given an item. */
class BattlerGivenEvent extends BattlerEvent {
    constructor(battler: Battler, public item: UsableItem, public giver: Battler, instantaneous = false) {
        super('given', battler, instantaneous);
    }
}

/** Fires immediately before any HP or nova damage is dealt to this Battler. */
class BattlerDamageEvent extends BattlerEvent {
    constructor(battler: Battler, public amount: number, public stat: 'hp' | 'nova' = 'hp', public cause: Action | null, instantaneous = false) {
        super('damage', battler, instantaneous);
    }
}

/** Fires immediately before any HP or nova is restored to this Battler. */
class BattlerHealEvent extends BattlerEvent {
    constructor(battler: Battler, public amount: number, public stat: 'hp' | 'nova' = 'hp', public cause: Action | null, instantaneous = false) {
        super('heal', battler, instantaneous);
    }
}

/** Fires before sustained HP damage causes this Battler to be KOed, but after the damage is dealt. */
class BattlerKnockOutEvent extends BattlerEvent {
    constructor(battler: Battler, public cause: Action | null, instantaneous = false) {
        super('knockOut', battler, instantaneous);
    }
}

/** Fires after this Battler recovers from a KO. */
class BattlerReviveEvent extends BattlerEvent {
    constructor(battler: Battler, public cause: Action | null, instantaneous = false) {
        super('revive', battler, instantaneous);
    }
}

/** Fires immediately when any status is applied to this Battler initially, but not when turns are added to an already-applied status. */
class BattlerStatusAppliedEvent extends BattlerEvent {
    constructor(battler: Battler, public status: StatusEffect, public turns: number, instantaneous = false) {
        super('statusApplied', battler, instantaneous);
    }
}

/** Fires immediately when any status is removed from this Battler, including when it naturally expires or is cured. Is not fired when all statuses are cleared at once by Battler.RemoveAllStatuses(). */
class BattlerStatusRemovedEvent extends BattlerEvent {
    constructor(battler: Battler, public status: StatusEffect, public forced = false, instantaneous = false) {
        super('statusRemoved', battler, instantaneous);
    }
}

/** Fires immediately before any action that targets this Battler executes. */
class BattlerBeforeAffectedEvent extends BattlerEvent {
    constructor(battler: Battler, public action: Action, instantaneous = false) {
        super('beforeAffected', battler, instantaneous);
    }
}

/** Fires immediately after any action that targets this Battler has executed. */
class BattlerAfterAffectedEvent extends BattlerEvent {
    constructor(battler: Battler, public action: Action, instantaneous = false) {
        super('afterAffected', battler, instantaneous);
    }
}

// BATTLE CONTROLLER EVENTS

class BattleControllerEvent extends PromisedEvent {
    constructor(public type: BattleControllerEventTypes, public bc: BattleController, instantaneous = false) {
        super(type, instantaneous);
    }
}

// ...?

export { 
    BattleControllerEventTypes, 
    BattlerEventTypes, 
    BattlerEvent,
    BattleControllerEvent,

    BattlerBeginTurnEvent,
    BattlerEndTurnEvent,
    BattlerBeginRoundEvent,
    BattlerEndRoundEvent,
    BattlerFleeEvent,
    BattlerGivenEvent,

    BattlerDamageEvent,
    BattlerHealEvent,
    BattlerKnockOutEvent,
    BattlerReviveEvent,
    BattlerStatusAppliedEvent,
    BattlerStatusRemovedEvent,
    BattlerBeforeAffectedEvent,
    BattlerAfterAffectedEvent,
}