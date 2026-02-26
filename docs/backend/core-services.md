# توثيق الخدمات الأساسية (Backend Core Services)

**النطاق:** `backend/src/services`  
**التركيز:** `auth.service.ts` + `analysis.service.ts`  
**آخر تحديث:** 2026-02-15

---

## 1) الهدف

الملف ده بيشرح منطق الأعمال الأساسي في الخادم:

1. **AuthService**: دورة حياة المصادقة والتوكنات.
2. **AnalysisService**: تشغيل بايبلاين التحليل متعدد الوكلاء وتحويله لصيغة المحطات السبع.

---

## 2) AuthService

**الملف:** `backend/src/services/auth.service.ts`

### المسؤوليات

- إنشاء مستخدم جديد مع hash آمن لكلمة المرور.
- تسجيل دخول بالتحقق من البريد/الباسورد.
- إصدار Access Token + Refresh Token.
- تدوير وتجديد التوكنات.
- إبطال refresh tokens عند logout.

### الدوال الأساسية

| الدالة | الغرض | ملاحظات |
|---|---|---|
| `signup(email, password, firstName?, lastName?)` | تسجيل مستخدم جديد | بيتأكد إن البريد مش متكرر + hash بـ `bcrypt` |
| `login(email, password)` | تسجيل الدخول | مقارنة hash بالباسورد المدخل |
| `getUserById(userId)` | جلب مستخدم بدون `passwordHash` | مستخدمة في سياقات auth/session |
| `verifyToken(token)` | فك والتحقق من JWT | بيرمي خطأ لو token غير صالح |
| `refreshAccessToken(refreshToken)` | إصدار access جديد + تدوير refresh | بيحذف refresh القديم قبل إنشاء الجديد |
| `revokeRefreshToken(token)` | إلغاء refresh token | مستخدمة في logout |
| `generateTokenPair(userId)` | توليد زوج توكنات | Access (15m) + Refresh (7 أيام) |

### نقاط هندسية مهمة

1. refresh token بيتخزن في DB مش مجرد stateless JWT.
2. access token قصير العمر لتقليل تأثير التسريب.
3. logout الحقيقي بيعمل revoke فعلي مش مجرد حذف cookie من العميل.

---

## 3) AnalysisService

**الملف:** `backend/src/services/analysis.service.ts`

### المسؤوليات

- تنسيق التحليل الدرامي باستخدام **Multi-Agent Orchestrator**.
- تشغيل مجموعة مهام تحليلية متخصصة بالتوازي.
- تحويل نتائج الوكلاء لصيغة متوافقة مع واجهة المحطات السبع.
- توليد تقرير ختامي مجمع.

### المسار الأساسي للتنفيذ

1. `runFullPipeline(input)` يستقبل النص وسياق المشروع.
2. يحدد قائمة المهام التحليلية (`TaskType[]`) مثل:
   - تحليل الشخصيات
   - تحليل الحوار
   - التحليل البصري
   - تحليل الموضوعات
   - تحليل الجمهور
3. يستدعي `multiAgentOrchestrator.executeAgents(...)`.
4. يحول النتائج عبر `convertAgentResultsToStations(...)`.
5. يرجع:
   - `stationOutputs`
   - `pipelineMetadata` (وقت التنفيذ، متوسط الثقة، عدد الوكلاء الناجحين)

### الدوال الداخلية المهمة

| الدالة | الغرض |
|---|---|
| `convertAgentResultsToStations` | تحويل مخرجات الوكلاء إلى `station1..station7` |
| `extractCharactersFromAnalysis` | استخراج أسماء شخصيات بشكل heuristic من نص التحليل |
| `generateFinalReport` | تجميع ملخصات الوكلاء في تقرير نصي موحد |

### العلاقة مع بقية النظام

- **ProjectsController** يستخدم `AnalysisService` في `POST /api/projects/:id/analyze`.
- المخرجات متوافقة مع الواجهة الأمامية اللي بتعرض نموذج المحطات السبع.

---

## 4) مقارنة سريعة: AuthService vs AnalysisService

| البند | AuthService | AnalysisService |
|---|---|---|
| نوع المنطق | أمان وهوية | تحليل AI متعدد الوكلاء |
| الاعتمادات الأساسية | DB + bcrypt + JWT + crypto | Orchestrator + TaskType + صياغة Stations |
| طبيعة المخرجات | Tokens + User | Station Outputs + Pipeline Metadata |
| الفشل المتوقع | بيانات اعتماد غير صحيحة/توكن منتهي | فشل وكيل/فشل orchestration |

---

## 5) ملاحظات صيانة

1. أي تعديل في شكل `StationOutput` لازم يتراجع مع الواجهة الأمامية.
2. أي تغيير في سياسات token expiry لازم ينعكس في UX (refresh flow).
3. Errors في الخدمتين لازم تفضل semantic وواضحة عشان الـ controllers يقدروا يرجعوا status code مناسب.
