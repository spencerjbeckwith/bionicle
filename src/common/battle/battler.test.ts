import { BattlerTemplate } from '../data/battlerTemplate';
import { BattlerEndTurnEvent, BattlerDamageEvent, BattlerKnockOutEvent } from '../data/events';
import { Accessory } from '../data/inventory/accessories';
import { Equipment } from '../data/inventory/equipment';
import { Weapon } from '../data/inventory/weapons';
import { Mask } from '../data/masks';
import { StatusEffect } from '../data/statuses';
import Battler from './battler';

const mockBattlerTemplate: BattlerTemplate = {
    weapon: null,
    equipment: null,
    accessory: null,
    masks: [],

    name: '',
    description: '',
    dropMoney: 0,
    dropXP: 0,
    elements: [],
    immunities: [],
    inventory: [],
    moves: [],
    palette: 0,
    sprite: null,
    stats: {
        hp: 10,
        maxHP: 10,
        nova: 10,
        maxNova: 10,
        attack: 2,
        defense: 1,
        elAttack: 2,
        elDefense: 1,
        accuracy: 100,
        evasion: 0,
        critical: 0,
        level: 0,
        speed: 1,
        xp: 0,
    }
}

test('status effects applied/removed',async () => {
    const mockStatus: StatusEffect = {
        curable: false,
        maxTurns: 100,
        removedAtBattleEnd: true,
        init: jest.fn(),
        deinit: jest.fn(),
    }

    // Status application
    const mock = new Battler(mockBattlerTemplate);
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
    await mock.endTurn();
    await mock.endTurn();
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
    const mock = new Battler(mockBattlerTemplate);
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

test('end turn removes statuses and dispatches event', async () => {
    const mock = new Battler(mockBattlerTemplate);
    const mockStatus: StatusEffect = {
        curable: false,
        maxTurns: 100,
        removedAtBattleEnd: true,
        init: jest.fn(),
        deinit: jest.fn(),
    }

    const eventMock = jest.fn();
    mock.addPromisedEventListener('endTurn',(event: BattlerEndTurnEvent) => {
        return new Promise<BattlerEndTurnEvent>((resolve, reject) => {
            eventMock();
            resolve(event);
        });
    });

    await mock.applyStatus(mockStatus,1);
    await mock.endTurn();

    expect(mockStatus.init).toBeCalled();
    expect(mockStatus.deinit).toBeCalled();
    expect(eventMock).toBeCalled();
});

test('events may be mutated through resolving promises', async () => {
    const mock = new Battler(mockBattlerTemplate);
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
    const mock = new Battler(mockBattlerTemplate);
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