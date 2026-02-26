import { Response } from 'express';
import { z } from 'zod';
import type { AuthRequest } from '@/middleware/auth.middleware';
import { pluginConflictService } from '@/services/plugin-conflict.service';
import { logger } from '@/utils/logger';

const dependencySchema = z.object({
  name: z.string().min(1, 'اسم التبعية مطلوب').max(200, 'اسم التبعية طويل جداً').trim(),
  versionRange: z
    .string()
    .min(1, 'نطاق نسخة التبعية مطلوب')
    .max(50, 'نطاق النسخة طويل جداً')
    .trim(),
});

const pluginManifestSchema = z.object({
  name: z.string().min(1, 'اسم الإضافة مطلوب').max(200, 'اسم الإضافة طويل جداً').trim(),
  version: z.string().min(1, 'نسخة الإضافة مطلوبة').max(50, 'نسخة الإضافة طويلة جداً').trim(),
  permissions: z
    .array(z.string().min(1).max(120).trim())
    .max(200, 'عدد الأذونات كبير جداً')
    .default([]),
  dependencies: z.array(dependencySchema).max(500, 'عدد التبعيات كبير جداً').default([]),
  category: z.string().min(1).max(100).trim().optional(),
});

const preflightBodySchema = z.object({
  candidatePlugin: pluginManifestSchema,
});

const installBodySchema = z.object({
  candidatePlugin: pluginManifestSchema,
  forceInstall: z.boolean().optional().default(false),
});

const conflictQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export class PluginsController {
  async preflightCheck(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'غير مصرح',
        });
        return;
      }

      const { candidatePlugin } = preflightBodySchema.parse((req as any).body);

      const result = await pluginConflictService.preflightCheck({
        userId: req.user.id,
        candidatePlugin,
      });

      res.json({
        success: true,
        message: 'تم تنفيذ فحص التعارضات بنجاح',
        data: result,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'بيانات غير صالحة',
          details: error.issues,
        });
        return;
      }

      logger.error('Plugin preflight check error:', error);
      res.status(500).json({
        success: false,
        error: 'حدث خطأ أثناء فحص تعارضات الإضافة',
      });
    }
  }

  async installPlugin(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'غير مصرح',
        });
        return;
      }

      const { candidatePlugin, forceInstall } = installBodySchema.parse((req as any).body);

      const preflight = await pluginConflictService.preflightCheck({
        userId: req.user.id,
        candidatePlugin,
      });

      if (preflight.decision === 'block' && !forceInstall) {
        res.status(409).json({
          success: false,
          error: 'تم حظر التثبيت بسبب تعارضات حرجة',
          data: preflight,
        });
        return;
      }

      await pluginConflictService.installPluginForUser(req.user.id, candidatePlugin);

      res.status(201).json({
        success: true,
        message: 'تم تثبيت الإضافة بنجاح',
        data: {
          plugin: {
            name: candidatePlugin.name,
            version: candidatePlugin.version,
          },
          preflight,
          forced: Boolean(forceInstall && preflight.decision === 'block'),
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'بيانات غير صالحة',
          details: error.issues,
        });
        return;
      }

      logger.error('Plugin install error:', error);
      res.status(500).json({
        success: false,
        error: 'حدث خطأ أثناء تثبيت الإضافة',
      });
    }
  }

  async getConflictEvents(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'غير مصرح',
        });
        return;
      }

      const query = conflictQuerySchema.parse((req as any).query);
      const events = await pluginConflictService.getRecentConflicts(req.user.id, query.limit);

      res.json({
        success: true,
        data: events,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'بيانات غير صالحة',
          details: error.issues,
        });
        return;
      }

      logger.error('Get plugin conflict events error:', error);
      res.status(500).json({
        success: false,
        error: 'حدث خطأ أثناء جلب سجل التعارضات',
      });
    }
  }
}

export const pluginsController = new PluginsController();
