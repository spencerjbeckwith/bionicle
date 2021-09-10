import Battler from "../battle/battler";
import deepfreeze from 'deepfreeze';

interface SpecialMoveList {
    flare: SpecialMove;
    // New moves here
}

interface SpecialMove {
    name: string;
    description: string;
    cost: number;
    use: (bearer: Battler, target: Battler | Battler[] | null) => Promise<void>;
}

interface LevelUpMove {
    move: SpecialMove;
    level: number;
}

const specialMoves : SpecialMoveList = {
    flare: {
        name: 'Flare',
        description: 'Attack a foe with fire.',
        cost: 1,
        use: function(bearer: Battler, target: Battler | Battler[] | null) {
            return new Promise((resolve, reject) => {

                // ...

                resolve();
            });
        }
    }
    // New moves here
}

deepfreeze(specialMoves);
export { SpecialMove, LevelUpMove, specialMoves };