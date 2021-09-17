import Battler from '../battle/battler';
import { Element } from './elements';

const Formulas = {

    /** Calculates the damage caused by any attack stat versus any defense. An optional damage constant may be provided: the bigger the constant, the less the defense can block. */
    calculateDamage: function(attack: number, defense: number, damageConstant = 10): number {
        return Math.max( 1, Math.round(attack * ( damageConstant / (damageConstant + defense))));
    },

    /** Calculates the damage caused by any attack stat versus any defense, applying multipliers according to the attack/defense elements. */
    calculateElementalDamage: function(attack: number, defense: number, attackElement: Element | null, defenseElements: Element[], damageConstant = 10): number {
        let baseDamage = Formulas.calculateDamage(attack, defense, damageConstant);
        if (attackElement === null) {
            // No attack element: do not apply any multipliers
            return baseDamage;
        }

        for (let i = 0; i < defenseElements.length; i++) {
            // Apply each attacker element multiplier of each defending element, as long as the multiplier is set
            const multiplier = attackElement.multipliers[defenseElements[i].type];
            if (multiplier !== undefined) {
                baseDamage *= multiplier;
            }
        }

        baseDamage = Math.max( 1, Math.round(baseDamage));
        return baseDamage;
    },

    /** Calculates how much nova it costs to use an elemental attack with a certain attack. A higher attack stat increase the cost, and some elements have cost multipliers. */
    calculateElementalAttackCost: function(attack: number, element: Element, minimum = 2, attackDivisor = 2): number {
        return Math.max( minimum, Math.round( minimum + (attack * element.applyCostMultiplier / attackDivisor) ));
    },

    /** Calculates the number of normal attacks it would take to deplete an amount of HP. */
    attacksToDefeat: function(attack: number, defense: number, hp: number, damageConstant = 10): number {
        const damage = Formulas.calculateDamage(attack, defense, damageConstant);
        return Math.ceil(hp / damage);
    },

    /** Calculates the number of elemental attacks it would take to deplete an amount of HP. */
    elementalAttacksToDefeat: function(attack: number, defense: number, attackElement: Element | null, defenseElements: Element[], hp: number, damageConstant = 10): number {
        const damage = Formulas.calculateElementalDamage(attack, defense, attackElement, defenseElements, damageConstant);
        return Math.ceil(hp / damage);
    },
}

export default Formulas;