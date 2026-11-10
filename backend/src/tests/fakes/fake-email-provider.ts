import type { EmailProvider, SendEmailInput, SendEmailResult } from '../../providers/email/email-provider';

export class FakeEmailProvider implements EmailProvider {
  public readonly sent: SendEmailInput[] = [];
  private callCount = 0;

  constructor(private readonly options: { shouldFail?: boolean; failTimes?: number } = {}) {}

  async send(input: SendEmailInput): Promise<SendEmailResult> {
    this.callCount += 1;
    this.sent.push(input);
    const failTimes = this.options.failTimes ?? Infinity;
    if (this.options.shouldFail && this.callCount <= failTimes) {
      return { ok: false, reason: 'simulated failure' };
    }
    return { ok: true };
  }
}
