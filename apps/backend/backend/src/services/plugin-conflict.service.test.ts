import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  PluginConflictService,
  type PluginManifest,
} from '@/services/plugin-conflict.service';

let mockInstalledPlugins: any[] = [];
let mockConflictEvents: any[] = [];

vi.mock('@/db', () => {
  return {
    db: {
      select: vi.fn(() => ({
        from: vi.fn((table: any) => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => ({
              limit: vi.fn(async () => {
                if (table?.[Symbol.for('drizzle:Name')] === 'plugin_conflict_events') {
                  return mockConflictEvents;
                }
                return mockInstalledPlugins;
              }),
            })),
            limit: vi.fn(async () => mockInstalledPlugins),
            then: undefined,
          })),
        })),
      })),
      insert: vi.fn(() => ({
        values: vi.fn(async (values: any) => {
          if (values?.candidatePluginName) {
            mockConflictEvents.push(values);
            return [values];
          }
          mockInstalledPlugins.push(values);
          return [values];
        }),
      })),
      update: vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn(async () => []),
        })),
      })),
    },
  };
});

describe('PluginConflictService', () => {
  let service: PluginConflictService;

  beforeEach(() => {
    service = new PluginConflictService();
    mockInstalledPlugins = [];
    mockConflictEvents = [];
    vi.clearAllMocks();
  });

  it('should allow plugin when no conflicts exist', async () => {
    const candidatePlugin: PluginManifest = {
      name: 'smart-seo',
      version: '1.2.0',
      permissions: ['content.read'],
      dependencies: [{ name: 'core-sdk', versionRange: '^1.2.0' }],
      category: 'seo',
    };

    const result = await service.preflightCheck({
      userId: 'user-1',
      candidatePlugin,
    });

    expect(result.decision).toBe('allow');
    expect(result.riskLevel).toBe('low');
    expect(result.score).toBeLessThan(35);
  });

  it('should warn on dependency range conflicts', async () => {
    mockInstalledPlugins = [
      {
        pluginName: 'legacy-analytics',
        pluginVersion: '2.0.0',
        permissions: ['content.read'],
        dependencies: [{ name: 'core-sdk', versionRange: '^2.0.0' }],
      },
    ];

    const candidatePlugin: PluginManifest = {
      name: 'insight-analytics',
      version: '1.0.0',
      permissions: ['content.read'],
      dependencies: [{ name: 'core-sdk', versionRange: '^1.0.0' }],
      category: 'analytics',
    };

    const result = await service.preflightCheck({
      userId: 'user-1',
      candidatePlugin,
    });

    expect(['warn', 'block']).toContain(result.decision);
    expect(result.reasons.some((reason: string) => reason.includes('تعارض تبعية'))).toBe(true);
  });

  it('should block on high-risk permission overlap', async () => {
    mockInstalledPlugins = [
      {
        pluginName: 'system-admin-tools',
        pluginVersion: '3.1.0',
        permissions: ['filesystem.delete', 'database.write'],
        dependencies: [],
      },
    ];

    const candidatePlugin: PluginManifest = {
      name: 'cleanup-optimizer',
      version: '4.0.0',
      permissions: ['filesystem.delete', 'database.write', 'system.execute'],
      dependencies: [],
      category: 'backup',
    };

    const result = await service.preflightCheck({
      userId: 'user-1',
      candidatePlugin,
    });

    expect(result.decision).toBe('block');
    expect(result.riskLevel).toBe('critical');
    expect(result.score).toBeGreaterThanOrEqual(75);
  });
});
