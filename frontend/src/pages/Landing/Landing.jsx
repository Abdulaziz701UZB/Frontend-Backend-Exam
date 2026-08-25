import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HiOutlinePhone,
  HiOutlineChatBubbleLeftRight,
  HiOutlineCheckCircle,
  HiOutlineAcademicCap,
  HiOutlineCreditCard,
  HiOutlineUserGroup,
  HiOutlineDevicePhoneMobile,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineSquares2X2,
  HiOutlineUsers,
  HiOutlineCalendarDays,
  HiOutlineCurrencyDollar,
  HiOutlineIdentification
} from "react-icons/hi2";
import {
  FaTelegram,
  FaInstagram,
  FaYoutube,
  FaCheck,
  FaArrowRight,
  FaChalkboardUser,
  FaGraduationCap
} from "react-icons/fa6";
import { useEduAuth } from "../../context/EduAuthContext";
import "./Landing.css";

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useEduAuth();
  const [selectedScreen, setSelectedScreen] = useState("dashboard");

  const screens = {
    dashboard: {
      title: "Boshqaruv Markazi (Dashboard)",
      desc: "Umumiy tushum, faol guruhlar, jami o'quvchilar va qarzdorliklar real vaqt rejimida.",
      img: "/velnex-hero-banner.png",
      badge: "Umumiy Tahlil"
    },
    students: {
      title: "O'quvchilar Boshqaruvi",
      desc: "O'quvchilarning to'liq ro'yxati, 9 xonali ID, to'lov holati va shaxsiy profili.",
      img: "/velnex-students-preview.png",
      badge: "O'quvchilar"
    },
    groups: {
      title: "Kurslar va Guruhlar Boshqaruvi",
      desc: "Guruhlar dars jadvali, to'lov salomatligi, xonalar va o'qituvchilar taqsimoti.",
      img: "/velnex-groups-preview.png",
      badge: "Guruhlar"
    },
    attendance: {
      title: "Davomat va Baholar Jurnali",
      desc: "Kunlik dars davomati (Keldi / Kelmadi), baholar va test natijalari.",
      img: "/velnex-attendance-preview.png",
      badge: "Davomat"
    },
    teachers: {
      title: "O'qituvchilar va Xodimlar",
      desc: "O'qituvchilar maosh stavkalari, dars soatlari, tajribasi va profillari.",
      img: "/velnex-teachers-preview.png",
      badge: "Ustozlar"
    },
    payments: {
      title: "To'lovlar va Kassa Boshqaruvi",
      desc: "Click, Payme, naqd pul kassa hisoboti, kvitansiyalar va qarzdorlar ro'yxati.",
      img: "/velnex-payments-preview.png",
      badge: "Moliya"
    }
  };

  const activeData = screens[selectedScreen] || screens.dashboard;

  return (
    <div className="velnex-landing-page">
      {/* Background Ambient Glows */}
      <div className="ambient-glow glow-top-left"></div>
      <div className="ambient-glow glow-top-right"></div>
      <div className="ambient-glow glow-center"></div>

      {/* Top Phone Info Bar */}
      <div className="landing-topbar">
        <div className="landing-container topbar-flex">
          <div className="topbar-left">
            <span className="topbar-badge">YANGI</span>
            <span className="topbar-text">VELNEX 2.0 yangi avlod boshqaruv tizimi ishga tushdi!</span>
          </div>
          <div className="topbar-right">
            <a href="tel:+998905990600" className="topbar-phone-link">
              <HiOutlinePhone className="topbar-icon" />
              <span>+998 (90) 599-06-00</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="landing-navbar-wrap">
        <div className="landing-container navbar-flex">
          <Link to="/" className="landing-brand-logo">
            <div className="brand-logo-glow-wrap">
              <img src="/velnex-logo.png" alt="VELNEX" className="brand-logo-img" />
            </div>
            <span className="brand-logo-text">VELNEX</span>
          </Link>

          <nav className="landing-nav-menu">
            <a href="#showcase" className="nav-item">Platforma Ko'rinishi</a>
            <a href="#features" className="nav-item">Imkoniyatlar</a>
            <a href="#pricing" className="nav-item">Narxlar</a>
            <a href="#stats" className="nav-item">Statistika</a>
          </nav>

          <div className="landing-nav-actions">
            <a
              href="https://t.me/Abdulaziz7o1"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-contact-telegram"
            >
              <HiOutlineChatBubbleLeftRight className="btn-icon" />
              <span>Biz bilan bog'lanish</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero-section">
        <div className="landing-container hero-grid">
          <div className="hero-content-col">
            <div className="hero-badge-pill">
              <HiOutlineSparkles className="pill-icon" />
              <span>O'quv markazlari uchun №1 avtomatlashtirish</span>
            </div>

            <h1 className="hero-main-title">
              <span className="brand-highlight">VELNEX</span> bilan o`quv markazingizni avtomatlashtiring
            </h1>

            <p className="hero-subtitle">
              Bepul demo versiyani sinab ko'ring va platformaning barcha imkoniyatlarini o'rganing. Davomat, to'lovlar, Telegram bot va o'quvchilar nazorati bir joyda.
            </p>

            <div className="hero-action-buttons">
              <button
                type="button"
                onClick={() => navigate(isAuthenticated ? "/dashboard" : "/login")}
                className="btn-hero-primary"
              >
                <span>Bizga qo'shiling</span>
                <FaArrowRight className="btn-icon-right" />
              </button>
            </div>

            <div className="hero-trust-row">
              <div className="trust-item">
                <HiOutlineCheckCircle className="trust-icon" />
                <span>Tezkor sozlash</span>
              </div>
              <div className="trust-item">
                <HiOutlineCheckCircle className="trust-icon" />
                <span>24/7 Qo'llab-quvvatlash</span>
              </div>
              <div className="trust-item">
                <HiOutlineCheckCircle className="trust-icon" />
                <span>Telegram Bot ulangan</span>
              </div>
            </div>
          </div>

          <div className="hero-visual-col">
            <div className="hero-banner-frame">
              <div className="banner-frame-header">
                <div className="frame-dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <div className="frame-address-bar">
                  <span className="secure-icon">🔒</span>
                  <span className="frame-url">app.velnex.uz/dashboard</span>
                </div>
              </div>
              <div className="banner-frame-body">
                <img
                  src="/velnex-hero-banner.png"
                  alt="VELNEX Boshqaruv Markazi"
                  className="hero-banner-main-img"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section id="stats" className="landing-stats-bar">
        <div className="landing-container stats-flex">
          <div className="stat-counter-item">
            <span className="counter-val">1,400+</span>
            <span className="counter-title">Faol O'quvchilar</span>
          </div>
          <div className="stat-counter-divider"></div>
          <div className="stat-counter-item">
            <span className="counter-val">99.8%</span>
            <span className="counter-title">Davomat Aniqligi</span>
          </div>
          <div className="stat-counter-divider"></div>
          <div className="stat-counter-item">
            <span className="counter-val">40%</span>
            <span className="counter-title">Vaqt Tejalishi</span>
          </div>
          <div className="stat-counter-divider"></div>
          <div className="stat-counter-item">
            <span className="counter-val">24/7</span>
            <span className="counter-title">Telegram Bot Xizmati</span>
          </div>
        </div>
      </section>

      {/* Interactive Platform Live Screen Showcase */}
      <section id="showcase" className="landing-showcase-gallery-section">
        <div className="landing-container">
          <div className="section-head-center">
            <span className="section-subtitle-tag">JONLI KO'RINISHLAR</span>
            <h2 className="section-main-heading">
              Platformaning Asosiy Bo'limlari
            </h2>
            <p className="section-desc-text">
              Quyidagi bo'limlardan birini tanlang va VELNEX tizimining haqiqiy sahifalarini ko'zdan kechiring.
            </p>
          </div>

          <div className="showcase-tabs-nav">
            <button
              type="button"
              className={`showcase-tab-btn ${selectedScreen === "dashboard" ? "active" : ""}`}
              onClick={() => setSelectedScreen("dashboard")}
            >
              <HiOutlineSquares2X2 className="tab-icon" />
              <span>Dashboard</span>
            </button>
            <button
              type="button"
              className={`showcase-tab-btn ${selectedScreen === "students" ? "active" : ""}`}
              onClick={() => setSelectedScreen("students")}
            >
              <HiOutlineUsers className="tab-icon" />
              <span>O'quvchilar</span>
            </button>
            <button
              type="button"
              className={`showcase-tab-btn ${selectedScreen === "groups" ? "active" : ""}`}
              onClick={() => setSelectedScreen("groups")}
            >
              <HiOutlineCalendarDays className="tab-icon" />
              <span>Guruhlar</span>
            </button>
            <button
              type="button"
              className={`showcase-tab-btn ${selectedScreen === "attendance" ? "active" : ""}`}
              onClick={() => setSelectedScreen("attendance")}
            >
              <HiOutlineAcademicCap className="tab-icon" />
              <span>Davomat</span>
            </button>
            <button
              type="button"
              className={`showcase-tab-btn ${selectedScreen === "teachers" ? "active" : ""}`}
              onClick={() => setSelectedScreen("teachers")}
            >
              <FaChalkboardUser className="tab-icon" />
              <span>O'qituvchilar</span>
            </button>
            <button
              type="button"
              className={`showcase-tab-btn ${selectedScreen === "payments" ? "active" : ""}`}
              onClick={() => setSelectedScreen("payments")}
            >
              <HiOutlineCurrencyDollar className="tab-icon" />
              <span>To'lovlar & Kassa</span>
            </button>
          </div>

          <div className="showcase-display-wrapper">
            <div className="showcase-meta-header">
              <div className="showcase-meta-left">
                <span className="showcase-badge">{activeData.badge}</span>
                <h3 className="showcase-active-title">{activeData.title}</h3>
                <p className="showcase-active-desc">{activeData.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => navigate(isAuthenticated ? "/dashboard" : "/login")}
                className="btn-showcase-cta"
              >
                <span>Sinab Ko'rish</span>
                <FaArrowRight />
              </button>
            </div>

            <div className="showcase-mac-window">
              <div className="mac-window-top">
                <div className="frame-dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <div className="mac-url-bar">
                  <span className="secure-icon">🔒</span>
                  <span>app.velnex.uz/{selectedScreen}</span>
                </div>
              </div>
              <div className="mac-window-content">
                <img
                  key={activeData.img}
                  src={activeData.img}
                  alt={activeData.title}
                  className="showcase-screen-img"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="landing-features-section">
        <div className="landing-container">
          <div className="section-head-center">
            <span className="section-subtitle-tag">IMKONIYATLAR</span>
            <h2 className="section-main-heading">
              O'quv markazingiz uchun barcha zarur vositalar
            </h2>
            <p className="section-desc-text">
              Qog'oz jurnallar va chalkash hisob-kitoblarni unuting. VELNEX har bir jarayonni avtomatlashtiradi.
            </p>
          </div>

          <div className="features-card-grid">
            <div className="feature-item-card">
              <div className="feature-icon-box box-indigo">
                <HiOutlineAcademicCap />
              </div>
              <h3 className="feature-card-title">Davomat va QR-Check</h3>
              <p className="feature-card-desc">
                O'quvchilar davomati planshet yoki telefon orqali 1 bosishda olinadi. Kelmagan o'quvchilar ota-onasiga avtomatik xabar ketadi.
              </p>
            </div>

            <div className="feature-item-card">
              <div className="feature-icon-box box-emerald">
                <HiOutlineCreditCard />
              </div>
              <h3 className="feature-card-title">Moliya va Kassa Boshqaruvi</h3>
              <p className="feature-card-desc">
                Click, Payme, naqd pul va bank o'tkazmalari bo'yicha to'lovlarni qabul qilish, qarzdorliklar nazorati va oylik sof foyda hisoboti.
              </p>
            </div>

            <div className="feature-item-card">
              <div className="feature-icon-box box-blue">
                <FaTelegram />
              </div>
              <h3 className="feature-card-title">Telegram Bot Integratsiyasi</h3>
              <p className="feature-card-desc">
                Ustozlar, ota-onalar va o'quvchilar uchun to'liq avtomatlashtirilgan Telegram bot. Dars jadvali, baholar va to'lov xabarnomalari.
              </p>
            </div>

            <div className="feature-item-card">
              <div className="feature-icon-box box-amber">
                <HiOutlineUserGroup />
              </div>
              <h3 className="feature-card-title">Lidlar va Yangi Arizalar</h3>
              <p className="feature-card-desc">
                Instagram, Telegram va saytdan tushgan barcha yangi arizalarni voronka bo'yicha saralash va sotuvga aylantirish.
              </p>
            </div>

            <div className="feature-item-card">
              <div className="feature-icon-box box-purple">
                <HiOutlineDevicePhoneMobile />
              </div>
              <h3 className="feature-card-title">Student & Parent Ilovasi</h3>
              <p className="feature-card-desc">
                O'quvchilar o'z baholari, uy vazifalari va dars jadvallarini ko'rib borishi uchun maxsus qulay shaxsiy kabinet.
              </p>
            </div>

            <div className="feature-item-card">
              <div className="feature-icon-box box-rose">
                <HiOutlineShieldCheck />
              </div>
              <h3 className="feature-card-title">Xavfsizlik va Rollar Nazorati</h3>
              <p className="feature-card-desc">
                Bosh admin, filial menejeri, o'qituvchi va kassir uchun alohida kirish huquqlari va ma'lumotlar xavfsizligi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="landing-pricing-section">
        <div className="landing-container">
          <div className="section-head-center">
            <span className="section-subtitle-tag">TARIFLAR</span>
            <h2 className="section-main-heading">
              Markazingiz hajmiga mos qulay narxlar
            </h2>
            <p className="section-desc-text">
              Yashirin to'lovlarsiz, 14 kunlik bepul sinov muddati bilan.
            </p>
          </div>

          <div className="pricing-grid">
            {/* Plan 1 */}
            <div className="pricing-card">
              <div className="pricing-head">
                <h3 className="plan-name">Start</h3>
                <p className="plan-desc">Kichik o'quv markazlari va repetitorlar uchun</p>
                <div className="plan-price-wrap">
                  <span className="plan-price">290,000</span>
                  <span className="plan-period">so'm / oy</span>
                </div>
              </div>
              <ul className="plan-features-list">
                <li><FaCheck className="check-icon" /> 100 tagacha o'quvchi</li>
                <li><FaCheck className="check-icon" /> Davomat va Jurnal</li>
                <li><FaCheck className="check-icon" /> To'lovlar va Kassa</li>
                <li><FaCheck className="check-icon" /> 1 ta Administrator</li>
              </ul>
              <button
                type="button"
                onClick={() => navigate(isAuthenticated ? "/dashboard" : "/login")}
                className="btn-plan-select"
              >
                Tanlash
              </button>
            </div>

            {/* Plan 2: Featured */}
            <div className="pricing-card featured">
              <div className="featured-ribbon">Eng Ommabop</div>
              <div className="pricing-head">
                <h3 className="plan-name">Standart</h3>
                <p className="plan-desc">O'rta o'quv markazlari va akademiyalar uchun</p>
                <div className="plan-price-wrap">
                  <span className="plan-price">590,000</span>
                  <span className="plan-period">so'm / oy</span>
                </div>
              </div>
              <ul className="plan-features-list">
                <li><FaCheck className="check-icon" /> 500 tagacha o'quvchi</li>
                <li><FaCheck className="check-icon" /> Telegram Bot integratsiyasi</li>
                <li><FaCheck className="check-icon" /> SMS ogohlantirishlar</li>
                <li><FaCheck className="check-icon" /> Lidlar voronkasi</li>
                <li><FaCheck className="check-icon" /> Cheksiz O'qituvchilar</li>
              </ul>
              <button
                type="button"
                onClick={() => navigate(isAuthenticated ? "/dashboard" : "/login")}
                className="btn-plan-select featured-btn"
              >
                Boshlash
              </button>
            </div>

            {/* Plan 3 */}
            <div className="pricing-card">
              <div className="pricing-head">
                <h3 className="plan-name">Pro Enterprise</h3>
                <p className="plan-desc">Katta tarmoqli markazlar va filiallar uchun</p>
                <div className="plan-price-wrap">
                  <span className="plan-price">990,000</span>
                  <span className="plan-period">so'm / oy</span>
                </div>
              </div>
              <ul className="plan-features-list">
                <li><FaCheck className="check-icon" /> Cheksiz o'quvchilar</li>
                <li><FaCheck className="check-icon" /> Ko'p filialli tizim</li>
                <li><FaCheck className="check-icon" /> Shaxsiy brending va domen</li>
                <li><FaCheck className="check-icon" /> 24/7 Shaxsiy menejer</li>
                <li><FaCheck className="check-icon" /> Maxsus API integratsiya</li>
              </ul>
              <button
                type="button"
                onClick={() => navigate(isAuthenticated ? "/dashboard" : "/login")}
                className="btn-plan-select"
              >
                Bog'lanish
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container footer-flex">
          <div className="footer-brand-info">
            <div className="footer-logo-row">
              <img src="/velnex-logo.png" alt="VELNEX" className="footer-logo-img" />
              <span className="footer-logo-title">VELNEX</span>
            </div>
            <p className="footer-tagline">
              O'zbekistondagi zamonaviy o'quv markazlari va ta'lim muassasalarini boshqarish platformasi.
            </p>
            <div className="footer-social-links">
              <a href="https://t.me/Abdulaziz7o1" target="_blank" rel="noopener noreferrer" className="social-icon-btn">
                <FaTelegram />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn">
                <FaInstagram />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn">
                <FaYoutube />
              </a>
            </div>
          </div>

          <div className="footer-nav-col">
            <h4>Sahifalar</h4>
            <ul>
              <li><a href="#showcase">Platforma Ko'rinishi</a></li>
              <li><a href="#features">Imkoniyatlar</a></li>
              <li><a href="#pricing">Narxlar</a></li>
              <li><Link to="/login">Tizimga Kirish</Link></li>
            </ul>
          </div>

          <div className="footer-contact-col">
            <h4>Bog'lanish</h4>
            <p>Telefon: <a href="tel:+998905990600">+998 (90) 599-06-00</a></p>
            <p>Telegram: <a href="https://t.me/Abdulaziz7o1" target="_blank" rel="noopener noreferrer">@Abdulaziz7o1</a></p>
            <p>Manzil: Toshkent shahri, O'zbekiston</p>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div className="landing-container footer-bottom-flex">
            <span>© {new Date().getFullYear()} VELNEX. Barcha huquqlar himoyalangan.</span>
            <span>Created by @Abdulaziz7o1</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
