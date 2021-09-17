import Battler from '../battler';
import { UsableItem } from '../../data/inventory/items';

const mockItem = new UsableItem('','',0,0,false,false,true,true,'single',
    function(bearer: Battler, target: Battler | null, instantaenous = false): Promise<void> {
        if (target) {
            return target.damage(1);
        } else {
            return new Promise<void>((resolve, reject) => { reject(); });
        }
    }
);

export default mockItem;