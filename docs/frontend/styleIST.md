# توثيق تطبيق styleIST (CineFit Pro)

**المسار:** `frontend/src/app/(main)/styleIST/`  
**نوع التطبيق:** تصميم أزياء + Fitting افتراضي + خدمات Gemini  
**نقطة الدخول:** `page.tsx` → `cinefit-app.tsx`

---

## 1) ملخص سريع

رغم اسم المجلد `styleIST`، واجهة التطبيق المعروضة للمستخدم هي **CineFit Pro**.
التطبيق بيشتغل بثلاثة أوضاع تشغيل رئيسية:
- `home`
- `director`
- `fitting`

في وضع `director` بيتم توليد تصميم احترافي عبر خدمة Gemini (`services/geminiService.ts`) ثم الانتقال لوضع `fitting` لاختبار النتيجة.

---

## 2) مسار التنفيذ

```mermaid
flowchart LR
    A[page.tsx] --> B[WebGLErrorBoundary]
    B --> C[dynamic import: cinefit-app.tsx]
    C --> D{mode}
    D -->|home| E[اختيار المسار]
    D -->|director| F[Design Brief -> Processing -> Lookbook]
    D -->|fitting| G[FittingRoom]
    F --> H[generateProfessionalDesign]
    H --> I[/api/gemini]
```

---

## 3) مكونات أساسية

- `page.tsx`: يلف التطبيق بـ `WebGLErrorBoundary` ويقدّم fallback لو WebGL غير متاح.
- `cinefit-app.tsx`: منطق الـ state machine الأساسي (mode + director sub-views).
- `components/StartScreen.tsx`: جمع brief.
- `components/FittingRoom.tsx`: تجربة القياس/التركيب.
- `services/geminiService.ts`: طبقة client-side موحدة لاستدعاءات `/api/gemini`.

---

## 4) تكامل الذكاء الاصطناعي

الخدمة تدعم عمليات متعددة عبر action-based API:
- `generateDesign`
- `transcribeAudio`
- `analyzeVideo`
- `generateGarment`
- `generateVirtualFit`
- `editGarment`

وفي fallback values عند غياب بعض الحقول في الرد.

---

## 5) ملاحظات هندسية

- فصل واضح بين طبقة UI (`cinefit-app.tsx`) وطبقة التكامل (`services/geminiService.ts`).
- استخدام `dynamic(..., { ssr:false })` لتجنب مشاكل SSR مع WebGL ومكونات ثقيلة.
- وجود مجلد `ai-agents/` داخلي يوثّق منظومة وكلاء مستقلة مرتبطة بنطاق التطبيق.

---

## 6) ملفات مرجعية مقروءة

- `frontend/src/app/(main)/styleIST/page.tsx`
- `frontend/src/app/(main)/styleIST/cinefit-app.tsx`
- `frontend/src/app/(main)/styleIST/services/geminiService.ts`
- `frontend/src/app/(main)/styleIST/ai-agents/OVERVIEW.md`

---

**آخر تحديث:** 2026-02-15
