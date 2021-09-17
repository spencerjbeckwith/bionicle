import { Mask } from '../../data/masks';
import Battler from '../battler';

const mockMask = new Mask('Mock Mask','',0,'multiple','friendly',(bearer: Battler) => {},(bearer: Battler) => {},
    function(bearer: Battler, target: Battler | null, instantaneous = false): Promise<void> {
        if (target) {
            return target.damage(1);
        } else {
            return new Promise<void>((resolve, reject) => { reject(); });
        }
    }
);

export default mockMask;