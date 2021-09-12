import { BattlerBeginTurnEvent, BattlerEndTurnEvent } from '../data/events';
import { Action } from './actions';
import BattleController from './battleController';
import Battler from './battler';
import mockTemplate from './mocks/mockTemplate';

test('getTurnOrder() orders battler turns correctly',() => {
    const bc = new BattleController([
        new Battler(mockTemplate),
        new Battler(mockTemplate),
        new Battler(mockTemplate),
        new Battler(mockTemplate),
    ],[
        new Battler(mockTemplate),
        new Battler(mockTemplate),
        new Battler(mockTemplate),
    ]);

    bc.allies[0].stats.speed = 2;
    bc.allies[1].stats.speed = 4;
    bc.allies[2].stats.speed = 3;
    bc.allies[2].isToa = true; // Toa with equal speed take priority
    bc.allies[3].stats.speed = 6;
    bc.allies[3].isToa = true;
    bc.allies[3].isKOed = true;

    bc.foes[0].stats.speed = 3;
    bc.foes[1].stats.speed = 5;
    bc.foes[2].stats.speed = 6;
    bc.foes[2].isKOed = true; // KOed gets no action

    // Ordered in descending speed order, Toa winning ties, KOed not present
    expect(bc.getTurnOrder()).toMatchObject([
        bc.foes[1],
        bc.allies[1],
        bc.allies[2],
        bc.foes[0],
        bc.allies[0],
    ]);
});

test('checkWinCondition() returns correct win conditions',() => {
    const bc = new BattleController([
        new Battler(mockTemplate),
    ],[
        new Battler(mockTemplate),
    ]);

    // No victor
    expect(bc.checkWinCondition()).toBe(false);

    // KO ally
    bc.allies[0].isKOed = true;
    expect(bc.checkWinCondition()).toBe('foes');
    bc.allies[0].isKOed = false;

    // KO foe
    bc.foes[0].isKOed = true;
    expect(bc.checkWinCondition()).toBe('allies');
    bc.foes[0].isKOed = false;

    // Remove ally
    const ally = bc.allies.shift();
    expect(bc.checkWinCondition()).toBe('foes');
    bc.allies.push(ally);

    // Remove foe
    const foe = bc.foes.shift();
    expect(bc.checkWinCondition()).toBe('allies');
    bc.foes.push(foe);

    // Foes should win if everybody dead
    bc.allies[0].isKOed = true;
    bc.foes[0].isKOed = true;
    expect(bc.checkWinCondition()).toBe('foes');
});

test('doActions() resolves after all promises execute',async () => {
    const battler = new Battler(mockTemplate);
    const bc = new BattleController([],[]);
    const mockFn = jest.fn();
    const mockAction = new Action('attack',battler,null);
    mockAction.execute = (bc: BattleController) => { // Passthrough action execution
        return new Promise((resolve, reject) => {
            mockFn();
            resolve();
        });
    }

    const result = await bc.doActions([
        mockAction,
        mockAction,
        mockAction,
    ]);

    expect(result).toBe('foes'); // No battlers present, should have foes win
    expect(mockFn).toBeCalledTimes(3);
});

test('doActions() fires every BattlerBeginTurn and BattlerEndTurn event', async () => {
    // Prepare bc
    const bc = new BattleController([
        new Battler(mockTemplate),
        new Battler(mockTemplate),
    ],[
        new Battler(mockTemplate),
        new Battler(mockTemplate),
    ]);

    // Set up mocks
    const mockFn = jest.fn();
    const mockActionExecute = (bc: BattleController) => {
        return new Promise<void>((resolve, reject) => {
            mockFn();
            resolve();
        });
    }
    const mockBeginEvent = (event: BattlerBeginTurnEvent) => {
        return new Promise<BattlerBeginTurnEvent>((resolve, reject) => {
            mockFn();
            resolve(event);
        });
    }
    const mockEndEvent = (event: BattlerEndTurnEvent) => {
        return new Promise<BattlerEndTurnEvent>((resolve, reject) => {
            mockFn();
            resolve(event);
        });
    }

    // Prepare actions with our battlers
    const actions = [
        new Action('attack',bc.allies[0],null),
        new Action('attack',bc.allies[1],null),
        new Action('attack',bc.foes[0],null),
        new Action('attack',bc.foes[1],null),
    ];

    // Replace every action executor
    actions[0].execute = mockActionExecute;
    actions[1].execute = mockActionExecute;
    actions[2].execute = mockActionExecute;
    actions[3].execute = mockActionExecute;

    // Add events to allies
    bc.allies[0].addPromisedEventListener('beginTurn',mockBeginEvent);
    bc.allies[0].addPromisedEventListener('endTurn',mockEndEvent);
    bc.allies[1].addPromisedEventListener('beginTurn',mockBeginEvent);
    bc.allies[1].addPromisedEventListener('endTurn',mockEndEvent);

    // Add events to foes
    bc.foes[0].addPromisedEventListener('beginTurn',mockBeginEvent);
    bc.foes[0].addPromisedEventListener('endTurn',mockEndEvent);
    bc.foes[1].addPromisedEventListener('beginTurn',mockBeginEvent);
    bc.foes[1].addPromisedEventListener('endTurn',mockEndEvent);

    const result = await bc.doActions(actions);

    // Three times per battler- begin, action, end. Four battlers means twelve calls total
    expect(mockFn).toBeCalledTimes(12);

    // No winner yet
    expect(result).toBe(false);
});