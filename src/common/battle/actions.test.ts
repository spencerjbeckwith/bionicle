import { BattlerAfterAffectedEvent, BattlerBeforeAffectedEvent, BattlerDamageEvent, BattlerEvent, BattlerKnockOutEvent } from '../data/events';
import { UsableItem } from '../data/inventory/items';
import { Mask } from '../data/masks';
import { SpecialMove } from '../data/moves';
import { Action } from './actions';
import Battler from './battler';
import mockTemplate from './mocks/mockTemplate';

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

    // Setup mocks
    const mockMove = new SpecialMove('','',0,false,
        function(bearer: Battler, target: Battler | null, instantaenous = false): Promise<void> {
            // Normally, if you had a move you want to affect just one Battler (even if its yourself) you'd want to set it as the target.
            // Doing things to the bearer of the move won't fire their BattlerBeforeAffectedEvent or BattlerAfterAffectedEvents.   
            return new Promise((resolve, reject) => {
                bearer.stats.hp--;
                resolve();
            });
        }
    );

    const action = new Action('use', battler, null, mockMove, true);
    await action.execute();
    expect(battler.stats.hp).toBe(battler.stats.maxHP-1);
});

test('use actions fire before/after affect events and trigger the use method on one target',async () => {
    const battler = new Battler(mockTemplate);

    // Setup mocks
    const mockFn = jest.fn();
    const mockItem = new UsableItem('','',0,0,false,false,true,true,true,
        function(bearer: Battler, target: Battler | null, instantaenous = false): Promise<void> {
            return target.damage(1);
        }
    );
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
    const mockMask = new Mask('','',0,true,(bearer: Battler) => {},(bearer: Battler) => {},
        function(bearer: Battler, target: Battler | null, instantaneous = false): Promise<void> {
            return target.damage(1);
        }
    );
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
