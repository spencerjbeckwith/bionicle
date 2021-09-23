import { BattlerAfterAffectedEvent, BattlerBeforeAffectedEvent, BattlerDamageEvent, BattlerEvent, BattlerKnockOutEvent } from '../data/events';
import { Action } from './actions';
import Battler from './battler';

import mockTemplate from './mocks/mockTemplate';
import mockMove from './mocks/mockMove';
import { mockElement1 } from './mocks/mockElements';
import mockItem from './mocks/mockItem';
import mockMask from './mocks/mockMask';
import BattleController from './battleController';
// If you're testing with mockMove, mockItem, and mockMask, be sure your fake actions match their targetingType

test('attack actions deal damage and trigger damage/affected/KO events',async () => {
    const attacker = new Battler(mockTemplate);
    const defender = new Battler(mockTemplate);
    const action = new Action('attack',attacker,defender,null,true);

    // Set up listeners
    const mockFn = jest.fn();
    const mockListener = (event: BattlerBeforeAffectedEvent | BattlerAfterAffectedEvent | BattlerDamageEvent | BattlerKnockOutEvent) => {
        return new Promise<BattlerBeforeAffectedEvent | BattlerAfterAffectedEvent | BattlerDamageEvent | BattlerKnockOutEvent>((resolve, reject) => {
            mockFn();
            resolve(event);
        });
    }

    defender.addPromisedEventListener('beforeAffected',mockListener);
    defender.addPromisedEventListener('afterAffected',mockListener);
    defender.addPromisedEventListener('damage',mockListener);
    defender.addPromisedEventListener('knockOut',mockListener);

    await action.execute();

    expect(defender.stats.hp).toBeLessThan(defender.stats.maxHP);
    expect(mockFn).toBeCalledTimes(3); // beforeAffected -> damage -> afterAffected

    attacker.stats.attack = 10000;
    await action.execute();

    expect(defender.stats.hp).toBe(0);
    expect(defender.isKOed).toBe(true);
    expect(mockFn).toBeCalledTimes(7); // First three calls + beforeAffected -> damage -> KO -> afterAffected
});

test('action targets can be redirected in beforeAffected events',async () => {
    const attacker = new Battler(mockTemplate);
    const firstTarget = new Battler(mockTemplate);
    const actualTarget = new Battler(mockTemplate);
    const action = new Action('attack', attacker, firstTarget, null, true);

    // Set up redirect listener
    const mockFn = jest.fn();
    const mockListener = (event: BattlerBeforeAffectedEvent) => {
        return new Promise<BattlerBeforeAffectedEvent>((resolve, reject) => {
            mockFn();
            // Manual re-assignment: in practical use, would probably need to search allies/foes appropriately
            // You would also need to make sure the action is an attack first
            event.action.target = actualTarget;
            resolve(event);
        });
    }

    firstTarget.addPromisedEventListener('beforeAffected',mockListener);

    await action.execute();

    expect(firstTarget.stats.hp).toBe(firstTarget.stats.maxHP);
    expect(actualTarget.stats.hp).toBeLessThan(actualTarget.stats.maxHP);
    expect(mockFn).toBeCalled();
});

test('elemental attack actions apply multipliers and subtract nova from the attacker',async () => {
    const attacker = new Battler(mockTemplate);
    const defender = new Battler(mockTemplate);
    const action = new Action('attack',attacker,defender,null,true);
    action.element = mockElement1;

    // Set to controlled attack/defense
    attacker.stats.attack = 10;
    defender.stats.defense = 40;
    const damage = 2;
    await action.execute();

    // Damage should be our expected result times the attack element multiplier on defending element - depends on the mocks
    expect(defender.stats.hp).toBe(defender.stats.maxHP - (damage * mockElement1.multipliers.water));
    expect(attacker.stats.nova).toBeLessThan(attacker.stats.maxNova);
});

test('BattlerEvents have access to actions',async () => {
    const attacker = new Battler(mockTemplate);
    const defender = new Battler(mockTemplate);
    const action = new Action('attack', attacker, defender, null, true);

    // Set up listeners
    const mockFn = jest.fn();
    const mockListener = (event: BattlerAfterAffectedEvent) => {
        return new Promise<BattlerAfterAffectedEvent>((resolve, reject) => {
            mockFn();
            event.action.executor.damage(event.action.damage).then(() => {
                resolve(event);
            }).catch((err) => {
                reject(err);
            });
        });
    }
    const mockDamageListener = (event: BattlerDamageEvent) => {
        return new Promise<BattlerDamageEvent>((resolve, reject) => {
            // Increase incoming damage to KO levels
            event.cause.damage = 10000;
            event.amount = event.cause.damage; // This is what actually gets subtracted
            resolve(event);
        });
    }

    defender.addPromisedEventListener('afterAffected',mockListener);

    await action.execute();

    expect(attacker.stats.hp).toBe(defender.stats.hp);
    expect(mockFn).toBeCalledTimes(1);

    defender.removePromisedEventListener('afterAffected',mockListener);
    defender.addPromisedEventListener('damage',mockDamageListener);

    await action.execute();

    expect(defender.stats.hp).toBe(0);
    expect(defender.isKOed).toBe(true);
});

test('use actions can execute with no target',async () => {
    const battler = new Battler(mockTemplate);
    const action = new Action('use', battler, null, mockMove, true);
    await action.execute();
    expect(battler.stats.hp).toBe(battler.stats.maxHP-1);
});

test('use actions fire before/after affect events and trigger the use method on one target',async () => {
    const battler = new Battler(mockTemplate);

    // Setup mocks
    const mockFn = jest.fn();
    const mockListener = (event: BattlerEvent) => {
        return new Promise<BattlerEvent>((resolve, reject) => {
            mockFn();
            resolve(event);
        });
    }

    battler.addPromisedEventListener('beforeAffected',mockListener);
    battler.addPromisedEventListener('afterAffected',mockListener);
    battler.addPromisedEventListener('damage',mockListener);
    battler.addPromisedEventListener('beginTurn',mockListener);
    battler.addPromisedEventListener('endTurn',mockListener);

    const action = new Action('use', battler, battler, mockItem, true);
    await battler.doTurn(action, true);

    expect(battler.stats.hp).toBe(battler.stats.maxHP-1);
    expect(mockFn).toBeCalledTimes(5);
});

test('use actions fire before/after affect events and trigger the use method on multiple targets',async () => {
    const attacker = new Battler(mockTemplate);
    const target1 = new Battler(mockTemplate);
    const target2 = new Battler(mockTemplate);
    const target3 = new Battler(mockTemplate);

    // Setup mocks
    const mockFn = jest.fn();
    const mockListener = (event: BattlerEvent) => {
        return new Promise<BattlerEvent>((resolve, reject) => {
            mockFn();
            resolve(event);
        });
    }

    target1.addPromisedEventListener('beforeAffected',mockListener);
    target1.addPromisedEventListener('afterAffected',mockListener);
    target1.addPromisedEventListener('damage',mockListener);

    target2.addPromisedEventListener('beforeAffected',mockListener);
    target2.addPromisedEventListener('afterAffected',mockListener);
    target2.addPromisedEventListener('damage',mockListener);

    target3.addPromisedEventListener('beforeAffected',mockListener);
    target3.addPromisedEventListener('afterAffected',mockListener);
    target3.addPromisedEventListener('damage',mockListener);

    const action = new Action('use', attacker, [ target1, target2, target3 ], mockMask, true);
    await attacker.doTurn(action, true);

    // This doesn't actually ensure all the events happened in order...
    expect(target1.stats.hp).toBe(target1.stats.maxHP-1);
    expect(target2.stats.hp).toBe(target2.stats.maxHP-1);
    expect(target3.stats.hp).toBe(target3.stats.maxHP-1);
    expect(mockFn).toBeCalledTimes(9);
});

test('Action.isImpossible disallows invalid actions',() => {
    const attacker = new Battler(mockTemplate);
    const defender = new Battler(mockTemplate);

    attacker.stats.nova = -1; // Normally this could never happen
    
    const elementAttack = new Action('attack',attacker,defender,null,true);
    expect(elementAttack.isImpossible()).toBe(false);

    elementAttack.element = mockElement1;
    expect(elementAttack.isImpossible()).not.toBe(false);

    const specialMove = new Action('use',attacker,null,mockMove,true);
    expect(specialMove.isImpossible()).not.toBe(false);

    attacker.stats.nova = attacker.stats.maxNova;
    expect(specialMove.isImpossible()).toBe(false);
});

test('Action.applyRequirements reduces nova when using special moves',() => {
    const battler = new Battler(mockTemplate);
    (new Action('use',battler,null,mockMove,true)).applyRequirements();
    expect(battler.stats.nova).toBeLessThan(battler.stats.maxNova);
});

test('Action.applyRequirements takes consumed items out of inventory on use',() => {
    const battler = new Battler(mockTemplate);
    const startLength = battler.inventory.length;
    (new Action('use',battler,battler,mockItem,true)).applyRequirements();
    expect(battler.inventory.length).toBe(startLength - 1);
});

test('flee actions set the Battlers fled when successful',async () => {
    const ally = new Battler(mockTemplate);
    const foe = new Battler(mockTemplate);
    const bc = new BattleController([ ally ],[ foe ],true,true);

    // Mock template has 50% chance to flee, so manipulate the random
    const flee = new Action('flee',ally,null);

    flee.randoms[0] = 0.9;
    await flee.execute();
    expect(ally.fled).toBe(false);

    flee.randoms[0] = 0.2;
    await flee.execute();
    expect(ally.fled).toBe(true);
});

test('give actions move items',async () => {
    const a1 = new Battler(mockTemplate); // mmm... A1 steak sauce...
    const a2 = new Battler(mockTemplate);

    const give = new Action('give',a1,a2,mockItem);

    // Before
    expect(a1.inventory.length).toBe(1);
    expect(a2.inventory.length).toBe(1);

    await give.execute();

    // After
    expect(a1.inventory.length).toBe(0);
    expect(a2.inventory.length).toBe(2);
});