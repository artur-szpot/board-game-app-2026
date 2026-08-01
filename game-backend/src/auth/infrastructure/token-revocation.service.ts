import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenRevocationService {
  private revokedTokens = new Map<string, number>();

  public revoke(token: string, expiresAtEpochSeconds?: number): void {
    const expiresAtMillis = (expiresAtEpochSeconds ?? 0) * 1000;
    this.pruneExpired();
    this.revokedTokens.set(token, expiresAtMillis);
  }

  public isRevoked(token: string): boolean {
    this.pruneExpired();
    return this.revokedTokens.has(token);
  }

  private pruneExpired(): void {
    const now = Date.now();
    for (const [token, expiresAt] of this.revokedTokens.entries()) {
      if (expiresAt !== 0 && expiresAt <= now) {
        this.revokedTokens.delete(token);
      }
    }
  }
}
