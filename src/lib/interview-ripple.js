export function computeRippleInput({ distance, elapsed, kind }) {
  if (kind === 'down') {
    return { shouldSpawn: true, strength: 1.15, radius: 230 };
  }

  if (distance <= 12 || elapsed < 42) {
    return { shouldSpawn: false, strength: 0, radius: 0 };
  }

  const speed = Math.min(2, distance / Math.max(elapsed, 1));

  return {
    shouldSpawn: true,
    strength: Math.min(0.9, 0.38 + speed * 0.34),
    radius: Math.min(180, 92 + speed * 70),
  };
}
