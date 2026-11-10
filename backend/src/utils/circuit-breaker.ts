interface CircuitBreakerOptions {
  /** consecutive failures before the circuit opens */
  failureThreshold: number;
  /** how long the circuit stays open before allowing a trial call */
  cooldownMs: number;
}

/**
 * Minimal failure-counter breaker — not a library, same external behaviour:
 * after N consecutive upstream failures, short-circuit calls for a cooldown
 * window instead of hammering an API that's already down.
 */
export class CircuitBreaker {
  private consecutiveFailures = 0;
  private openedAt: number | null = null;

  constructor(private readonly options: CircuitBreakerOptions) {}

  get isOpen(): boolean {
    if (this.openedAt === null) return false;
    const elapsed = Date.now() - this.openedAt;
    if (elapsed >= this.options.cooldownMs) {
      // cooldown elapsed — allow one trial call through
      this.openedAt = null;
      this.consecutiveFailures = 0;
      return false;
    }
    return true;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.isOpen) {
      throw new Error('circuit open: upstream has failed repeatedly, cooling down');
    }
    try {
      const result = await fn();
      this.consecutiveFailures = 0;
      return result;
    } catch (err) {
      this.consecutiveFailures += 1;
      if (this.consecutiveFailures >= this.options.failureThreshold) {
        this.openedAt = Date.now();
      }
      throw err;
    }
  }
}
