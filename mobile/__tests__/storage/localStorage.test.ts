import AsyncStorage from '@react-native-async-storage/async-storage';
import { localStorage } from '../../src/shared/storage/localStorage';
import { LOCAL_STORAGE_KEYS } from '../../src/shared/storage/storageKeys';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe('LocalStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('setString and getString manage non-sensitive string values', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('dark');

    await localStorage.setString(LOCAL_STORAGE_KEYS.THEME_PREFERENCE, 'dark');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(LOCAL_STORAGE_KEYS.THEME_PREFERENCE, 'dark');

    const result = await localStorage.getString(LOCAL_STORAGE_KEYS.THEME_PREFERENCE);
    expect(result).toBe('dark');
  });

  test('remove deletes key from storage', async () => {
    await localStorage.remove(LOCAL_STORAGE_KEYS.ONBOARDING_COMPLETED);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(LOCAL_STORAGE_KEYS.ONBOARDING_COMPLETED);
  });

  test('setJson serializes object and getJson parses safely', async () => {
    const preferences = { mode: 'light', fontSizeMultiplier: 1.2 };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(preferences));

    await localStorage.setJson('@worksphere/ui_config', preferences);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@worksphere/ui_config',
      JSON.stringify(preferences)
    );

    const result = await localStorage.getJson('@worksphere/ui_config');
    expect(result).toEqual(preferences);
  });

  test('getJson returns null safely when stored string is malformed JSON', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('{invalid-json-string');

    const result = await localStorage.getJson('@worksphere/corrupt_key');
    expect(result).toBeNull();
  });

  test('getJson uses optional validator to reject unexpected shape', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({ count: 'not-a-number' }));

    const isCounter = (v: unknown): v is { count: number } =>
      typeof v === 'object' && v !== null && typeof (v as any).count === 'number';

    const result = await localStorage.getJson('@worksphere/counter', isCounter);
    expect(result).toBeNull();
  });

  test('strictly blocks attempting to store sensitive keys (token/password/secret)', async () => {
    await expect(localStorage.setString('@worksphere/user_token', 'val')).rejects.toThrow(
      /LocalStorage security violation/
    );
    await expect(localStorage.getString('password_hash')).rejects.toThrow(
      /LocalStorage security violation/
    );
    await expect(localStorage.remove('auth_secret')).rejects.toThrow(
      /LocalStorage security violation/
    );
  });
});
