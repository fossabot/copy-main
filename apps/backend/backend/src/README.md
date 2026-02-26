# توثيق مجلد backend/src

## 1. نظرة عامة (Overview)
هذا المجلد يحتوي على الكود المصدري الأساسي للخادم الخلفي (Backend) لمنصة "النسخة". يتميز الخادم بهندسة معمارية قائمة على الطبقات (Layered Architecture) تضمن فصل المسؤوليات وسهولة الصيانة والتوثيق.

## 2. البنية المعمارية (Architecture)
يعتمد الخادم على نمط **Controller-Service-Repository**:
- **Controllers**: معالجة طلبات HTTP والتحقق من المدخلات.
- **Services**: تحتوي على منطق الأعمال الأساسي والتكامل مع AI.
- **Agents**: وكلاء ذكاء اصطناعي متخصصون (Gemini AI).
- **Middlewares**: طبقات الحماية (Security)، المصادقة (Auth)، والمراقبة (Metrics).

## 3. المكونات الرئيسية

### 3.1 المتحكمات (Controllers)
تقع في `backend/src/controllers/`:
- `ai.controller.ts`: إدارة المحادثات واقتراحات اللقطات.
- `analysis.controller.ts`: إدارة عمليات تحليل السيناريو الشاملة.
- `auth.controller.ts`: عمليات التسجيل وتسجيل الدخول.
- `projects.controller.ts`: إدارة المشاريع والسيناريوهات.

### 3.2 الخدمات (Services)
تقع في `backend/src/services/`:
- `gemini.service.ts`: التكامل الرئيسي مع Google Gemini AI.
- `analysis.service.ts`: منطق تحليل السيناريو وتنسيق الوكلاء.
- `cache.service.ts`: إدارة التخزين المؤقت باستخدام Redis.
- `realtime.service.ts`: معالجة التحديثات اللحظية عبر WebSockets و SSE.

### 3.3 وكلاء الذكاء الاصطناعي (Agents)
تقع في `backend/src/services/agents/`:
يحتوي النظام على أكثر من 17 وكيل متخصص مثل:
- `characterDeveloper`: تطوير أبعاد الشخصيات.
- `dialogueForensics`: تحليل جودة الحوارات.
- `sceneGenerator`: توليد وتحسين المشاهد.

## 4. تدفق البيانات (Data Flow)
1. يستقبل `server.ts` الطلب.
2. يمر الطلب عبر `Middlewares` للتحقق من الأمان (WAF, CSRF, Auth).
3. يتم توجيه الطلب إلى الـ `Controller` المناسب.
4. يستدعي الـ `Controller` الـ `Service` اللازمة.
5. تقوم الـ `Service` بالتواصل مع `Gemini AI` أو `Database` أو `Redis`.
6. يتم إرجاع النتيجة وتنسيقها للمستخدم.

## 5. الأمان والمراقبة
- **WAF**: جدار حماية لمنع الهجمات الشائعة.
- **Sentry**: تتبع الأخطاء في الوقت الفعلي.
- **Prometheus**: جمع مقاييس الأداء (Metrics).
- **ZK Auth**: نظام مصادقة "صفر معرفة" لزيادة الأمان.
