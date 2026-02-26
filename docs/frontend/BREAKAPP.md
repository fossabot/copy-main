# توثيق تطبيق BREAKAPP

**المسار:** `frontend/src/app/(main)/BREAKAPP/`  
**النوع:** تطبيق إدارة وتشغيل ميداني (Crew / Runner)  
**نقطة الدخول الفعلية:** `app/page.tsx`

---

## 1) ملخص سريع

`BREAKAPP` تطبيق ميداني بيركز على:
- مصادقة سريعة (QR + JWT)
- تتبع ومزامنة فورية عبر Socket
- تدفق توجيه تلقائي حسب حالة تسجيل الدخول

من أول فتح الصفحة، التطبيق بيقرر يودي المستخدم:
- `/dashboard` لو authenticated
- `/login/qr` لو مش authenticated

---

## 2) مسار التنفيذ

```mermaid
flowchart LR
    A[app/page.tsx] --> B[isAuthenticated]
    B --> C{authenticated?}
    C -->|yes| D[/dashboard]
    C -->|no| E[/login/qr]

    F[lib/auth.ts] --> G[JWT token in localStorage]
    F --> H[Axios interceptor]

    I[hooks/useSocket.ts] --> J[socket.io-client]
    J --> K[real-time events]
```

---

## 3) مكونات ومنطق أساسي

- `app/page.tsx`: صفحة bootstrap للتوجيه حسب حالة المصادقة.
- `lib/auth.ts`:
  - إدارة token
  - Axios instance
  - إضافة Authorization header تلقائيًا
- `hooks/useSocket.ts`:
  - lifecycle كامل للاتصال
  - reconnect تلقائي
  - API موحد: `emit`, `on`, `off`, `connect`, `disconnect`

---

## 4) التكامل مع المنصة الأم

حسب README الداخلي للتطبيق، التكامل بيعتمد على:
- REST API عبر `NEXT_PUBLIC_API_URL`
- Socket.io عبر `NEXT_PUBLIC_SOCKET_URL`

وده مناسب لطبيعة التطبيق الميدانية اللي محتاجة تحديثات لحظية.

---

## 5) ملاحظات هندسية

- التوجيه المبكر في `app/page.tsx` بيقلل احتكاك المستخدم.
- `useSocket` مكتوب بطريقة قابلة لإعادة الاستخدام بوضوح.
- `lib/auth.ts` مركزي لتوحيد سلوك المصادقة داخل التطبيق.

---

## 6) ملفات مرجعية مقروءة

- `frontend/src/app/(main)/BREAKAPP/app/page.tsx`
- `frontend/src/app/(main)/BREAKAPP/hooks/useSocket.ts`
- `frontend/src/app/(main)/BREAKAPP/lib/auth.ts`
- `frontend/src/app/(main)/BREAKAPP/README.md`

---

**آخر تحديث:** 2026-02-15
