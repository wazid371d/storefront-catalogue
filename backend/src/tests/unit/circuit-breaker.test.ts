import { CircuitBreaker } from '../../utils/circuit-breaker';

describe('CircuitBreaker', () => {
  it('passes through successful calls', async () => {
    const breaker = new CircuitBreaker({ failureThreshold: 3, cooldownMs: 1000 });
    await expect(breaker.execute(async () => 'ok')).resolves.toBe('ok');
  });

  it('opens after the failure threshold and short-circuits further calls', async () => {
    const breaker = new CircuitBreaker({ failureThreshold: 2, cooldownMs: 10_000 });
    const failing = () => Promise.reject(new Error('upstream down'));

    await expect(breaker.execute(failing)).rejects.toThrow('upstream down');
    await expect(breaker.execute(failing)).rejects.toThrow('upstream down');
    // threshold reached — this call must fail fast with a breaker error instead
    // of hitting the (still failing) upstream again
    await expect(breaker.execute(failing)).rejects.toThrow('circuit open');
  });

  it('allows a trial call once the cooldown has elapsed', async () => {
    const breaker = new CircuitBreaker({ failureThreshold: 1, cooldownMs: 10 });
    await expect(breaker.execute(() => Promise.reject(new Error('down')))).rejects.toThrow('down');
    await new Promise((resolve) => setTimeout(resolve, 20));
    await expect(breaker.execute(async () => 'recovered')).resolves.toBe('recovered');
  });
});
