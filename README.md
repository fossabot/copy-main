# النسخة (The Copy) - Platform for Arabic Drama Analysis
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FCLOCKWORK-TEMPTATION%2Fcopy-main.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2FCLOCKWORK-TEMPTATION%2Fcopy-main?ref=badge_shield)


<div dir="rtl">

## منصة شاملة لتحليل الدراما العربية وتطوير السيناريوهات

**النسخة** هي منصة متكاملة تجمع بين قوة الذكاء الاصطناعي وأدوات الإنتاج الاحترافية لخدمة المبدعين العرب في مجال الدراما والسيناريو.

</div>

## 📚 Documentation | التوثيق

For comprehensive documentation in Arabic, please see:
**[PROJECT_DOCUMENTATION_AR.md](./PROJECT_DOCUMENTATION_AR.md)** - التوثيق الشامل باللغة العربية

Additional documentation:
- **[CLAUDE.md](./CLAUDE.md)** - Claude AI integration guide
- **[AGENTS.md](./AGENTS.md)** - AI Agents configuration
- **[product.md](./product.md)** - Product overview
- **[structure.md](./structure.md)** - Project structure
- **[tech.md](./tech.md)** - Technical specifications

## 🚀 Quick Start
>>>>>>>>>>>>>>>>>>>>
```bash
# Install dependencies
pnpm install

# Start all services (Frontend + Backend + Redis)
pnpm start

# Development mode with hot reload
pnpm start:dev

# Stop all services
pnpm kill:dev
```

## 🏗️ Architecture

- **Frontend**: Next.js 16 + React 19 + TypeScript (Port 5000)
- **Backend**: Express.js + TypeScript (Port 3000)
- **Database**: Neon PostgreSQL + Drizzle ORM
- **Cache**: Redis
- **AI**: Google Gemini AI + Groq SDK + Genkit
- **Monitoring**: Sentry + OpenTelemetry + Prometheus

## 📱 Applications (13 Core Apps)

<div dir="rtl">

المنصة تحتوي على **13 تطبيقاً أساسياً** متخصصاً:

### تطبيقات الإنتاج (Production)
1. **تحليل السيناريو** (ScriptBreakdown AI) - `/breakdown`
2. **استوديو الأزياء** (CineFit Pro) - `/new`
3. **استوديو التصوير السينمائي** (Cinematography Studio) - `/cinematography-studio`

### تطبيقات الإبداع (Creative)
4. **محرر السيناريو** (Screenplay Editor) - `/editor`
5. **مدير الديكور والفن** (CineArchitect AI) - `/art-director`
6. **استوديو الممثل** (ActorAI Studio) - `/actorai-arabic`
7. **استوديو الكتابة الإبداعية** (Creative Writing Studio) - `/arabic-creative-writing-studio`
8. **العصف الذهني الذكي** (Brain Storm AI) - `/brain-storm-ai`
9. **استوديو هندسة التوجيهات** (Prompt Engineering Studio) - `/arabic-prompt-engineering-studio`

### تطبيقات التحليل (Analysis)
10. **محطات التحليل السبع** (Seven Stations Analysis) - `/analysis`

### تطبيقات الإدارة (Management)
11. **استوديو المخرج** (Director's Studio) - `/directors-studio`
12. **ميزانية الإنتاج** (FilmBudget AI) - `/BUDGET/app`
13. **إدارة المساعدين** (BreakApp Runner Management) - `/BREAKAPP`

---

**🔍 عرض شامل لجميع التطبيقات:** [صفحة التطبيقات](/apps-overview)

للمزيد من التفاصيل حول كل تطبيق، راجع [التوثيق الشامل](./PROJECT_DOCUMENTATION_AR.md).

</div>

## 🤖 Seven-Agent Analysis System

The platform features a sophisticated seven-agent system for comprehensive screenplay analysis:

1. **Character Deep Analyzer** - محلل الشخصيات المتعمق
2. **Dialogue Advanced Analyzer** - محلل الحوار المتقدم
3. **Cultural Historical Analyzer** - محلل السياق الثقافي والتاريخي
4. **Target Audience Analyzer** - محلل الجمهور المستهدف
5. **Themes Messages Analyzer** - محلل الثيمات والرسائل
6. **Visual Cinematic Analyzer** - محلل البصريات السينمائية
7. **Producibility Analyzer** - محلل قابلية الإنتاج

## 🛠️ Development

### Frontend Commands
```bash
cd frontend
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm test         # Run tests
pnpm e2e          # Run E2E tests
pnpm typecheck    # TypeScript validation
pnpm lint         # Lint code
```

### Backend Commands
```bash
# From repository root
pnpm --filter @the-copy/backend dev          # Development server
pnpm --filter @the-copy/backend build        # Build
pnpm --filter @the-copy/backend test         # Tests
pnpm --filter @the-copy/backend db:generate  # Generate migrations
pnpm --filter @the-copy/backend db:push      # Push schema
pnpm --filter @the-copy/backend db:studio    # Drizzle Studio
```

## 🌐 Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Redis
REDIS_URL=redis://localhost:6379

# AI Services
GOOGLE_GENAI_API_KEY=your_key
GROQ_API_KEY=your_key

# Authentication
JWT_SECRET=your_secret
SESSION_SECRET=your_secret

# Monitoring
SENTRY_DSN=your_dsn
NEXT_PUBLIC_SENTRY_DSN=your_public_dsn
```

## 📦 Tech Stack

### Frontend
- Next.js 16 (App Router)
- React 19
- TypeScript 5.7+
- Tailwind CSS v4 (OKLCH colors)
- Radix UI (Shadcn/ui)
- GSAP + Framer Motion + Three.js
- Zustand + React Query
- Socket.io Client

### Backend  
- Express.js 5
- TypeScript 5.0+
- Drizzle ORM
- PostgreSQL (Neon)
- Redis + BullMQ
- Socket.io
- Google Gemini AI
- Winston Logger

### DevOps & Monitoring
- Sentry (Error tracking)
- OpenTelemetry (Tracing)
- Prometheus + Grafana
- Docker
- GitHub Actions

## 🎯 Target Audience

<div dir="rtl">

- **الكتّاب والسيناريست**: أدوات كتابة وتحليل متقدمة
- **المخرجون**: إدارة مشاريع وتخطيط إنتاجي
- **الممثلون**: تسجيل Self-Tape وتحسين الأداء
- **مديرو الإنتاج**: تخطيط موارد وتقدير ميزانيات
- **الفرق الإنتاجية**: أدوات تعاون وإدارة مشاريع

</div>

## 📄 License

All rights reserved © 2024 The Copy Platform


[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FCLOCKWORK-TEMPTATION%2Fcopy-main.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2FCLOCKWORK-TEMPTATION%2Fcopy-main?ref=badge_large)

## 🤝 Contributing

This is a private project. For questions or issues, please contact the development team.

---

<div dir="rtl" align="center">

**صُنع بـ ❤️ للمبدعين العرب في مجال الدراما**

Made with ❤️ for Arabic Drama Creators

</div>