# VELNEX - O'quv Markazini Boshqarish Tizimi (CRM)

VELNEX — zamonaviy o'quv markazlari faoliyatini to'liq avtomatlashtirish uchun mo'ljallangan kompleks SaaS CRM platformasi.

## Loyiha Texnologiyalari

- **Frontend**: React 18, Vite, React Router 6, Vanilla CSS
- **Backend**: Node.js, Express.js, Sequelize ORM, Joi Validation, Swagger JSDoc
- **Ma'lumotlar Bazasi**: PostgreSQL

## Modullar

1. **Dashboard** — Markaziy analitika va KPI hisoboti
2. **Guruhlar & Kurslar** — Jadval to'qnashuv detektori bilan guruhlar taqvimi
3. **O'quvchilar** — O'quvchilar bazasi va guruhlarga biriktirish
4. **Davomat** — O'quvchilar davomati va sabablar tahlili
5. **To'lovlar & Moliya** — To'lov kvitansiyalari va qarzdorliklar nazorati
6. **O'qituvchilar** — Ustozlar reytingi va maosh hisob-kitobi
7. **Imtihonlar** — Test va baholash tizimi
8. **Uyga Vazifalar** — Vazifalar monitoringi
9. **Sertifikatlar** — QR-kodli bitiruv sertifikatlari
10. **Xonalar & Inventar** — O'quv xonalari sig'imi va jihozlari
11. **Lidlar** — Yangi arizalar va mijozlar voronkasi (Sales CRM)

## Ishga Tushirish

### Backend

```bash
cd backend
npm install
node src/server.js
```

Backend manzili: `http://localhost:5000`
Swagger API: `http://localhost:5000/api-docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend manzili: `http://localhost:5173`
