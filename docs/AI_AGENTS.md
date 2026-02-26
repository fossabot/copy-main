# هيكلة وكلاء الذكاء الاصطناعي - النسخة (The Copy)

**المشروع:** backend/frontend
**المسار:** `backend/src/agents/` و `frontend/src/ai/`

## نظرة عامة

تعتمد المنصة على نظام متعدد الوكلاء (Multi-Agent System) لتحليل وتحسين السيناريوهات. ينقسم النظام إلى:
1.  **وكلاء الواجهة الخلفية (Backend Agents):** وكلاء متخصصون للمهام الثقيلة والتحليل العميق.
2.  **خدمات الواجهة الأمامية (Frontend Services):** تكامل مباشر مع Gemini AI للمهام التفاعلية.

## وكلاء التحليل (Analysis Agents)

المسار: `backend/src/agents/analysis/`

هؤلاء الوكلاء مسؤولون عن تفكيك وتحليل عناصر السيناريو المختلفة.

| الوكيل | الملف | الوظيفة |
|--------|-------|---------|
| **Analysis Agent** | `analysisAgent.ts` | المحلل العام للسيناريو (المنسق) |
| **Character Deep Analyzer** | `characterDeepAnalyzerAgent.ts` | تحليل عميق للشخصيات وأبعادها النفسية |
| **Character Network** | `characterNetworkAgent.ts` | تحليل شبكة العلاقات بين الشخصيات |
| **Character Voice** | `characterVoiceAgent.ts` | تحليل صوت الشخصية وتفردها |
| **Conflict Dynamics** | `conflictDynamicsAgent.ts` | تحليل ديناميكيات الصراع وتطوره |
| **Cultural & Historical** | `culturalHistoricalAnalyzerAgent.ts` | التحليل الثقافي والتاريخي للنص |
| **Dialogue Advanced** | `dialogueAdvancedAnalyzerAgent.ts` | تحليل متقدم للحوار (Subtext) |
| **Dialogue Forensics** | `dialogueForensicsAgent.ts` | التحليل الجنائي للحوار (كشف الكذب/الدوافع) |
| **Literary Quality** | `literaryQualityAnalyzerAgent.ts` | تقييم الجودة الأدبية والأسلوبية |
| **Plot Predictor** | `plotPredictorAgent.ts` | التنبؤ بمسار الحبكة والثغرات |
| **Producibility** | `producibilityAnalyzerAgent.ts` | تحليل إمكانية الإنتاج والميزانية التقديرية |
| **Rhythm Mapping** | `rhythmMappingAgent.ts` | رسم خرائط إيقاع المشاهد |
| **Target Audience** | `targetAudienceAnalyzerAgent.ts` | تحليل الجمهور المستهدف ومدى الملاءمة |
| **Thematic Mining** | `thematicMiningAgent.ts` | استخراج الثيمات والمواضيع الضمنية |
| **Themes & Messages** | `themesMessagesAnalyzerAgent.ts` | تحليل الرسائل والقيم |
| **Visual Cinematic** | `visualCinematicAnalyzerAgent.ts` | التحليل البصري والسينمائي |

## وكلاء التحويل (Transformation Agents)

المسار: `backend/src/agents/transformation/`

مسؤولون عن تعديل أو تكييف النص.

| الوكيل | الملف | الوظيفة |
|--------|-------|---------|
| **Adaptive Rewriting** | `adaptiveRewritingAgent.ts` | إعادة الكتابة التكيفية |
| **Platform Adapter** | `platformAdapterAgent.ts` | تكييف النص لمنصات مختلفة |
| **Style Fingerprint** | `styleFingerprintAgent.ts` | تحليل ومحاكاة بصمة الأسلوب |

## خدمة Gemini AI (Frontend)

المسار: `frontend/src/ai/gemini-service.ts`

توفر واجهة موحدة للتعامل مع Google Gemini API.

- **Models:** تدعم `gemini-1.5-flash`, `gemini-1.5-pro`.
- **Modes:** تدعم أوضاع `analysis`, `creative`, `chat`.
- **Capabilities:** تحليل النصوص، تحسين المحفزات (Prompt Enhancement).

## تكوين الوكيل (Agent Config)

يتم تعريف كل وكيل باستخدام واجهة `AIAgentConfig`. مثال (`analysis/config.ts`):

```typescript
export const ANALYSIS_AGENT_CONFIG: AIAgentConfig = {
    id: TaskType.ANALYSIS,
    name: "CritiqueArchitect AI",
    category: TaskCategory.CORE,
    capabilities: {
        reasoningChains: true,
        memorySystem: true,
        selfReflection: true,
        // ...
    },
    systemPrompt: "...", // تعليمات النظام التفصيلية
    // ...
};
```

## آلية العمل

1.  يستقبل `AnalysisController` الطلب.
2.  يتم استدعاء الوكيل المناسب (مثلاً `AnalysisAgent`).
3.  يستخدم الوكيل `GeminiService` (أو مثيله في الخلفية) لإرسال النص مع `System Prompt` و `User Prompt`.
4.  يتم معالجة الرد وإرجاعه بتنسيق مهيكل.
