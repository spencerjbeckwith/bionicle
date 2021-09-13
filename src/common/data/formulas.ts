const Formulas = {
    /** Calculates the damage caused by any attack stat versus any defense. An optional damage constant may be provided: the bigger the constant, the less the defense can block. */
    calculateDamage: function(attack: number, defense: number, damageConstant = 10): number {
        return Math.max( 1, Math.round(attack * ( damageConstant / (damageConstant + defense))));
    },
}

export default Formulas