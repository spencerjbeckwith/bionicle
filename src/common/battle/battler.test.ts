import { BattlerEndRoundEvent, BattlerDamageEvent, BattlerKnockOutEvent, BattlerBeginTurnEvent, BattlerEndTurnEvent, BattlerBeforeAffectedEvent, BattlerAfterAffectedEvent, BattlerReviveEvent } from '../data/events';
import { Accessory } from '../data/inventory/accessories';
import { Equipment } from '../data/inventory/equipment';
import { Weapon } from '../data/inventory/weapons';
import { Mask } from '../data/masks';
import { SpecialMove } from '../data/moves';
import { StatusEffect } from '../data/statuses';
import { Action } from './actions';
import BattleController from './battleController';
import Battler from './battler';
import mockTemplate from './mocks/mockTemplate';

test('status effects applied/removed',async () => {
    const mockStatus: StatusEffect = {
        curable: false,
        maxTurns: 100,
        removedAtBattleEnd: true,
        init: jest.fn(),
        deinit: jest.fn(),
    }

    // Status application
    const mock = new Battler(mockTemplate);
    await mock.applyStatus(mockStatus,3);
    // Only status should get first index in array
    const index = mock.getStatusIndex(mockStatus);
    expect(index).toBe(0);
    expect(mock.statusEffects[index].turnsRemaining).toBe(3);
    // Add turns to an existing status
    await mock.applyStatus(mockStatus,5);
    expect(mock.statusEffects[index].turnsRemaining).toBe(8);

    // Status removal
    await mock.removeStatus(mockStatus);
    expect(mock.statusEffects.length).toBe(1); // Removal should have failed
    mockStatus.curable = true;
    await mock.removeStatus(mockStatus);
    expect(mock.statusEffects.length).toBe(0); // Now it should have succeeded

    // Apply status again and run turns
    await mock.applyStatus(mockStatus,2);
    await mock.endRound();
    await mock.endRound();
    expect(mock.statusEffects.length).toBe(0);

    // Ensure init/deinit were properly called
    expect(mockStatus.init).toBeCalledTimes(2);
    expect(mockStatus.deinit).toBeCalledTimes(2);
});

test('weapon, equipment, accessory, and mask equipping',() => {
    const mockWeapon: Weapon = {
        buyPrice: 0,
        sellPrice: 0,
        canDrop: false,
        canSell: false,
        description: '',
        name: '',
        destroyOnDrop: true,
        init: jest.fn(),
        deinit: jest.fn(),
    }

    const mockEquipment: Equipment = {
        buyPrice: 0,
        sellPrice: 0,
        canDrop: false,
        canSell: false,
        description: '',
        name: '',
        destroyOnDrop: true,
        init: jest.fn(),
        deinit: jest.fn(),
    }

    const mockAccessory: Accessory = {
        buyPrice: 0,
        sellPrice: 0,
        canDrop: false,
        canSell: false,
        description: '',
        name: '',
        destroyOnDrop: true,
        init: jest.fn(),
        deinit: jest.fn(),
    }

    const mockMask = new Mask('','',0,'single','enemy',jest.fn(),jest.fn(),jest.fn());

    // Equip and remove a weapon
    const mock = new Battler(mockTemplate);
    expect(mock.weapon).toBe(null);
    expect(mock.equipWeapon(mockWeapon)).toBe(null);
    expect(mock.weapon).toBe(mockWeapon);
    mock.equipWeapon(mockWeapon);
    expect(mock.equipWeapon(null)).toBe(mockWeapon);
    expect(mock.weapon).toBe(null);

    expect(mockWeapon.init).toBeCalledTimes(2);
    expect(mockWeapon.deinit).toBeCalledTimes(2);

    // Equip and remove equipment
    expect(mock.equipment).toBe(null);
    expect(mock.equipEquipment(mockEquipment)).toBe(null);
    expect(mock.equipment).toBe(mockEquipment);
    mock.equipEquipment(mockEquipment);
    expect(mock.equipEquipment(null)).toBe(mockEquipment);
    expect(mock.equipment).toBe(null);

    expect(mockEquipment.init).toBeCalledTimes(2);
    expect(mockEquipment.deinit).toBeCalledTimes(2);

    // Equip and remove accessory
    expect(mock.accessory).toBe(null);
    expect(mock.equipAccessory(mockAccessory)).toBe(null);
    expect(mock.accessory).toBe(mockAccessory);
    mock.equipAccessory(mockAccessory);
    expect(mock.equipAccessory(null)).toBe(mockAccessory);
    expect(mock.accessory).toBe(null);

    expect(mockAccessory.init).toBeCalledTimes(2);
    expect(mockAccessory.deinit).toBeCalledTimes(2);
    
    // Equip and remove mask
    mock.template.masks.push(mockMask); // Make second mock mask available as index 1
    expect(mock.currentMask).toBe(0); // Battler created with only one mask, so current index should be 0
    expect(mock.equipMask(1)).toBe(0);
    expect(mock.currentMask).toBe(1);
    expect(mock.equipMask(0)).toBe(1);
    expect(mock.equipMask(null)).toBe(0);
    expect(mock.currentMask).toBe(null);

    expect(mockMask.init).toBeCalledTimes(1);
    expect(mockMask.deinit).toBeCalledTimes(1);
});

test('end round removes statuses and dispatches event', async () => {
    const mock = new Battler(mockTemplate);
    const mockStatus: StatusEffect = {
        curable: false,
        maxTurns: 100,
        removedAtBattleEnd: true,
        init: jest.fn(),
        deinit: jest.fn(),
    }

    const eventMock = jest.fn();
    mock.addPromisedEventListener('endRound',(event: BattlerEndRoundEvent) => {
        return new Promise<BattlerEndRoundEvent>((resolve, reject) => {
            eventMock();
            resolve(event);
        });
    });

    await mock.applyStatus(mockStatus,1);
    await mock.endRound();

    expect(mockStatus.init).toBeCalled();
    expect(mockStatus.deinit).toBeCalled();
    expect(eventMock).toBeCalled();
});

test('events may be mutated through resolving promises', async () => {
    const mock = new Battler(mockTemplate);
    const eventMock = jest.fn();
    
    // Will happen second (priority 2)
    mock.addPromisedEventListener('damage',(event: BattlerDamageEvent) => {
        return new Promise<BattlerDamageEvent>((resolve, reject) => {
            eventMock();
            event.amount *= 3;
            resolve(event);
        });
    },1);

    // Will happen first (priority 1)
    mock.addPromisedEventListener('damage',(event: BattlerDamageEvent) => {
        return new Promise<BattlerDamageEvent>((resolve, reject) => {
            eventMock();
            event.amount = 1;
            resolve(event);
        });
    },2);

    await mock.damage(10);

    expect(mock.stats.hp).toBe(mock.template.stats.maxHP - 3);
    expect(eventMock).toBeCalled();
});

test('too much damage will KO', async () => {
    const mock = new Battler(mockTemplate);
    const eventMock = jest.fn();

    mock.addPromisedEventListener('knockOut',(event: BattlerKnockOutEvent) => {
        return new Promise<BattlerKnockOutEvent>((resolve, reject) => {
            eventMock();
            resolve(event);
        });
    });

    await mock.damage(1000,undefined,null,true);

    expect(mock.stats.hp).toBe(0);
    expect(mock.isKOed).toBe(true);
    expect(eventMock).toBeCalled();
});

test('can be revived', async () => {
    const mock = new Battler(mockTemplate);
    const eventMock = jest.fn();

    mock.addPromisedEventListener('revive',(event: BattlerReviveEvent) => {
        return new Promise<BattlerKnockOutEvent>((resolve, reject) => {
            eventMock();
            resolve(event);
        });
    });

    await mock.damage(10000);
    await mock.revive(2,null,true);

    expect(mock.stats.hp).toBe(2);
    expect(mock.isKOed).toBe(false);
    expect(eventMock).toBeCalled();
});

test('doTurn() executes BattlerBeginTurnEvent, the action, and BattlerEndTurnEvent',async () => {
    const battler = new Battler(mockTemplate);
    const action = new Action('attack',battler,null);
    const mockFn = jest.fn();

    // Add our events
    battler.addPromisedEventListener<BattlerBeginTurnEvent>('beginTurn',(event) => {
        return new Promise<BattlerBeginTurnEvent>((resolve, reject) => {
            mockFn();
            resolve(event);
        });
    });

    battler.addPromisedEventListener<BattlerEndTurnEvent>('endTurn',(event) => {
        return new Promise<BattlerEndTurnEvent>((resolve, reject) => {
            mockFn();
            resolve(event);
        });
    });

    // Override our action's default execute function
    action.execute = () => {
        return new Promise((resolve, reject) => {
            mockFn();
            resolve();
        });
    }

    await battler.doTurn(action);

    expect(mockFn).toBeCalledTimes(3);
});

test('BattlerBeginTurnEvent and BattlerEndTurnEvent can mutate the doTurn() action',async () => {
    const battler = new Battler(mockTemplate);
    const battler2 = new Battler(mockTemplate);
    const action = new Action('attack',battler,null);
    const mockFn = jest.fn();

    // Add our events
    battler.addPromisedEventListener<BattlerBeginTurnEvent>('beginTurn',(event) => {
        return new Promise<BattlerBeginTurnEvent>((resolve, reject) => {
            event.action.type = 'use';
            mockFn();
            resolve(event);
        });
    });

    battler.addPromisedEventListener<BattlerEndTurnEvent>('endTurn',(event) => {
        return new Promise<BattlerEndTurnEvent>((resolve, reject) => {
            event.action.target = battler2;
            mockFn();
            resolve(event);
        });
    });

    // Override our action's default execute function
    action.execute = () => {
        return new Promise((resolve, rjeect) => {
            mockFn();
            resolve();
        })
    }
    
    await battler.doTurn(action);

    expect(action.type).toBe('use');
    expect(action.target).toBe(battler2);
    expect(mockFn).toBeCalledTimes(3);
});

test('getSide() and getOtherSide() return correctly',() => {
    const ally = new Battler(mockTemplate);
    const foe = new Battler(mockTemplate);
    new BattleController([ ally ], [ foe ]);

    expect(ally.getSide()).toBe('allies');
    expect(foe.getSide()).toBe('foes');
    expect(ally.getOtherSide()).toBe('foes');
    expect(foe.getOtherSide()).toBe('allies');
});

test('dispatchMultipleEventTriads() executes all in order',async () => {
    const battlers = [ new Battler(mockTemplate), new Battler(mockTemplate), new Battler(mockTemplate) ];
    const actions = [
        new Action('attack', battlers[0], battlers[0]),
        new Action('attack', battlers[1], battlers[1]),
        new Action('attack', battlers[2], battlers[2]),
    ];

    const beforeEvents = [
        new BattlerBeforeAffectedEvent(battlers[0], actions[0], true),
        new BattlerBeforeAffectedEvent(battlers[1], actions[1], true),
        new BattlerBeforeAffectedEvent(battlers[2], actions[2], true),
    ];

    const executeMockFn = jest.fn();
    const executeFn = () => {
        return new Promise<void>((resolve, reject) => {
            executeMockFn();
            resolve();
        });
    }

    const execute = [ executeFn(), executeFn(), executeFn() ];
    const afterEvents = [
        new BattlerAfterAffectedEvent(battlers[0], actions[0], true),
        new BattlerAfterAffectedEvent(battlers[1], actions[1], true),
        new BattlerAfterAffectedEvent(battlers[2], actions[2], true),
    ];

    // Add events to our battlers to build an array in order
    const array = [];
    const beforeMockFn = jest.fn();
    const afterMockFn = jest.fn();
    for (let i = 0; i <= 2; i++) {
        battlers[i].addPromisedEventListener('beforeAffected', (ev: BattlerBeforeAffectedEvent) => {
            return new Promise<BattlerBeforeAffectedEvent>((resolve, reject) => {
                array.push(i);
                beforeMockFn();
                resolve(ev);
            });
        });

        battlers[i].addPromisedEventListener('afterAffected', (ev: BattlerAfterAffectedEvent) => {
            return new Promise<BattlerAfterAffectedEvent>((resolve, reject) => {
                array.push(i+3);
                afterMockFn();
                resolve(ev);
            });
        });
    }
    
    await Battler.dispatchMultipleEventTriads(battlers, beforeEvents, afterEvents, execute);

    // Ensure the executors were called and the events called in order
    expect(executeMockFn).toBeCalledTimes(3);
    expect(beforeMockFn).toBeCalledTimes(3);
    expect(afterMockFn).toBeCalledTimes(3);
    expect(array).toMatchObject([
        0, 1, 2, 3, 4, 5
    ]);
});

test('getUseTargets() returns correct number of actions',() => {
    const ally = new Battler(mockTemplate);
    const foe = new Battler(mockTemplate);
    const foe2 = new Battler(mockTemplate);
    new BattleController([ ally, new Battler(mockTemplate) ], [ foe, foe2, new Battler(mockTemplate) ]);

    const fakeUse = function(bearer: Battler, target: Battler | null, instantaneous = false): Promise<void> {
        return new Promise((resolve, reject) => {
            resolve();
        });
    };

    const singleFriendly = new SpecialMove('','',0,'single','friendly',fakeUse);
    const singleEnemy = new SpecialMove('','',0,'single','enemy',fakeUse);
    const multipleFriendly = new SpecialMove('','',0,'multiple','friendly',fakeUse);
    const multipleEnemy = new SpecialMove('','',0,'multiple','enemy',fakeUse);
    const noTarget = new SpecialMove('','',0,null,null,fakeUse);

    // single - friendly
    expect(ally.getUseTargets(singleFriendly).length).toBe(2);
    expect(foe.getUseTargets(singleFriendly).length).toBe(3);
    expect(foe2.getUseTargets(singleFriendly).length).toBe(3);

    // single - enemy
    expect(ally.getUseTargets(singleEnemy, true).length).toBe(3);
    expect(foe.getUseTargets(singleEnemy, true).length).toBe(2);
    expect(foe.getUseTargets(singleEnemy, true).length).toBe(2);

    // multiple - friendly
    expect(ally.getUseTargets(multipleFriendly).length).toBe(1);
    expect(foe.getUseTargets(multipleFriendly).length).toBe(1);
    expect(foe2.getUseTargets(multipleFriendly).length).toBe(1);

    // multiple - enemy
    expect(ally.getUseTargets(multipleEnemy).length).toBe(1);
    expect(foe.getUseTargets(multipleEnemy).length).toBe(1);
    expect(foe2.getUseTargets(multipleEnemy).length).toBe(1);

    // no target
    expect(ally.getUseTargets(noTarget).length).toBe(1);
    expect(foe.getUseTargets(noTarget).length).toBe(1);
    expect(foe2.getUseTargets(noTarget).length).toBe(1);

    // You may also want to test that these arrays have the *correct* actions...
});

test('getAllActions() returns correct number of actions',() => {
    const ally = new Battler(mockTemplate);
    const foe = new Battler(mockTemplate);
    const foe2 = new Battler(mockTemplate);
    new BattleController( [ally], [foe, foe2]);

    /* mockTemplate: 
        Wnows mockMove, which has no target. (1 action)
        Wears mockMask, which targets multiple friendlies. (1 action)
        Is of element mockElement2, giving an extra type of attack (1 extra action per foe)
        And has a mockItem, targets a single enemy. (1 action per enemy)

        ** When you add new actions, you must account for them here!
    */

    // 2x attacks on 2 foes = 4 + 1 (mockMove) + 1 (mockMask) + 2 (mockItem) + 1 (pass) = 9 possiblities for the ally
    expect(ally.getAllActions(true).length).toBe(9);

    // 2x attack on 1 foe = 2 + 1 (mockMove) + 1 (mockMask) + 1 (mockItem) + 1 (pass) = 6 possiblities for each foe
    expect(foe.getAllActions(true).length).toBe(6);
    expect(foe2.getAllActions(true).length).toBe(6);
});