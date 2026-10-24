/**
 * Unit tests for serviceRequestStatusTransitions domain logic
 * Verifies 100% parity with ServiceStatus.java and ServiceRequestApplicationService.java
 */

import {
  canTransitionServiceStatus,
  getServiceStatusLabel,
  getValidServiceStatusTransitions,
  isResolutionCommentRequired,
  isTerminalServiceStatus,
} from '../../src/features/serviceRequests/domain/serviceRequestStatusTransitions';
import { ServiceStatus } from '../../src/features/serviceRequests/types/serviceRequestTypes';

describe('serviceRequestStatusTransitions domain logic', () => {
  describe('getValidServiceStatusTransitions and canTransitionServiceStatus', () => {
    it('OPEN transitions to ASSIGNED and CANCELLED only', () => {
      const targets = getValidServiceStatusTransitions('OPEN');
      expect(targets).toEqual(['ASSIGNED', 'CANCELLED']);
      expect(canTransitionServiceStatus('OPEN', 'ASSIGNED')).toBe(true);
      expect(canTransitionServiceStatus('OPEN', 'CANCELLED')).toBe(true);
      expect(canTransitionServiceStatus('OPEN', 'IN_PROGRESS')).toBe(false);
      expect(canTransitionServiceStatus('OPEN', 'RESOLVED')).toBe(false);
      expect(canTransitionServiceStatus('OPEN', 'CLOSED')).toBe(false);
      expect(canTransitionServiceStatus('OPEN', 'OPEN')).toBe(false);
    });

    it('ASSIGNED transitions to IN_PROGRESS only', () => {
      const targets = getValidServiceStatusTransitions('ASSIGNED');
      expect(targets).toEqual(['IN_PROGRESS']);
      expect(canTransitionServiceStatus('ASSIGNED', 'IN_PROGRESS')).toBe(true);
      expect(canTransitionServiceStatus('ASSIGNED', 'CANCELLED')).toBe(false);
      expect(canTransitionServiceStatus('ASSIGNED', 'RESOLVED')).toBe(false);
    });

    it('IN_PROGRESS transitions to WAITING_FOR_USER and RESOLVED only', () => {
      const targets = getValidServiceStatusTransitions('IN_PROGRESS');
      expect(targets).toEqual(['WAITING_FOR_USER', 'RESOLVED']);
      expect(canTransitionServiceStatus('IN_PROGRESS', 'WAITING_FOR_USER')).toBe(true);
      expect(canTransitionServiceStatus('IN_PROGRESS', 'RESOLVED')).toBe(true);
      expect(canTransitionServiceStatus('IN_PROGRESS', 'CLOSED')).toBe(false);
      expect(canTransitionServiceStatus('IN_PROGRESS', 'CANCELLED')).toBe(false);
    });

    it('WAITING_FOR_USER transitions to IN_PROGRESS only', () => {
      const targets = getValidServiceStatusTransitions('WAITING_FOR_USER');
      expect(targets).toEqual(['IN_PROGRESS']);
      expect(canTransitionServiceStatus('WAITING_FOR_USER', 'IN_PROGRESS')).toBe(true);
      expect(canTransitionServiceStatus('WAITING_FOR_USER', 'RESOLVED')).toBe(false);
    });

    it('RESOLVED transitions to CLOSED and IN_PROGRESS only', () => {
      const targets = getValidServiceStatusTransitions('RESOLVED');
      expect(targets).toEqual(['CLOSED', 'IN_PROGRESS']);
      expect(canTransitionServiceStatus('RESOLVED', 'CLOSED')).toBe(true);
      expect(canTransitionServiceStatus('RESOLVED', 'IN_PROGRESS')).toBe(true);
      expect(canTransitionServiceStatus('RESOLVED', 'CANCELLED')).toBe(false);
    });

    it('CLOSED is terminal and has zero valid transitions', () => {
      const targets = getValidServiceStatusTransitions('CLOSED');
      expect(targets).toEqual([]);
      expect(canTransitionServiceStatus('CLOSED', 'OPEN')).toBe(false);
      expect(canTransitionServiceStatus('CLOSED', 'IN_PROGRESS')).toBe(false);
    });

    it('CANCELLED is terminal and has zero valid transitions', () => {
      const targets = getValidServiceStatusTransitions('CANCELLED');
      expect(targets).toEqual([]);
      expect(canTransitionServiceStatus('CANCELLED', 'OPEN')).toBe(false);
      expect(canTransitionServiceStatus('CANCELLED', 'ASSIGNED')).toBe(false);
    });
  });

  describe('isTerminalServiceStatus', () => {
    it('returns true for CLOSED and CANCELLED', () => {
      expect(isTerminalServiceStatus('CLOSED')).toBe(true);
      expect(isTerminalServiceStatus('CANCELLED')).toBe(true);
    });

    it('returns false for non-terminal statuses', () => {
      const nonTerminals: ServiceStatus[] = [
        'OPEN',
        'ASSIGNED',
        'IN_PROGRESS',
        'WAITING_FOR_USER',
        'RESOLVED',
      ];
      nonTerminals.forEach(st => {
        expect(isTerminalServiceStatus(st)).toBe(false);
      });
    });
  });

  describe('isResolutionCommentRequired', () => {
    it('returns true strictly when target status is RESOLVED', () => {
      expect(isResolutionCommentRequired('RESOLVED')).toBe(true);
    });

    it('returns false for any other status', () => {
      const otherStatuses: ServiceStatus[] = [
        'OPEN',
        'ASSIGNED',
        'IN_PROGRESS',
        'WAITING_FOR_USER',
        'CLOSED',
        'CANCELLED',
      ];
      otherStatuses.forEach(st => {
        expect(isResolutionCommentRequired(st)).toBe(false);
      });
    });
  });

  describe('getServiceStatusLabel', () => {
    it('returns correct Vietnamese labels for all statuses', () => {
      expect(getServiceStatusLabel('OPEN')).toBe('Mới mở');
      expect(getServiceStatusLabel('ASSIGNED')).toBe('Đã phân công');
      expect(getServiceStatusLabel('IN_PROGRESS')).toBe('Đang xử lý');
      expect(getServiceStatusLabel('WAITING_FOR_USER')).toBe('Chờ phản hồi');
      expect(getServiceStatusLabel('RESOLVED')).toBe('Đã giải quyết');
      expect(getServiceStatusLabel('CLOSED')).toBe('Đã đóng');
      expect(getServiceStatusLabel('CANCELLED')).toBe('Đã hủy');
    });
  });
});
