import { BattlerEndRoundEvent, BattlerDamageEvent, BattlerKnockOutEvent, BattlerBeginTurnEvent, BattlerEndTurnEvent } from '../data/events';
import { Accessory } from '../data/inventory/accessories';
import { Equipment } from '../data/inventory/equipment';
import { Weapon } from '../data/inventory/weapons';
import { Mask } from '../data/masks';
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

    const mockMask: Mask = {
        image: 0,
        name: '',
        use: jest.fn(),
        init: jest.fn(),
        deinit: jest.fn(),
    }

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
    mock.template.masks.push(mockMask); // Make a mask available
    expect(mock.currentMask).toBe(null); // Battler created when no masks available, so current is null
    expect(mock.equipMask(0)).toBe(null);
    expect(mock.currentMask).toBe(0);
    mock.equipMask(0);
    expect(mock.equipMask(null)).toBe(0);
    expect(mock.currentMask).toBe(null);

    expect(mockMask.init).toBeCalledTimes(2);
    expect(mockMask.deinit).toBeCalledTimes(2);
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

    await mock.damage(1000);

    expect(mock.stats.hp).toBe(0);
    expect(mock.isKOed).toBe(true);
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
    action.execute = (bc: BattleController) => {
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
            event.action.type = 'item';
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
    action.execute = (bc: BattleController) => {
        return new Promise((resolve, rjeect) => {
            mockFn();
            resolve();
        })
    }
    
    await battler.doTurn(action);

    expect(action.type).toBe('item');
    expect(action.target).toBe(battler2);
    expect(mockFn).toBeCalledTimes(3);
});

test('getSide() returns correctly',() => {
    const ally = new Battler(mockTemplate);
    const foe = new Battler(mockTemplate);
    const neither = new Battler(mockTemplate);
    new BattleController([ ally ], [ foe ]);

    expect(ally.getSide()).toBe('allies');
    expect(foe.getSide()).toBe('foes');
    expect(neither.getSide()).toBe(false);
});