/**
 * Benchmark a function execution
 */
export function benchmark(fn: () => void, iterations = 1000): number {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = performance.now();
  return end - start;
}

/**
 * Measure operations per second
 */
export function measureOps(fn: () => void, duration = 1000): number {
  const start = performance.now();
  let operations = 0;

  while (performance.now() - start < duration) {
    fn();
    operations++;
  }

  return Math.round(operations / (duration / 1000));
}

/**
 * Compare performance of two functions
 */
export function comparePerformance(
  fn1: () => void,
  fn2: () => void,
  iterations = 1000
) {
  const time1 = benchmark(fn1, iterations);
  const time2 = benchmark(fn2, iterations);

  return {
    fn1Time: time1,
    fn2Time: time2,
    faster: time1 < time2 ? 'fn1' : 'fn2',
    speedup: time1 < time2 ? time2 / time1 : time1 / time2,
  };
}

