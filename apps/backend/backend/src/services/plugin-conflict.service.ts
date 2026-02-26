import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { installedPlugins, pluginConflictEvents } from '@/db/schema';

export type ConflictDecision = 'allow' | 'warn' | 'block';
export type ConflictRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface PluginDependency {
  name: string;
  versionRange: string;
}

export interface PluginManifest {
  name: string;
  version: string;
  permissions: string[];
  dependencies: PluginDependency[];
  category?: string;
}

export interface ConflictAlternative {
  name: string;
  reason: string;
  confidence: number;
}

export interface PreflightCheckInput {
  userId: string;
  candidatePlugin: PluginManifest;
}

export interface PreflightCheckResult {
  score: number;
  riskLevel: ConflictRiskLevel;
  decision: ConflictDecision;
  reasons: string[];
  suggestedActions: string[];
  alternatives: ConflictAlternative[];
  checkedAt: string;
}

interface InstalledPluginRecord {
  pluginName: string;
  pluginVersion: string;
  permissions: string[];
  dependencies: PluginDependency[];
}

const HIGH_IMPACT_PERMISSIONS = new Set([
  'filesystem.write',
  'filesystem.delete',
  'database.write',
  'network.proxy',
  'system.execute',
  'secrets.read',
]);

const CATEGORY_ALTERNATIVES: Record<string, string[]> = {
  analytics: ['lightweight-telemetry', 'event-stream-safe'],
  seo: ['meta-optimizer-lite', 'schema-safe-generator'],
  backup: ['snapshot-safe-backup', 'incremental-restore-guard'],
  auth: ['token-safe-auth', 'session-shield-auth'],
};

export class PluginConflictService {
  async preflightCheck(input: PreflightCheckInput): Promise<PreflightCheckResult> {
    const installed = await this.getInstalledPlugins(input.userId);
    const candidate = input.candidatePlugin;

    const reasons: string[] = [];
    const suggestedActions: string[] = [];
    let score = 0;

    const duplicatePlugin = installed.find(
      (p) => p.pluginName.toLowerCase() === candidate.name.toLowerCase()
    );

    if (duplicatePlugin) {
      score += 30;
      reasons.push('الإضافة مثبتة بالفعل لنفس المستخدم وقد يحدث تعارض في النسخة أو الإعدادات');
      suggestedActions.push('حدّث الإضافة الحالية بدل تثبيت نسخة إضافية مكررة');
    }

    const dependencyConflictResult = this.analyzeDependencyConflicts(
      candidate.dependencies,
      installed
    );

    score += dependencyConflictResult.score;
    reasons.push(...dependencyConflictResult.reasons);
    suggestedActions.push(...dependencyConflictResult.suggestedActions);

    const permissionConflictResult = this.analyzePermissionConflicts(
      candidate.permissions,
      installed
    );

    score += permissionConflictResult.score;
    reasons.push(...permissionConflictResult.reasons);
    suggestedActions.push(...permissionConflictResult.suggestedActions);

    const normalizedScore = Math.max(0, Math.min(100, score));
    const decision = this.resolveDecision(normalizedScore);
    const riskLevel = this.resolveRiskLevel(normalizedScore);
    const alternatives = this.recommendAlternatives(candidate, installed);

    const result: PreflightCheckResult = {
      score: normalizedScore,
      riskLevel,
      decision,
      reasons: this.uniqueList(reasons),
      suggestedActions: this.uniqueList(suggestedActions),
      alternatives,
      checkedAt: new Date().toISOString(),
    };

    await this.logConflictEvent(input.userId, candidate, result);

    return result;
  }

  async installPluginForUser(userId: string, plugin: PluginManifest): Promise<void> {
    const [existing] = await db
      .select()
      .from(installedPlugins)
      .where(and(eq(installedPlugins.userId, userId), eq(installedPlugins.pluginName, plugin.name)))
      .limit(1);

    if (existing) {
      await db
        .update(installedPlugins)
        .set({
          pluginVersion: plugin.version,
          permissions: plugin.permissions,
          dependencies: plugin.dependencies,
          status: 'active',
          updatedAt: new Date(),
        })
        .where(eq(installedPlugins.id, existing.id));
      return;
    }

    await db.insert(installedPlugins).values({
      userId,
      pluginName: plugin.name,
      pluginVersion: plugin.version,
      permissions: plugin.permissions,
      dependencies: plugin.dependencies,
      status: 'active',
    });
  }

  async getRecentConflicts(userId: string, limit: number = 20) {
    const normalizedLimit = Math.max(1, Math.min(100, limit));

    return db
      .select()
      .from(pluginConflictEvents)
      .where(eq(pluginConflictEvents.userId, userId))
      .orderBy(desc(pluginConflictEvents.createdAt))
      .limit(normalizedLimit);
  }

  private async getInstalledPlugins(userId: string): Promise<InstalledPluginRecord[]> {
    const records = await db
      .select()
      .from(installedPlugins)
      .where(eq(installedPlugins.userId, userId));

    return records.map((record) => ({
      pluginName: record.pluginName,
      pluginVersion: record.pluginVersion,
      permissions: Array.isArray(record.permissions) ? record.permissions : [],
      dependencies: Array.isArray(record.dependencies)
        ? record.dependencies.filter((dep): dep is PluginDependency => {
            return Boolean(dep && typeof dep.name === 'string' && typeof dep.versionRange === 'string');
          })
        : [],
    }));
  }

  private analyzeDependencyConflicts(
    candidateDependencies: PluginDependency[],
    installed: InstalledPluginRecord[]
  ) {
    let score = 0;
    const reasons: string[] = [];
    const suggestedActions: string[] = [];

    for (const installedPlugin of installed) {
      for (const installedDependency of installedPlugin.dependencies) {
        const matchingCandidateDependency = candidateDependencies.find(
          (candidateDependency) =>
            candidateDependency.name.toLowerCase() === installedDependency.name.toLowerCase()
        );

        if (!matchingCandidateDependency) {
          continue;
        }

        const compatible = this.areVersionRangesCompatible(
          matchingCandidateDependency.versionRange,
          installedDependency.versionRange
        );

        if (!compatible) {
          score += 20;
          reasons.push(
            `تعارض تبعية: ${matchingCandidateDependency.name} مطلوب بـ ${matchingCandidateDependency.versionRange} بينما ${installedPlugin.pluginName} يستخدم ${installedDependency.versionRange}`
          );
          suggestedActions.push(
            `وحّد نطاق نسخة ${matchingCandidateDependency.name} أو استخدم إصدار متوافق بين الإضافتين`
          );
        }
      }
    }

    return { score, reasons, suggestedActions };
  }

  private analyzePermissionConflicts(
    candidatePermissions: string[],
    installed: InstalledPluginRecord[]
  ) {
    let score = 0;
    const reasons: string[] = [];
    const suggestedActions: string[] = [];

    const normalizedCandidatePermissions = new Set(
      candidatePermissions.map((permission) => permission.toLowerCase())
    );

    for (const installedPlugin of installed) {
      const installedPermissionSet = new Set(
        installedPlugin.permissions.map((permission) => permission.toLowerCase())
      );

      const overlappingPermissions = [...normalizedCandidatePermissions].filter((permission) =>
        installedPermissionSet.has(permission)
      );

      if (overlappingPermissions.length === 0) {
        continue;
      }

      score += Math.min(15, overlappingPermissions.length * 3);

      reasons.push(
        `تداخل أذونات مع ${installedPlugin.pluginName}: ${overlappingPermissions.join(', ')}`
      );

      const hasHighImpactOverlap = overlappingPermissions.some((permission) =>
        HIGH_IMPACT_PERMISSIONS.has(permission)
      );

      if (hasHighImpactOverlap) {
        score += 20;
        reasons.push('تداخل أذونات عالي الخطورة على موارد حساسة');
      }

      suggestedActions.push(
        'فعّل مبدأ أقل صلاحية وقلّل الأذونات المتداخلة أو افصل التنفيذ في sandbox'
      );
    }

    return { score, reasons, suggestedActions };
  }

  private recommendAlternatives(
    candidatePlugin: PluginManifest,
    installed: InstalledPluginRecord[]
  ): ConflictAlternative[] {
    const categoryKey = (candidatePlugin.category || '').toLowerCase();
    const candidateList = CATEGORY_ALTERNATIVES[categoryKey] || [];

    if (candidateList.length === 0) {
      return [];
    }

    const installedNames = new Set(installed.map((plugin) => plugin.pluginName.toLowerCase()));

    return candidateList
      .filter((name) => !installedNames.has(name.toLowerCase()))
      .slice(0, 3)
      .map((name) => ({
        name,
        reason: 'بديل بنفس الفئة مع بصمة صلاحيات أخف واحتمال تعارض أقل',
        confidence: 0.72,
      }));
  }

  private resolveDecision(score: number): ConflictDecision {
    if (score >= 75) {
      return 'block';
    }

    if (score >= 35) {
      return 'warn';
    }

    return 'allow';
  }

  private resolveRiskLevel(score: number): ConflictRiskLevel {
    if (score >= 75) {
      return 'critical';
    }

    if (score >= 50) {
      return 'high';
    }

    if (score >= 25) {
      return 'medium';
    }

    return 'low';
  }

  private async logConflictEvent(
    userId: string,
    candidatePlugin: PluginManifest,
    result: PreflightCheckResult
  ): Promise<void> {
    await db.insert(pluginConflictEvents).values({
      userId,
      candidatePluginName: candidatePlugin.name,
      candidatePluginVersion: candidatePlugin.version,
      riskScore: result.score,
      riskLevel: result.riskLevel,
      decision: result.decision,
      reasons: result.reasons,
      suggestedActions: result.suggestedActions,
      alternatives: result.alternatives,
    });
  }

  private uniqueList(items: string[]): string[] {
    return Array.from(new Set(items.filter(Boolean)));
  }

  private areVersionRangesCompatible(rangeA: string, rangeB: string): boolean {
    const cleanA = (rangeA || '').trim();
    const cleanB = (rangeB || '').trim();

    if (!cleanA || !cleanB || cleanA === '*' || cleanB === '*') {
      return true;
    }

    if (cleanA === cleanB) {
      return true;
    }

    const boundsA = this.extractBounds(cleanA);
    const boundsB = this.extractBounds(cleanB);

    if (!boundsA || !boundsB) {
      return true;
    }

    const lower = this.maxVersion(boundsA.min, boundsB.min);
    const upper = this.minVersion(boundsA.max, boundsB.max);

    if (!lower || !upper) {
      return true;
    }

    return this.compareVersions(lower, upper) <= 0;
  }

  private extractBounds(range: string): { min: string; max: string } | null {
    if (range.startsWith('^') || range.startsWith('~')) {
      const base = range.slice(1);
      const parsed = this.parseVersion(base);

      if (!parsed) {
        return null;
      }

      const [major, minor] = parsed;
      if (range.startsWith('^')) {
        return { min: `${major}.${minor}.0`, max: `${major + 1}.0.0` };
      }

      return { min: `${major}.${minor}.0`, max: `${major}.${minor + 1}.0` };
    }

    if (range.startsWith('>=')) {
      const min = range.slice(2).trim();
      return { min, max: '999999.999999.999999' };
    }

    if (range.startsWith('>')) {
      const parsed = this.parseVersion(range.slice(1).trim());
      if (!parsed) {
        return null;
      }
      const [major, minor, patch] = parsed;
      return { min: `${major}.${minor}.${patch + 1}`, max: '999999.999999.999999' };
    }

    if (range.startsWith('<=')) {
      const max = range.slice(2).trim();
      return { min: '0.0.0', max };
    }

    if (range.startsWith('<')) {
      const parsed = this.parseVersion(range.slice(1).trim());
      if (!parsed) {
        return null;
      }
      const [major, minor, patch] = parsed;
      const adjustedPatch = Math.max(0, patch - 1);
      return { min: '0.0.0', max: `${major}.${minor}.${adjustedPatch}` };
    }

    if (this.parseVersion(range)) {
      return { min: range, max: range };
    }

    return null;
  }

  private parseVersion(version: string): [number, number, number] | null {
    const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);

    if (!match) {
      return null;
    }

    return [
      Number.parseInt(match[1], 10),
      Number.parseInt(match[2], 10),
      Number.parseInt(match[3], 10),
    ];
  }

  private compareVersions(a: string, b: string): number {
    const parsedA = this.parseVersion(a);
    const parsedB = this.parseVersion(b);

    if (!parsedA || !parsedB) {
      return 0;
    }

    if (parsedA[0] !== parsedB[0]) {
      return parsedA[0] - parsedB[0];
    }

    if (parsedA[1] !== parsedB[1]) {
      return parsedA[1] - parsedB[1];
    }

    return parsedA[2] - parsedB[2];
  }

  private maxVersion(a: string, b: string): string {
    return this.compareVersions(a, b) >= 0 ? a : b;
  }

  private minVersion(a: string, b: string): string {
    return this.compareVersions(a, b) <= 0 ? a : b;
  }
}

export const pluginConflictService = new PluginConflictService();
