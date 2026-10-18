import {
  refreshAccessToken,
  resetRefreshCoordinatorForTests,
  refreshTransport,
} from '../../src/app/auth/refreshCoordinator';
import { secureStorage } from '../../src/shared/storage/secureStorage';
import { accessTokenStore } from '../../src/shared/storage/accessTokenStore';
import type { RefreshResponse } from '../../src/features/auth/api/authTypes';

jest.mock('../../src/shared/storage/secureStorage');
jest.mock('../../src/shared/storage/accessTokenStore');

describe('Single-Flight RefreshCoordinator', () => {
  const mockRefreshResponse: RefreshResponse = {
    accessToken: 'rotated-access-token-jwt',
    refreshToken: 'rotated-refresh-token-xyz',
    tokenType: 'Bearer',
    accessTokenExpiresIn: 900,
    refreshTokenExpiresIn: 604800,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    resetRefreshCoordinatorForTests();
  });

  test('A. No refresh token in Keychain: throws terminal error without HTTP call', async () => {
    (secureStorage.getRefreshToken as jest.Mock).mockResolvedValueOnce(null);
    const postSpy = jest.spyOn(refreshTransport, 'post');

    await expect(refreshAccessToken()).rejects.toThrow(
      'Không tìm thấy phiên đăng nhập trong bộ lưu trữ an toàn'
    );

    expect(secureStorage.getRefreshToken).toHaveBeenCalledTimes(1);
    expect(accessTokenStore.clearAccessToken).toHaveBeenCalledTimes(1);
    expect(postSpy).not.toHaveBeenCalled();
  });

  test('B. Single refresh call: reads Keychain, calls transport, stores rotated token, updates memory token', async () => {
    (secureStorage.getRefreshToken as jest.Mock).mockResolvedValueOnce('old-refresh-token-123');
    jest.spyOn(refreshTransport, 'post').mockResolvedValueOnce({
      data: {
        success: true,
        data: mockRefreshResponse,
        timestamp: '2026-10-18T12:00:00Z',
      },
    });
    (secureStorage.setRefreshToken as jest.Mock).mockResolvedValueOnce(undefined);

    const token = await refreshAccessToken();

    expect(token).toBe('rotated-access-token-jwt');
    expect(secureStorage.getRefreshToken).toHaveBeenCalledTimes(1);
    expect(secureStorage.setRefreshToken).toHaveBeenCalledWith('rotated-refresh-token-xyz');
    expect(accessTokenStore.setAccessToken).toHaveBeenCalledWith('rotated-access-token-jwt');
  });

  test('C. Three concurrent refresh calls: executes single in-flight call and shares result', async () => {
    (secureStorage.getRefreshToken as jest.Mock).mockResolvedValue('old-refresh-token-123');

    let resolveHttp: any;
    const pendingHttp = new Promise(resolve => {
      resolveHttp = resolve;
    });

    jest.spyOn(refreshTransport, 'post').mockReturnValueOnce(pendingHttp as any);
    (secureStorage.setRefreshToken as jest.Mock).mockResolvedValue(undefined);

    // Call 3 times simultaneously in same tick
    const p1 = refreshAccessToken();
    const p2 = refreshAccessToken();
    const p3 = refreshAccessToken();

    // Resolve HTTP transport
    resolveHttp({
      data: {
        success: true,
        data: mockRefreshResponse,
        timestamp: '2026-10-18T12:00:00Z',
      },
    });

    const [r1, r2, r3] = await Promise.all([p1, p2, p3]);

    expect(r1).toBe('rotated-access-token-jwt');
    expect(r2).toBe('rotated-access-token-jwt');
    expect(r3).toBe('rotated-access-token-jwt');

    // Exactly one Keychain read and write
    expect(secureStorage.getRefreshToken).toHaveBeenCalledTimes(1);
    expect(secureStorage.setRefreshToken).toHaveBeenCalledTimes(1);
    expect(accessTokenStore.setAccessToken).toHaveBeenCalledTimes(1);
  });

  test('D. Refresh endpoint failure: rejects all callers consistently and clears memory token', async () => {
    (secureStorage.getRefreshToken as jest.Mock).mockResolvedValue('old-refresh-token-123');
    jest.spyOn(refreshTransport, 'post').mockRejectedValue(new Error('Refresh token revoked'));

    const p1 = refreshAccessToken();
    const p2 = refreshAccessToken();

    await expect(p1).rejects.toThrow('Refresh token revoked');
    await expect(p2).rejects.toThrow('Refresh token revoked');

    expect(accessTokenStore.clearAccessToken).toHaveBeenCalled();
    expect(secureStorage.setRefreshToken).not.toHaveBeenCalled();
  });

  test('E. Keychain rotation write failure: clears tokens and rejects queued callers', async () => {
    (secureStorage.getRefreshToken as jest.Mock).mockResolvedValue('old-refresh-token-123');
    jest.spyOn(refreshTransport, 'post').mockResolvedValue({
      data: {
        success: true,
        data: mockRefreshResponse,
        timestamp: '2026-10-18T12:00:00Z',
      },
    });
    (secureStorage.setRefreshToken as jest.Mock).mockRejectedValue(new Error('Keychain hardware locked'));

    await expect(refreshAccessToken()).rejects.toThrow(
      'Không thể lưu trữ khóa phiên làm mới vào phần cứng an toàn'
    );

    // Rollback: clear access token and clear refresh token
    expect(accessTokenStore.clearAccessToken).toHaveBeenCalled();
    expect(secureStorage.clearRefreshToken).toHaveBeenCalled();
    expect(accessTokenStore.setAccessToken).not.toHaveBeenCalled();
  });

  test('F. Subsequent refresh after completion: lock resets and allows new execution', async () => {
    (secureStorage.getRefreshToken as jest.Mock).mockResolvedValue('refresh-token-123');
    jest.spyOn(refreshTransport, 'post').mockResolvedValue({
      data: {
        success: true,
        data: mockRefreshResponse,
        timestamp: '2026-10-18T12:00:00Z',
      },
    });
    (secureStorage.setRefreshToken as jest.Mock).mockResolvedValue(undefined);

    const first = await refreshAccessToken();
    expect(first).toBe('rotated-access-token-jwt');

    const second = await refreshAccessToken();
    expect(second).toBe('rotated-access-token-jwt');

    expect(secureStorage.getRefreshToken).toHaveBeenCalledTimes(2);
  });
});

