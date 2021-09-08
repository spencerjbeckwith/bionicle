import Battler from '../battle/battler';

interface StatusEffectList {
    poison: StatusEffect;

    // New status effects here
}

/** Represents a status effect that may be applied to a Battler. */
interface StatusEffect {
    init: (affectedBattler: Battler) => void;
    deinit: (affectedBattler: Battler) => void;
}

/** Represents the actual status effect, active on a Battler. */
class AppliedStatusEffect {
    turnsRemaining: number;
    status: StatusEffect;

    constructor(status: StatusEffect, turns: number) { // Should the affectedBattler be provided here? hm...
        this.status = status;
        this.turnsRemaining = turns;
    }
}

const statusEffects : StatusEffectList = {
    poison: {
        init: function(affectedBattler: Battler) {
            // ...
        },
        deinit: function(affectedBattler: Battler) {
            // ...
        }
    },

    // New status effects here
}

Object.freeze(statusEffects);
Object.freeze(statusEffects.poison);
// Freeze new status effects here

export { StatusEffect, AppliedStatusEffect, statusEffects };