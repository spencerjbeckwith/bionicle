import Battler from '../battle/battler';
import deepfreeze from 'deepfreeze';
import { Usable, UseFunction } from './inventory/items';

interface SpecialMoveList {
    flare: SpecialMove;
    // New moves here
}

class SpecialMove extends Usable {
    constructor(
        public readonly name: string, 
        public readonly description: string, 
        public readonly cost: number, 
        targetType: 'single' | 'multiple' | null, 
        use: UseFunction,
    ) {
        super(targetType, use);
    }
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
        'single',
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