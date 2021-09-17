import Formulas from './formulas';
import { mockElement1, mockElement2, mockElement3 } from '../battle/mocks/mockElements';

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

test('elemental damage uses element multipliers',() => {
    const atk = 10, def = 5, damage = 7, c = 10;

    // With no attack or defense elements, no multipliers added
    expect(Formulas.calculateElementalDamage(atk,def,null,[],c)).toBe(damage);
    expect(Formulas.calculateElementalDamage(atk,def,mockElement1,[],c)).toBe(damage);
    expect(Formulas.calculateElementalDamage(atk,def,mockElement2,[],c)).toBe(damage);

    // mock1 vs. mock2 -> x2 damage
    expect(Formulas.calculateElementalDamage(atk,def,mockElement1,[ mockElement2 ],c)).toBe(damage * 2);
    // mock1 vs. mock3 -> x4 damage
    expect(Formulas.calculateElementalDamage(atk,def,mockElement1,[ mockElement3 ],c)).toBe(damage * 4);
    // mock1 vs. both -> x8 damage
    expect(Formulas.calculateElementalDamage(atk,def,mockElement1,[ mockElement2, mockElement3 ],c)).toBe(damage * 8);

    // mock3 vs. mock1 -> x0 damage, but is always at least 1
    expect(Formulas.calculateElementalDamage(atk,def,mockElement3,[ mockElement1 ],c)).toBe(1);
    // mock3 vs. mock2 -> normal damage
    expect(Formulas.calculateElementalDamage(atk,def,mockElement3,[ mockElement2 ],c)).toBe(damage);
});