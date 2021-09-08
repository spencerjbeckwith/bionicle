import BattleController from '../battle/battleController';
import Battler from '../battle/battler';

interface BattleControllerEventDetail {
    bc: BattleController;
}

interface BattlerEventDetail {
    battler: Battler;
}

type BattleControllerEventTypes = 'start' | 'end' | 'turnStart' | 'turnEnd';
type BattlerEventTypes = 'start' | 'end' | 'beforeTurn' | 'afterTurn' | 'beforeAction' | 'afterAction' | 'damaged' | 'healed' | 'die';

class BattleControllerEvent extends CustomEvent<BattleControllerEventDetail> {
    constructor(type: BattleControllerEventTypes, eventDetails: BattleControllerEventDetail) {
        super(type,{
            detail: eventDetails,
        });
    }
}

class BattlerEvent extends CustomEvent<BattlerEventDetail> {
    constructor(type: BattlerEventTypes, eventDetails: BattlerEventDetail) {
        super(type,{
            detail: eventDetails,
        });
    }
}

export { BattleControllerEventTypes, BattlerEventTypes, BattleControllerEvent, BattlerEvent }