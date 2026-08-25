import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HiOutlinePhone,
  HiOutlineArrowRight,
  HiOutlineChatBubbleLeftRight,
  HiOutlineCheckCircle,
  HiOutlineAcademicCap,
  HiOutlineCreditCard,
  HiOutlineUserGroup,
  HiOutlineDevicePhoneMobile,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineChartBar,
  HiOutlineBellAlert,
  HiOutlineQrCode
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
  const [activeTab, setActiveTab] = useState("admin");

  return (
    <div className="velnex-landing-page">
      <div className="landing-topbar">
        <div className="landing-container topbar-flex">
          <div className="topbar-left">
            <span className="topbar-badge">Yangi</span>
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

      <header className="landing-navbar-wrap">
        <div className="landing-container navbar-flex">
          <Link to="/" className="landing-brand-logo">
            <img src="/velnex-logo.png" alt="VELNEX" className="brand-logo-img" />
            <span className="brand-logo-text">VELNEX</span>
          </Link>

          <nav className="landing-nav-menu">
            <a href="#features" className="nav-item">Imkoniyatlar</a>
            <a href="#student-app" className="nav-item">Student App</a>
            <a href="#parent-app" className="nav-item">Ota-ona Ilovasi</a>
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

            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="btn-landing-login"
              >
                <span>Boshqaruv Markazi</span>
                <HiOutlineArrowRight className="btn-arrow" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="btn-landing-login"
              >
                <span>Tizimga kirish</span>
                <HiOutlineArrowRight className="btn-arrow" />
              </button>
            )}
          </div>
        </div>
      </header>

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

              <a
                href="https://t.me/Abdulaziz7o1"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-hero-secondary"
              >
                <FaTelegram className="btn-tg-icon" />
                <span>Demo so'rash</span>
              </a>
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
            <div className="hero-3d-mockup-wrapper">
              <div className="mockup-desktop-card">
                <div className="desktop-top-bar">
                  <div className="window-dots">
                    <span className="dot red"></span>
                    <span className="dot yellow"></span>
                    <span className="dot green"></span>
                  </div>
                  <span className="window-url">app.velnex.uz/dashboard</span>
                </div>
                <div className="desktop-screen-content">
                  <div className="mock-dash-header">
                    <div className="mock-dash-title">VELNEX Boshqaruv Markazi 🚀</div>
                    <div className="mock-dash-kpi">
                      <span className="kpi-tag active">24 Guruh Faol</span>
                    </div>
                  </div>
                  <div className="mock-stats-mini-grid">
                    <div className="mock-stat-box">
                      <span className="mock-stat-num">312</span>
                      <span className="mock-stat-lbl">Jami O'quvchilar</span>
                    </div>
                    <div className="mock-stat-box">
                      <span className="mock-stat-num">24,050,000</span>
                      <span className="mock-stat-lbl">Oylik Tushum (so'm)</span>
                    </div>
                    <div className="mock-stat-box">
                      <span className="mock-stat-num">99.2%</span>
                      <span className="mock-stat-lbl">Davomat Sifat</span>
                    </div>
                  </div>
                  <div className="mock-bars-row">
                    <div className="mock-bar-line bar-1"></div>
                    <div className="mock-bar-line bar-2"></div>
                    <div className="mock-bar-line bar-3"></div>
                  </div>
                </div>
              </div>

              <div className="mockup-mobile-phone">
                <div className="phone-notch"></div>
                <div className="phone-screen-header">
                  <div className="phone-user-avatar">
                    <FaGraduationCap />
                  </div>
                  <div className="phone-user-meta">
                    <strong>Azizbek Murodov</strong>
                    <span>Frontend ReactJS</span>
                  </div>
                </div>
                <div className="phone-app-menu-grid">
                  <div className="phone-menu-btn btn-blue">
                    <HiOutlineAcademicCap className="m-icon" />
                    <span>Davomat</span>
                  </div>
                  <div className="phone-menu-btn btn-amber">
                    <HiOutlineSparkles className="m-icon" />
                    <span>Baholar</span>
                  </div>
                  <div className="phone-menu-btn btn-emerald">
                    <HiOutlineCreditCard className="m-icon" />
                    <span>To'lovlar</span>
                  </div>
                  <div className="phone-menu-btn btn-indigo">
                    <HiOutlineQrCode className="m-icon" />
                    <span>ID Pass</span>
                  </div>
                </div>
                <div className="phone-quick-status">
                  <span>Balans: <strong>0 so'm (To'langan)</strong></span>
                </div>
              </div>

              <div className="floating-badge-card badge-top-right">
                <HiOutlineChartBar className="f-icon green" />
                <div>
                  <strong>+18.4%</strong>
                  <span>Tushum o'sishi</span>
                </div>
              </div>

              <div className="floating-badge-card badge-bottom-left">
                <HiOutlineBellAlert className="f-icon purple" />
                <div>
                  <strong>SMS & Bot</strong>
                  <span>Avto-ogohlantirish</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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

      <section id="student-app" className="landing-app-showcase-section">
        <div className="landing-container">
          <div className="app-showcase-card">
            <div className="app-showcase-text">
              <span className="app-badge-tag">MOBIL QULAYLIK</span>
              <h2 className="app-showcase-title">
                O'quvchilar va Ota-onalar uchun qulay shaxsiy kabinet
              </h2>
              <p className="app-showcase-desc">
                Ota-onalar farzandining darsga kelgan-kelmaganligini, olgan baholari va to'lov holatini uydan turib istalgan paytda nazorat qila oladi.
              </p>

              <div className="app-feature-bullets">
                <div className="bullet-row">
                  <div className="bullet-icon"><FaCheck /></div>
                  <span>Real vaqt rejimida SMS va Telegram xabarlari</span>
                </div>
                <div className="bullet-row">
                  <div className="bullet-icon"><FaCheck /></div>
                  <span>Elektron jurnal, uyga vazifalar va test natijalari</span>
                </div>
                <div className="bullet-row">
                  <div className="bullet-icon"><FaCheck /></div>
                  <span>Onlayn to'lov cheklari va to'lovlar tarixi</span>
                </div>
              </div>

              <div className="app-cta-row">
                <button
                  type="button"
                  onClick={() => navigate(isAuthenticated ? "/dashboard" : "/login")}
                  className="btn-hero-primary"
                >
                  <span>Hoziroq sinab ko'ring</span>
                  <FaArrowRight className="btn-icon-right" />
                </button>
              </div>
            </div>

            <div className="app-showcase-preview">
              <div className="app-interactive-screen">
                <div className="app-screen-header">
                  <div className="app-tab-switcher">
                    <button
                      type="button"
                      className={`tab-btn ${activeTab === "admin" ? "active" : ""}`}
                      onClick={() => setActiveTab("admin")}
                    >
                      <FaChalkboardUser /> Ustoz Paneli
                    </button>
                    <button
                      type="button"
                      className={`tab-btn ${activeTab === "student" ? "active" : ""}`}
                      onClick={() => setActiveTab("student")}
                    >
                      <FaGraduationCap /> O'quvchi
                    </button>
                  </div>
                </div>

                <div className="app-screen-body">
                  {activeTab === "admin" ? (
                    <div className="mock-panel-content">
                      <div className="mock-group-header">
                        <strong>F-12 Guruh (Frontend ReactJS)</strong>
                        <span className="mock-badge">12/15 O'quvchi</span>
                      </div>
                      <div className="mock-attendance-list">
                        <div className="att-item">
                          <span>Abdulaziz Abdulhayev</span>
                          <span className="status-dot present">Kelgan</span>
                        </div>
                        <div className="att-item">
                          <span>Azizbek Murodov</span>
                          <span className="status-dot present">Kelgan</span>
                        </div>
                        <div className="att-item">
                          <span>Jasurbek Rustamov</span>
                          <span className="status-dot present">Kelgan</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mock-panel-content">
                      <div className="mock-student-profile">
                        <div className="mock-avatar">🎓</div>
                        <div className="mock-details">
                          <strong>Abdulaziz Abdulhayev</strong>
                          <span>ID: #100000002</span>
                        </div>
                      </div>
                      <div className="mock-scores-row">
                        <div className="score-box">
                          <strong>100%</strong>
                          <span>Davomat</span>
                        </div>
                        <div className="score-box">
                          <strong>95 ball</strong>
                          <span>Uy vazifasi</span>
                        </div>
                        <div className="score-box">
                          <strong>To'langan</strong>
                          <span>Balans</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
              <li><a href="#features">Imkoniyatlar</a></li>
              <li><a href="#student-app">Student App</a></li>
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
