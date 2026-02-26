# هيكلة مشروع النسخة - Monorepo Architecture

## نظرة عامة

**منصة تحليل الدراما العربية** — مشروع متكامل لتحليل وإنتاج المحتوى الدرامي باستخدام الذكاء الاصطناعي.

يعتمد المشروع على بنية **Monorepo** تُدار عبر **pnpm workspaces** مع **Turborepo** لتنسيق عمليات البناء والتشغيل بكفاءة. يتألف من **تطبيقين رئيسيين** (واجهة أمامية + خادم API) و**15 حزمة مشتركة** تغطي جميع مجالات الإنتاج الدرامي.

---

## هيكل المجلدات

```
the-copy-monorepo/
├── apps/
│   ├── web/          # تطبيق Next.js - الواجهة الأمامية
│   └── backend/      # خادم Express.js - API
├── packages/
│   ├── tsconfig/     # إعدادات TypeScript المشتركة
│   ├── shared/       # البنية التحتية المشتركة (AI, DB, Types)
│   ├── ui/           # مكونات واجهة المستخدم (shadcn/ui)
│   ├── brain-storm-ai/    # العصف الذهني بالذكاء الاصطناعي
│   ├── styleist/          # تصميم الأزياء
│   ├── breakdown/         # تحليل السيناريو
│   ├── art-director/      # إدارة فنية
│   ├── cinefit/           # تجهيز الملابس السينمائية
│   ├── budget/            # إدارة الميزانية
│   ├── directors-studio/  # استوديو المخرج
│   ├── editor/            # محرر السيناريو
│   ├── breakapp/          # تطبيق الاستراحة
│   ├── prompt-engineering/ # هندسة البرومبت
│   ├── creative-writing/  # الكتابة الإبداعية
│   ├── actorai/           # مساعد الممثل
│   └── cinematography/    # التصوير السينمائي
├── scripts/
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## أوامر التشغيل

| الأمر | الوصف |
|---|---|
| `pnpm dev` | تشغيل بيئة التطوير لجميع التطبيقات |
| `pnpm build` | بناء جميع الحزم والتطبيقات |
| `pnpm test` | تشغيل الاختبارات عبر جميع الحزم |
| `pnpm lint` | فحص الكود والتحقق من الجودة |
| `pnpm dev:web` | تشغيل الواجهة الأمامية فقط |
| `pnpm dev:backend` | تشغيل الخادم فقط |

---

## مبادئ هيكلة الحزم

### التطبيقات غلاف رقيق

كل تطبيق داخل `apps/` يعمل كـ **thin wrapper** فقط — يحتوي على ملفات `page.tsx` للتوجيه والتخطيط، بينما تعيش جميع **المنطق التجاري (business logic)** داخل الحزم في `packages/`.

### بروتوكول الربط بين الحزم

تستخدم جميع الحزم بروتوكول `workspace:*` للإشارة إلى بعضها البعض:

```json
{
  "dependencies": {
    "@the-copy/shared": "workspace:*",
    "@the-copy/ui": "workspace:*"
  }
}
```

### التصدير عبر ملفات مركزية

كل حزمة تصدّر واجهتها العامة من خلال ملف `index.ts` مركزي (barrel export):

```typescript
// packages/breakdown/src/index.ts
export { SceneBreakdown } from './components/SceneBreakdown';
export { useBreakdownAnalysis } from './hooks/useBreakdownAnalysis';
export type { BreakdownResult } from './types';
```

### الحزم الأساسية

- **`@the-copy/shared`** — البنية التحتية المشتركة: خدمات الذكاء الاصطناعي (AI)، قاعدة البيانات (DB)، الأنواع (Types)، التخزين المؤقت (Cache)، والمصادقة (Auth)
- **`@the-copy/ui`** — مكونات واجهة المستخدم المبنية على **shadcn/ui** مع مكونات خاصة بمجال الإنتاج الدرامي

---

## إضافة حزمة جديدة

لإنشاء حزمة جديدة، استخدم السكريبت المساعد:

```bash
./scripts/create-package.sh <package-name>
```

يقوم هذا السكريبت بـ:

1. إنشاء مجلد الحزمة داخل `packages/`
2. توليد `package.json` مع الاسم `@the-copy/<package-name>`
3. إعداد `tsconfig.json` يرث من `@the-copy/tsconfig`
4. إنشاء هيكل المجلدات الأساسي (`src/`، `index.ts`)
5. تسجيل الحزمة في إعدادات **Turborepo**

---

## المكدس التقني

| الطبقة | التقنيات |
|---|---|
| **الواجهة الأمامية** | Next.js 16, React 19 |
| **الخادم الخلفي** | Express.js 5, Drizzle ORM |
| **الذكاء الاصطناعي** | Google Gemini AI, Groq SDK, Genkit |
| **قواعد البيانات** | PostgreSQL (Neon), Redis |
| **اللغة والأدوات** | TypeScript 5.9, Vitest, Turborepo |

---

## رسم بياني للاعتماديات

```
apps/web ──────┐
               ├──▶ @the-copy/shared (AI, DB, Types, Cache, Auth)
apps/backend ──┘
               │
               ├──▶ @the-copy/ui (shadcn/ui + domain components)
               │
               └──▶ packages/* (domain packages)
                        │
                        └──▶ @the-copy/tsconfig
```

كل حزمة مجال (domain package) تعتمد على `@the-copy/shared` للوصول إلى خدمات الذكاء الاصطناعي وقاعدة البيانات، وعلى `@the-copy/ui` لمكونات الواجهة.
