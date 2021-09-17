import Battler from '../battle/battler';
import deepfreeze from 'deepfreeze';
import { Usable, UseFunction } from './usable';

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
        defaultTarget: 'friendly' | 'enemy',
        use: UseFunction,
    ) {
        super(targetType, defaultTarget, use);
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
        'single', 'enemy',
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