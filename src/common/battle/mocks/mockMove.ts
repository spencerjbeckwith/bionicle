import { SpecialMove } from '../../data/moves';
import Battler from '../battler';

const mockMove = new SpecialMove('Mock Move','',1,null,'enemy',
    function(bearer: Battler, target: Battler | null, instantaenous = false): Promise<void> {
        // Normally, if you had a move you want to affect just one Battler (even if its yourself) you'd want to set it as the target.
        // Doing things to the bearer of the move won't fire their BattlerBeforeAffectedEvent or BattlerAfterAffectedEvents.   
        return new Promise((resolve, reject) => {
            bearer.stats.hp--;
            resolve();
        });
    }
);

export default mockMove;