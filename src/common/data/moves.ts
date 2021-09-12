import Battler from "../battle/battler";
import deepfreeze from 'deepfreeze';

interface SpecialMoveList {
    flare: SpecialMove;
    // New moves here
}

class SpecialMove {
    constructor(
        public name: string, 
        public description: string, 
        public cost: number, 
        public requireTarget: boolean, 
        public use: (bearer: Battler, target: Battler | null, instantaneous?: boolean) => Promise<void>
    ) {}
}

interface LevelUpMove {
    move: SpecialMove;
    level: number;
}

const specialMoves : SpecialMoveList = {
    flare: new SpecialMove(
        'Flare',
        'Attack a foe with fire.',
        1,
        true,
        function(bearer: Battler, target: Battler | null, instantaneous = false) {
            return new Promise((resolve, reject) => {

                // ...

                resolve();
            });
        }),
    
    // New moves here
}

deepfreeze(specialMoves);
export { SpecialMove, LevelUpMove, specialMoves };