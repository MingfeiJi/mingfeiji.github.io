import test from 'node:test';
import assert from 'node:assert/strict';
import { computeRippleInput } from '../src/lib/interview-ripple.js';

test('pointer movement is throttled for small or rapid moves', () => {
  assert.equal(computeRippleInput({ distance: 8, elapsed: 60, kind: 'move' }).shouldSpawn, false);
  assert.equal(computeRippleInput({ distance: 30, elapsed: 20, kind: 'move' }).shouldSpawn, false);
});

test('medium movement produces bounded subtle ripples', () => {
  const result = computeRippleInput({ distance: 60, elapsed: 60, kind: 'move' });
  assert.equal(result.shouldSpawn, true);
  assert.ok(result.strength >= 0.35 && result.strength <= 0.9);
  assert.ok(result.radius >= 90 && result.radius <= 180);
});

test('click produces a stronger but bounded ripple', () => {
  assert.deepEqual(computeRippleInput({ distance: 0, elapsed: 0, kind: 'down' }), {
    shouldSpawn: true,
    strength: 1.15,
    radius: 230,
  });
});
