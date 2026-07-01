import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function Terms() {
  return (
    <>
      <Helmet>
        <title>Foydalanish Shartlari va Qoidalari - VoiPlay</title>
        <meta name="description" content="VoiPlay.uz platformasidan foydalanish shartlari va qoidalari. O'zbekistondagi eng yaxshi streaming platformasida filmlar va seriallarni tomosha qilish uchun qoidalarni tanishing." />
        <meta name="keywords" content="foydalanish shartlari, qoidalari, voiplay shartlari, streaming platformasi qoidalari, o'zbek tilida kino shartlari" />
        <meta property="og:title" content="Foydalanish Shartlari va Qoidalari - VoiPlay" />
        <meta property="og:description" content="VoiPlay.uz platformasidan foydalanish shartlari va qoidalari. O'zbekistondagi eng yaxshi streaming platformasida filmlar va seriallarni tomosha qilish uchun qoidalarni tanishing." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://voiplay.uz/terms" />
        <meta property="og:site_name" content="VoiPlay" />
        <meta property="og:locale" content="uz_UZ" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@voiplayuz" />
        <meta name="twitter:title" content="Foydalanish Shartlari va Qoidalari - VoiPlay" />
        <meta name="twitter:description" content="VoiPlay.uz platformasidan foydalanish shartlari va qoidalari." />
      </Helmet>
      <div className="legal-page">
      <main className="legal-content">
        <div className="legal-container">
          <h1 className="legal-title">Foydalanish shartlari</h1>
          <div className="legal-text">
            <p className="legal-intro">
              VoiPlay.uz platformasidan foydalanish uchun quyidagi shartlarni qabul qilishingiz kerak.
            </p>

            <section className="legal-section">
              <h2>1. Umumiy qoidalar</h2>
              <p>
                VoiPlay.uz platformasidan foydalanish orqali siz ushbu foydalanish shartlariga rozilik bildirasiz. 
                Platformadan foydalanish davom etishingiz shartlarni to'liq qabul qilganingizni bildiradi.
              </p>
            </section>

            <section className="legal-section">
              <h2>2. Foydalanuvchi majburiyatlari</h2>
              <ul>
                <li>Platformadan faqat shaxsiy maqsadlarda foydalanish</li>
                <li>Boshqa foydalanuvchilarning huquqlariga hurmat ko'rsatish</li>
                <li>Noqonuniy faoliyat olib bormaslik</li>
                <li>Platformani xavfsizlik uchun xavf tug'dirmaslik</li>
                <li>Intellectual property huquqlariga rioya qilish</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>3. Kontent va materiallar</h2>
              <p>
                Platformadagi barcha kontentlar (filmlar, seriallar, multfilmlar va boshqalar) 
                mualliflik huquqlari bilan himoyalangan. Foydalanuvchilar kontentni ko'chirib olish, 
                tarqatish yoki tijorat maqsadlarida ishlatish taqiqlanadi.
              </p>
            </section>

            <section className="legal-section">
              <h2>2. Premium a'zolik</h2>
              <p>
                Premium a'zolik xizmatlari orqali foydalanuvchilarga qo'shimcha imkoniyatlar taqdim etiladi. 
                Premium a'zolik shartlari alohida kelishuv asosida belgilanadi.
              </p>
            </section>

            <section className="legal-section">
              <h2>5. Mas'uliyat cheklanishi</h2>
              <p>
                VoiPlay.uz platformasi kontent sifati, mavjudligi yoki uzilishi uchun javobgarlikni olmaydi. 
                Platformadan foydalanish natijasida yuzaga keladigan har qanday zarar uchun javobgarlik cheklanadi.
              </p>
            </section>

            <section className="legal-section">
              <h2>6. Shartlarni o'zgartirish</h2>
              <p>
                VoiPlay.uz istalgan vaqtda ushbu foydalanish shartlarini o'zgartirish huquqini saqlab qoladi. 
                O'zgarishlar platformada e'lon qilinganidan keyin kuchga kiradi.
              </p>
            </section>

            <section className="legal-section">
              <h2>7. Aloqa</h2>
              <p>
                Foydalanish shartlari bo'yicha savollaringiz bo'lsa, biz bilan quyidagi manzillar orqali bog'lanishingiz mumkin:
              </p>
              <ul>
                <li>Telegram: <a href="https://t.me/+DeBcIo2mXK0yNDli" target="_blank" rel="noreferrer">@voiplay</a></li>
                <li>Instagram: <a href="https://instagram.com/voiplaystudio" target="_blank" rel="noreferrer">@voiplaystudio</a></li>
                <li>YouTube: <a href="https://youtube.com/@voiplaytv" target="_blank" rel="noreferrer">@voiplaytv</a></li>
              </ul>
            </section>

            <p className="legal-footer">
              Oxgi yangilanish: {new Date().toLocaleDateString('uz-UZ')}
            </p>
          </div>
        </div>
      </main>

      <style>{`
        .legal-page {
          min-height: 100vh;
          background: var(--bg-base);
        }

        .legal-content {
          padding: 120px 4% 4rem;
          max-width: 900px;
          margin: 0 auto;
        }

        .legal-container {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 3rem;
        }

        .legal-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid var(--primary);
        }

        .legal-text {
          color: var(--text-muted);
          line-height: 1.8;
        }

        .legal-intro {
          font-size: 1.1rem;
          margin-bottom: 2rem;
          color: var(--text-main);
        }

        .legal-section {
          margin-bottom: 2rem;
        }

        .legal-section h2 {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 1rem;
        }

        .legal-section p {
          margin-bottom: 1rem;
        }

        .legal-section ul {
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }

        .legal-section li {
          margin-bottom: 0.5rem;
        }

        .legal-section a {
          color: var(--primary);
          text-decoration: none;
        }

        .legal-section a:hover {
          text-decoration: underline;
        }

        .legal-footer {
          margin-top: 3rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-color);
          font-size: 0.9rem;
          color: var(--text-muted-dark);
        }

        @media (max-width: 768px) {
          .legal-content {
            padding: 100px 4% 3rem;
          }

          .legal-container {
            padding: 2rem;
          }

          .legal-title {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
    </>
  );
}
