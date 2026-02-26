# توثيق API Endpoints الأساسية (Backend)

**النطاق:** `backend/src/server.ts` + Controllers الأساسية  
**آخر تحديث:** 2026-02-15

---

## 1) الهدف

الملف ده بيوثّق مسارات الـ API الأساسية اللي بتخدم:
- المصادقة وإدارة الجلسات
- إدارة مشاريع السيناريو (Project/Scene/Character/Shot)
- واجهات الذكاء الاصطناعي
- المراقبة والمقاييس

> مرجع التسجيل الفعلي للمسارات: `backend/src/server.ts`.

---

## 2) ملخص الحماية

معظم المسارات بتمر على الطبقات دي حسب نوعها:

1. `authMiddleware` للتحقق من JWT
2. `csrfProtection` للطلبات اللي بتغيّر الحالة (`POST/PUT/DELETE/PATCH`)
3. تحقق payload بـ Zod داخل الـ controllers

**قاعدة عامة:**
- مسارات Auth الأساسية (`signup/login`) public.
- أي CRUD أو Metrics أو AI غالباً protected بـ JWT.

---

## 3) مجموعة المصادقة (Auth)

| Method | Path | Handler | Auth | CSRF | ملاحظات |
|---|---|---|---|---|---|
| POST | `/api/auth/signup` | `authController.signup` | ❌ | عبر `setCsrfToken` بعد النجاح | تحقق صارم للباسورد (12+، upper/lower/number/symbol) |
| POST | `/api/auth/login` | `authController.login` | ❌ | عبر `setCsrfToken` بعد النجاح | بيرجع access token + refresh token cookie |
| POST | `/api/auth/logout` | `authController.logout` | ❌ | ✅ | بيلغي refresh token من التخزين |
| POST | `/api/auth/refresh` | `authController.refresh` | ❌ | ✅ | تدوير refresh token + access token جديد |
| GET | `/api/auth/me` | `authController.getCurrentUser` | ✅ | ❌ | بيرجع المستخدم الحالي من `req.user` |

### Auth Controller سلوك أساسي

- `signup`/`login`: بيحط `refreshToken` في Cookie (`httpOnly`, `sameSite: strict`).
- `refresh`: بيتحقق من وجود refresh token cookie وصلاحيته.
- `logout`: بيمسح الكوكي + يعمل revoke للتوكن.

---

## 4) مجموعة المشاريع والإنتاج (Directors Studio)

| Method | Path | Handler | Auth | CSRF | الغرض |
|---|---|---|---|---|---|
| GET | `/api/projects` | `projectsController.getProjects` | ✅ | ❌ | جلب مشاريع المستخدم |
| GET | `/api/projects/:id` | `projectsController.getProject` | ✅ | ❌ | جلب مشروع واحد مع تحقق الملكية |
| POST | `/api/projects` | `projectsController.createProject` | ✅ | ✅ | إنشاء مشروع |
| PUT | `/api/projects/:id` | `projectsController.updateProject` | ✅ | ✅ | تحديث مشروع |
| DELETE | `/api/projects/:id` | `projectsController.deleteProject` | ✅ | ✅ | حذف مشروع |
| POST | `/api/projects/:id/analyze` | `projectsController.analyzeScript` | ✅ | ✅ | تشغيل تحليل AI للنص |

### مشاهد/شخصيات/لقطات

| Method | Path |
|---|---|
| GET | `/api/projects/:projectId/scenes` |
| GET | `/api/scenes/:id` |
| POST | `/api/scenes` |
| PUT | `/api/scenes/:id` |
| DELETE | `/api/scenes/:id` |
| GET | `/api/projects/:projectId/characters` |
| GET | `/api/characters/:id` |
| POST | `/api/characters` |
| PUT | `/api/characters/:id` |
| DELETE | `/api/characters/:id` |
| GET | `/api/scenes/:sceneId/shots` |
| GET | `/api/shots/:id` |
| POST | `/api/shots` |
| PUT | `/api/shots/:id` |
| DELETE | `/api/shots/:id` |
| POST | `/api/shots/suggestion` |

> كل المسارات اللي فيها write operations محمية بـ JWT + CSRF حسب التسجيل في `server.ts`.

---

## 5) مجموعة الذكاء الاصطناعي (AI)

| Method | Path | Handler | Auth | CSRF | Payload مختصر |
|---|---|---|---|---|---|
| POST | `/api/ai/chat` | `aiController.chat` | ✅ | ✅ | `{ message, context? }` |
| POST | `/api/ai/shot-suggestion` | `aiController.getShotSuggestion` | ✅ | ✅ | `{ sceneDescription, shotType }` |

### AI Controller سلوك أساسي

- التحقق بـ Zod قبل أي استدعاء خدمة.
- استخدام `GeminiService` لتوليد الرد/الاقتراح.
- logging لبيانات تشغيل آمنة (طول الرسالة، نوع اللقطة، إلخ).

---

## 6) مجموعة التحليل والمراقبة

### Analysis/Critique

| Method | Path |
|---|---|
| POST | `/api/analysis/seven-stations` |
| GET | `/api/analysis/stations-info` |
| GET | `/api/critique/config` |
| GET | `/api/critique/config/:taskType` |
| GET | `/api/critique/dimensions/:taskType` |
| POST | `/api/critique/summary` |

### Metrics

| Method | Path |
|---|---|
| GET | `/api/metrics/snapshot` |
| GET | `/api/metrics/latest` |
| GET | `/api/metrics/range` |
| GET | `/api/metrics/database` |
| GET | `/api/metrics/redis` |
| GET | `/api/metrics/queue` |
| GET | `/api/metrics/api` |
| GET | `/api/metrics/resources` |
| GET | `/api/metrics/gemini` |
| GET | `/api/metrics/report` |
| GET | `/api/metrics/health` |
| GET | `/api/metrics/dashboard` |
| GET | `/api/metrics/cache/snapshot` |
| GET | `/api/metrics/cache/realtime` |
| GET | `/api/metrics/cache/health` |
| GET | `/api/metrics/cache/report` |
| GET | `/api/metrics/apm/dashboard` |
| GET | `/api/metrics/apm/config` |
| POST | `/api/metrics/apm/reset` |
| GET | `/api/metrics/apm/alerts` |

---

## 7) ملاحظات تنفيذية مهمة

1. `MetricsController` فيه fallback ذكي: لو snapshot مش موجود، بياخد snapshot جديد فوري.
2. `ProjectsController` بيطبق ownership check قبل قراءة/تحديث/حذف.
3. `AuthController` بيفصل validation errors (400) عن auth failures (401).
4. `AIController` و`ProjectsController.analyzeScript` بيشتغلوا على مسارات AI مختلفة:
   - `ai/*` لمهام تفاعلية سريعة
   - `projects/:id/analyze` لبايبلاين تحليل مشروع كامل
