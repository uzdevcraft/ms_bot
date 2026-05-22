export type PendingOnboarding = { phase: 'name' } | { phase: 'contact'; fullName: string };

/**
 * In-process onboarding + "has completed first successful sync" flag.
 * For horizontal scaling, replace with Redis/session store keyed by telegram user id.
 */
export class OnboardingCoordinator {
  private readonly pending = new Map<number, PendingOnboarding>();
  private readonly registered = new Set<number>();

  isRegistered(telegramUserId: number): boolean {
    return this.registered.has(telegramUserId);
  }

  begin(telegramUserId: number): void {
    this.pending.set(telegramUserId, { phase: 'name' });
  }

  getPending(telegramUserId: number): PendingOnboarding | undefined {
    return this.pending.get(telegramUserId);
  }

  setFullName(telegramUserId: number, fullName: string): void {
    this.pending.set(telegramUserId, { phase: 'contact', fullName: fullName.trim() });
  }

  markRegistered(telegramUserId: number): void {
    this.pending.delete(telegramUserId);
    this.registered.add(telegramUserId);
  }

  clearPending(telegramUserId: number): void {
    this.pending.delete(telegramUserId);
  }
}
