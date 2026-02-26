# هيكلة الواجهة الأمامية - النسخة (The Copy)

**المشروع:** frontend (Next.js 16)
**المسار:** `frontend/src/app/(main)/`

## التطبيقات الرئيسية (Main Apps)

يحتوي المجلد `(main)` على التطبيقات الـ 13 المستقلة التي تشكل منصة النسخة.

| التطبيق | المجلد | الوصف (مبدئي) |
|---------|--------|---------------|
| **ActorAI Studio** | `actorai-arabic/` | استوديو الممثل بالذكاء الاصطناعي (عربي) |
| **Analysis** | `analysis/` | أدوات التحليل (Seven Stations) |
| **Apps Overview** | `apps-overview/` | نظرة عامة على التطبيقات |
| **Creative Writing** | `arabic-creative-writing-studio/` | استوديو الكتابة الإبداعية العربية |
| **Prompt Engineering** | `arabic-prompt-engineering-studio/` | هندسة المحفزات العربية |
| **Art Director** | `art-director/` | المخرج الفني (CineArchitect) |
| **Brainstorm AI** | `brain-storm-ai/` | العصف الذهني (Brain Storm) |
| **Breakdown** | `breakdown/` | تحليل السيناريو (Script Breakdown) |
| **Cinematography** | `cinematography-studio/` | استوديو التصوير السينمائي |
| **Director's Studio** | `directors-studio/` | استوديو المخرج (إدارة المشاريع) |
| **Editor** | `editor/` | محرر السيناريو |
| **Metrics** | `metrics-dashboard/` | لوحة قياس الأداء |
| **StyleIST** | `styleIST/` | تحليل الأسلوب |
| **BreakApp** | `BREAKAPP/` | تطبيق تفكيك المشاهد (نسخة أخرى؟) |
| **Budget** | `BUDGET/` | ميزانية الفيلم |

## بنية المجلد `(main)`

```mermaid
graph TD
    subgraph "(main)"
        layout[layout.tsx]
        page[page.tsx]
        
        subgraph "Apps"
            actor[actorai-arabic]
            analysis[analysis]
            creative[arabic-creative-writing-studio]
            prompt[arabic-prompt-engineering-studio]
            art[art-director]
            brain[brain-storm-ai]
            breakdown[breakdown]
            cine[cinematography-studio]
            director[directors-studio]
            editor[editor]
            style[styleIST]
        end
        
        layout --> Apps
    end
```

## المكونات المشتركة

- `src/components/ui/`: مكتبة مكونات واجهة المستخدم (Radix UI + Tailwind)
- `src/components/figma/`: مكونات مستوحاة من تصاميم Figma
- `src/components/aceternity/`: مكونات بصرية متقدمة (Aceternity UI)

## إدارة الحالة (State Management)

- **Zustand:** يستخدم لإدارة الحالة العامة للتطبيقات (مثل `projectStore`, `screenplayStore`).

## الملاحظات
- وجود مجلدات بأحرف كبيرة (`BREAKAPP`, `BUDGET`) قد يشير إلى نسخ قديمة أو نمط تسمية مختلف.
- `brainstorm` و `brain-storm-ai` قد يكونان تكراراً.
