import Battler from './battler';

class BattleController extends EventTarget {
    allies: Battler[];
    foes: Battler[];
    turn: number;

    constructor() { // Include initial battlers in the constructor?
        super();
        this.allies = [];
        this.foes = [];

        this.turn = 0;
    }
}

export default BattleController;