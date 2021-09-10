import Battler from '../battle/battler';
import deepfreeze from 'deepfreeze';

interface StatusEffectList {
    poison: StatusEffect;

    // New status effects here
}

/** Represents a status effect that may be applied to a Battler. */
interface StatusEffect {
    curable: boolean;
    maxTurns: number;
    removedAtBattleEnd: boolean;
    init: (affectedBattler: Battler) => void;
    deinit: (affectedBattler: Battler) => void;
}

/** Represents the actual status effect, active on a Battler. */
class AppliedStatusEffect {
    turnsRemaining: number;

    constructor(public status: StatusEffect, turns: number) { // Should the affectedBattler be provided here? hm...
        this.turnsRemaining = turns;
    }
}

const statusEffects : StatusEffectList = {
    poison: {
        curable: true,
        maxTurns: 10,
        removedAtBattleEnd: true,
        init: function(affectedBattler: Battler) {
            // ...
        },
        deinit: function(affectedBattler: Battler) {
            // ...
        }
    },

    // New status effects here
}

deepfreeze(statusEffects);
export { StatusEffect, AppliedStatusEffect, statusEffects };