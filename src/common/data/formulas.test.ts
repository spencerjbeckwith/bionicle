import Formulas from './formulas';

test('damage will always be at least one',() => {
    expect(Formulas.calculateDamage(1,10000)).toBe(1);
    expect(Formulas.calculateDamage(1,10000,1)).toBe(1);
    expect(Formulas.calculateDamage(1,10000,1000)).toBe(1);
});

test('damage will always return a whole number',() => {
    expect(Formulas.calculateDamage(Math.random()*100,Math.random()*100,Math.random()*100) % 1).toBe(0);
    expect(Formulas.calculateDamage(Math.random()*100,Math.random()*100,Math.random()*100) % 1).toBe(0);
    expect(Formulas.calculateDamage(Math.random()*100,Math.random()*100,Math.random()*100) % 1).toBe(0);
    expect(Formulas.calculateDamage(Math.random()*100,Math.random()*100,Math.random()*100) % 1).toBe(0);
});