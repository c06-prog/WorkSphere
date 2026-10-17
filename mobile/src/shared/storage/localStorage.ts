import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Local Storage Foundation for WorkSphere Mobile
 * Powered by @react-native-async-storage/async-storage
 *
 * Strict policy:
 * - Non-sensitive data ONLY (e.g., UI preferences, theme mode, flags).
 * - NEVER store Access Tokens, Refresh Tokens, passwords, or personal credentials.
 */

const FORBIDDEN_SENSITIVE_SUBSTRINGS = ['token', 'password', 'secret', 'auth'] as const;

function assertNonSensitiveKey(key: string): void {
  const lower = key.toLowerCase();
  for (const forbidden of FORBIDDEN_SENSITIVE_SUBSTRINGS) {
    if (lower.includes(forbidden)) {
      throw new Error(`LocalStorage security violation: Key "${key}" appears to hold sensitive data.`);
    }
  }
}

export const localStorage = {
  async getString(key: string): Promise<string | null> {
    assertNonSensitiveKey(key);
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },

  async setString(key: string, value: string): Promise<void> {
    assertNonSensitiveKey(key);
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown storage error';
      throw new Error(`LocalStorage setItem failure: ${message}`);
    }
  },

  async remove(key: string): Promise<void> {
    assertNonSensitiveKey(key);
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // Idempotent
    }
  },

  /**
   * Retrieves and safely parses JSON from AsyncStorage.
   * If parsing fails or validator returns false, returns null.
   */
  async getJson<T>(key: string, validator?: (val: unknown) => val is T): Promise<T | null> {
    const raw = await this.getString(key);
    if (!raw) {
      return null;
    }

    try {
      const parsed: unknown = JSON.parse(raw);
      if (validator) {
        return validator(parsed) ? parsed : null;
      }
      return parsed as T;
    } catch {
      return null;
    }
  },

  async setJson<T>(key: string, value: T): Promise<void> {
    const serialized = JSON.stringify(value);
    await this.setString(key, serialized);
  },
};
