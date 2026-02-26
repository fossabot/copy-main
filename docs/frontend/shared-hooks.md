# توثيق الـ Shared Hooks في الواجهة الأمامية

**النطاق:** `frontend/src/hooks`  
**التركيز:** `useProject.ts`, `useAI.ts`, `useMetrics.ts`  
**آخر تحديث:** 2026-02-15

---

## 1) الهدف

الملف ده بيوضح الـ hooks المشتركة اللي بتستخدمها أكتر من شاشة/تطبيق في الواجهة، خصوصاً:

1. إدارة بيانات المشاريع والمشاهد والشخصيات واللقطات.
2. التكامل مع مسارات الذكاء الاصطناعي.
3. قراءة مقاييس النظام وعرضها في لوحات المتابعة.

---

## 2) useProject.ts

**الملف:** `frontend/src/hooks/useProject.ts`

### المسؤولية

تجميع جميع عمليات **Projects Domain** فوق React Query:

- Queries للقراءة (`useProjects`, `useProject`, `useProjectScenes`, `useProjectCharacters`, `useSceneShots`).
- Mutations للكتابة (create/update/delete) للمشاريع والمشاهد والشخصيات واللقطات.
- إدارة cache invalidation بعد كل mutation.

### نقاط مهمة

1. مفاتيح React Query مبنية على المسارات (`/api/projects`, `/api/scenes`, ...).
2. بعد أي تعديل، hook بيعمل `invalidateQueries` على المفاتيح المتأثرة للحفاظ على تزامن UI.
3. في بعض mutations تم استخدام `fetch` مباشرة بدلاً من `api` client (خصوصاً scenes/shots)، وده مهم للمراجعة المستقبلية لو في توحيد لطبقة API.

---

## 3) useAI.ts

**الملف:** `frontend/src/hooks/useAI.ts`

### المسؤولية

تغليف استدعاءات AI الأساسية كـ mutations:

| Hook | Endpoint منطقي | Payload |
|---|---|---|
| `useChatWithAI` | `/api/ai/chat` | `{ message, history }` |
| `useGetShotSuggestion` | `/api/ai/shot-suggestion` | `{ projectId, sceneId, shotType }` |

### نقاط مهمة

1. hooks دي **mutation-first** لأن العمليات تفاعلية ومعتمدة على إدخال المستخدم.
2. بتستخدم `api` layer مباشرة، فتعامل الأخطاء والتوكنات بيرجع لسلوك عميل الـ API المركزي.

---

## 4) useMetrics.ts

**الملف:** `frontend/src/hooks/useMetrics.ts`

### المسؤولية

توفير hooks متعددة للـ metrics dashboard مع polling intervals مختلفة حسب طبيعة البيانات.

### نماذج Hooks أساسية

- `useDashboardSummary` → `/api/metrics/dashboard`
- `useLatestMetrics` → `/api/metrics/latest`
- `useHealthStatus` → `/api/metrics/health`
- `useDatabaseMetrics` / `useRedisMetrics` / `useQueueMetrics` / `useApiMetrics`
- `useResourceMetrics` / `useGeminiMetrics`
- `usePerformanceReport(start, end)`
- `useMetricsRange(start, end)`

### نقاط مهمة

1. الملف فيه helper موحد `fetchWithAuth` بيدمج:
   - `credentials: include`
   - التحقق من `response.ok`
   - التحقق من `data.success`
2. كل hook بيحدد `refetchInterval` و `staleTime` حسب حساسية المقياس:
   - health/resources أسرع
   - التقارير الزمنية أبطأ

---

## 5) العلاقات مع الباك إند

| Hook Group | Backend Domain |
|---|---|
| useProject | Projects/Scenes/Characters/Shots Controllers |
| useAI | AI Controller |
| useMetrics | Metrics Controller |

ده بيخلي الجزء الأمامي مقسم بشكل domain-oriented وواضح في الصيانة.

---

## 6) ملاحظات هندسية وصيانة

1. **اتساق API Client:**
   - `useProject` فيه mix بين `api.*` و `fetch` المباشر.
   - الأفضل مستقبلاً توحيد الاتنين لطبقة واحدة لتسهيل retries/interceptors.

2. **اتساق Query Keys:**
   - المفاتيح حالياً مفهومة وواضحة، لكن يفضل تعريف constants مشتركة عند التوسع.

3. **التوسع الآمن:**
   - أي endpoint جديد في الباك إند يفضل يضاف له hook domain واضح بدل إضافة منطق داخل المكونات.

---

## 7) ملخص

الـ shared hooks الحالية بتقدم طبقة وسيطة قوية بين UI والـ API:
- تقلل التكرار داخل الصفحات.
- تضمن إدارة cache متوقعة.
- تسهّل اختبار منطق جلب/تحديث البيانات بعيداً عن طبقة العرض.
