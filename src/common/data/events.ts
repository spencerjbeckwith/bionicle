import BattleController from '../battle/battleController';
import Battler from '../battle/battler';
import { PromisedEvent } from '../promisedEventTarget';
import { StatusEffect } from './statuses';

type BattleControllerEventTypes = 'start' | 'end' | 'turnStart' | 'turnEnd';
type BattlerEventTypes = 'start' | 'end' | 'beginTurn' | 'endTurn' 
    | 'damage' | 'heal' | 'knockOut' | 'statusApplied' | 'statusRemoved'
    | 'beforeAction' | 'afterAction' ;

// BATTLER EVENTS

class BattlerEvent extends PromisedEvent {
    constructor(public type: BattlerEventTypes, public battler: Battler) {
        super(type);
    }
}

class BattlerBeginTurnEvent extends BattlerEvent {
    constructor(battler: Battler) {
        super('beginTurn',battler);
    }
}

class BattlerEndTurnEvent extends BattlerEvent {
    constructor(battler: Battler) {
        super('endTurn',battler);
    }
}

class BattlerDamageEvent extends BattlerEvent {
    constructor(battler: Battler, public amount: number, public stat: 'hp' | 'nova' = 'hp', public source: 'attack' | 'special' | 'item' | 'status' | 'mask' = 'attack') {
        super('damage',battler);
    }
}

class BattlerHealEvent extends BattlerEvent {
    constructor(battler: Battler, public amount: number, public stat: 'hp' | 'nova' = 'hp', public source: 'special' | 'item' | 'status' | 'mask' = 'item') {
        super('heal',battler);
    }
}

class BattlerStatusAppliedEvent extends BattlerEvent {
    constructor(battler: Battler, public status: StatusEffect, public turns: number) {
        super('statusApplied',battler);
    }
}

class BattlerStatusRemovedEvent extends BattlerEvent {
    constructor(battler: Battler, public status: StatusEffect, public forced = false) {
        super('statusRemoved',battler);
    }
}

class BattlerKnockOutEvent extends BattlerEvent {
    constructor(battler: Battler, public cause: 'attack' | 'special' | 'item' | 'status' | 'mask' = 'attack') {
        super('knockOut',battler);
    }
}

// BATTLE CONTROLLER EVENTS
// ...

export { 
    BattleControllerEventTypes, 
    BattlerEventTypes, 

    BattlerEvent,
    BattlerBeginTurnEvent,
    BattlerEndTurnEvent,
    BattlerDamageEvent,
    BattlerHealEvent,
    BattlerStatusAppliedEvent,
    BattlerStatusRemovedEvent,
    BattlerKnockOutEvent,
}