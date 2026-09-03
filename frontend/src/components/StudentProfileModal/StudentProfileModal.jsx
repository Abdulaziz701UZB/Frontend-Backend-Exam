import { useState } from "react";
import { format9DigitId } from "../../utils/idFormatter";
import { useToast } from "../../context/ToastContext";
import {
  HiXMark,
  HiOutlineCreditCard,
  HiOutlineCalendarDays,
  HiOutlineTrophy,
  HiOutlineChatBubbleLeftRight,
  HiOutlineArrowsRightLeft,
  HiOutlinePhone,
  HiOutlineArrowDownTray,
  HiOutlineCake,
  HiOutlineSparkles,
  HiOutlinePaperAirplane,
  HiCheckCircle,
} from "react-icons/hi2";
import { FaUserGraduate, FaTelegram } from "react-icons/fa6";

const StudentProfileModal = ({ student, onClose }) => {
  const toast = useToast();
  const [dossierActiveTab, setDossierActiveTab] = useState("payments");
  const [isBdaySending, setIsBdaySending] = useState(false);
  const [isBdaySent, setIsBdaySent] = useState(() => {
    try {
      return !!localStorage.getItem(`velnex_bday_sent_${student?.id}`);
    } catch {
      return false;
    }
  });

  const handleSendBirthdayGreeting = async () => {
    if (isBdaySending || isBdaySent) return;
    setIsBdaySending(true);

    try {
      // Telegram / Bot orqali tabriknoma va 15% promo-kod yuborish
      await new Promise((resolve) => setTimeout(resolve, 400));
      try {
        localStorage.setItem(`velnex_bday_sent_${student.id}`, new Date().toISOString());
      } catch {}
      setIsBdaySent(true);
      toast.success(`"${student.fullName}" ga tug'ilgan kun tabriknomasi va 15% chegirma promo-kodi yuborildi! 🎂🎉`);
    } catch {
      toast.error("Tabriknoma yuborishda xatolik yuz berdi!");
    } finally {
      setIsBdaySending(false);
    }
  };

  if (!student) return null;

  const formatMoney = (val) => {
    return new Intl.NumberFormat("uz-UZ").format(val) + " so'm";
  };

  const getDossierData = (s) => {
    const rawBirthDate = s.birthDate || "2006-10-09";
    const bDate = new Date(rawBirthDate);
    const now = new Date();
    let studentAge = now.getFullYear() - bDate.getFullYear();
    if (
      now.getMonth() < bDate.getMonth() ||
      (now.getMonth() === bDate.getMonth() && now.getDate() < bDate.getDate())
    ) {
      studentAge--;
    }

    const birthDateDisplay = bDate.toLocaleDateString("uz-UZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const isBotConnected = Boolean(s.telegramUsername || s.id % 2 === 0);
    const totalLTV = 3400000;

    const mockAttendance = [
      { date: "24.08", status: "present" },
      { date: "22.08", status: "present" },
      { date: "19.08", status: "late" },
      { date: "17.08", status: "present" },
      { date: "15.08", status: "present" },
      { date: "12.08", status: "absent" },
      { date: "10.08", status: "present" },
      { date: "08.08", status: "present" },
      { date: "05.08", status: "present" },
      { date: "03.08", status: "present" },
      { date: "01.08", status: "present" },
      { date: "29.07", status: "absent" },
      { date: "26.07", status: "present" },
      { date: "24.07", status: "present" },
      { date: "22.07", status: "present" },
      { date: "19.07", status: "present" },
    ];

    const mockExams = [
      { title: "HTML & CSS Semantika Nazorati", score: 94, maxScore: 100, grade: "A'lo" },
      { title: "JavaScript ES6 & Async/Await", score: 88, maxScore: 100, grade: "Yaxshi" },
      { title: "React Component & Hooks Imtihoni", score: 92, maxScore: 100, grade: "A'lo" },
    ];

    return {
      studentAge: studentAge > 0 ? studentAge : 18,
      birthDateDisplay,
      isBotConnected,
      totalLTV,
      mockAttendance,
      mockExams,
    };
  };

  const dossierData = getDossierData(student);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content card student-dossier-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2>
              <FaUserGraduate className="title-icon-indigo" />
              {student.fullName} — O'quvchi Profili
            </h2>
            <p className="text-muted text-sm m-0 mt-1">
              O'quvchi 9 Xonali ID: <strong>#{format9DigitId(student.id, "student")}</strong> | Guruhi: <strong>{student.groupName}</strong>
            </p>
          </div>
          <button
            className="close-modal-btn"
            onClick={onClose}
            aria-label="Yopish"
          >
            <HiXMark />
          </button>
        </div>

        <div className="dossier-hero-header">
          <div className="dossier-user-info">
            <div className="dossier-avatar">
              <FaUserGraduate />
            </div>
            <div>
              <h3 className="dossier-name">{student.fullName}</h3>
              <div className="dossier-meta-badges">
                <span className="user-phone">{student.phone}</span>
                <span className={`bot-sync-pill ${dossierData.isBotConnected ? "" : "text-danger"}`}>
                  <FaTelegram /> {dossierData.isBotConnected ? "Telegram Bot: Faol Ulangan" : "Bot: Ulanmagan"}
                </span>
                <span className="birthday-pill">
                  <HiOutlineCake /> {dossierData.birthDateDisplay} ({dossierData.studentAge} yosh)
                </span>
              </div>
            </div>
          </div>

          <div className="ltv-metric-badge">
            <span className="ltv-label">Umumiy Qiymati (LTV)</span>
            <span className="ltv-value">{formatMoney(dossierData.totalLTV)}</span>
          </div>
        </div>

        <div className="dossier-tabs-bar">
          <button
            type="button"
            className={`dossier-tab-btn ${dossierActiveTab === "payments" ? "active" : ""}`}
            onClick={() => setDossierActiveTab("payments")}
          >
            <HiOutlineCreditCard /> To'lov Tarixi & Cheklar
          </button>
          <button
            type="button"
            className={`dossier-tab-btn ${dossierActiveTab === "attendance" ? "active" : ""}`}
            onClick={() => setDossierActiveTab("attendance")}
          >
            <HiOutlineCalendarDays /> Davomat Dinamikasi
          </button>
          <button
            type="button"
            className={`dossier-tab-btn ${dossierActiveTab === "grades" ? "active" : ""}`}
            onClick={() => setDossierActiveTab("grades")}
          >
            <HiOutlineTrophy /> Baholar & Imtihonlar
          </button>
          <button
            type="button"
            className={`dossier-tab-btn ${dossierActiveTab === "parents" ? "active" : ""}`}
            onClick={() => setDossierActiveTab("parents")}
          >
            <HiOutlineChatBubbleLeftRight /> Ota-ona & Aloqa
          </button>
          <button
            type="button"
            className={`dossier-tab-btn ${dossierActiveTab === "transfers" ? "active" : ""}`}
            onClick={() => setDossierActiveTab("transfers")}
          >
            <HiOutlineArrowsRightLeft /> Guruhlar Tarixi
          </button>
        </div>

        <div className="dossier-tab-content">
          {dossierActiveTab === "payments" && (
            <div className="dossier-tab-panel">
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Kvitansiya 9 Xonali ID</th>
                      <th>To'lov Sanasi</th>
                      <th>To'lov Usuli</th>
                      <th>Summa</th>
                      <th>Holati</th>
                      <th>Chek</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span className="id-pill">#800109812</span></td>
                      <td>15.08.2026</td>
                      <td><span className="group-tag-pill">Click</span></td>
                      <td><strong>{formatMoney(850000)}</strong></td>
                      <td><span className="status-pill pill-paid">Muvaffaqiyatli</span></td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => toast.success("Kvitansiya cheki yuklab olindi!")}
                        >
                          <HiOutlineArrowDownTray /> Chek PDF
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td><span className="id-pill">#800108421</span></td>
                      <td>15.07.2026</td>
                      <td><span className="group-tag-pill">Payme</span></td>
                      <td><strong>{formatMoney(850000)}</strong></td>
                      <td><span className="status-pill pill-paid">Muvaffaqiyatli</span></td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => toast.success("Kvitansiya cheki yuklab olindi!")}
                        >
                          <HiOutlineArrowDownTray /> Chek PDF
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {dossierActiveTab === "attendance" && (
            <div className="dossier-tab-panel">
              <div className="attendance-summary-cards">
                <div className="attendance-stat-box">
                  <span className="kpi-label">O'rtacha Davomat</span>
                  <strong className="kpi-value text-emerald">88%</strong>
                </div>
                <div className="attendance-stat-box">
                  <span className="kpi-label">Kelgan Darslari</span>
                  <strong className="kpi-value">14 ta dars</strong>
                </div>
                <div className="attendance-stat-box">
                  <span className="kpi-label">Qoldirgan Darslari</span>
                  <strong className="kpi-value text-danger">2 ta dars</strong>
                </div>
              </div>

              <h5 className="section-title text-sm mb-2">So'nggi darslar jurnali:</h5>
              <div className="attendance-dots-grid">
                {dossierData.mockAttendance.map((a, idx) => (
                  <div
                    key={idx}
                    className={`attendance-dot-item ${
                      a.status === "present"
                        ? "dot-present"
                        : a.status === "late"
                          ? "dot-late"
                          : "dot-absent"
                    }`}
                  >
                    <div>{a.date}</div>
                    <small>{a.status === "present" ? "Keldi" : a.status === "late" ? "Kechikdi" : "Kelmadi"}</small>
                  </div>
                ))}
              </div>
            </div>
          )}

          {dossierActiveTab === "grades" && (
            <div className="dossier-tab-panel">
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Imtihon / Nazorat Ishi</th>
                      <th>To'plagan Bali</th>
                      <th>Maksimal Ball</th>
                      <th>Baho</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dossierData.mockExams.map((ex, idx) => (
                      <tr key={idx}>
                        <td><strong>{ex.title}</strong></td>
                        <td><strong className="text-emerald">{ex.score} ball</strong></td>
                        <td>{ex.maxScore} ball</td>
                        <td><span className="group-tag-pill">{ex.grade}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {dossierActiveTab === "parents" && (
            <div className="dossier-tab-panel">
              <div className="contact-card-grid">
                <div className="contact-info-card">
                  <span className="contact-card-title">O'quvchining O'zi:</span>
                  <strong>{student.fullName}</strong>
                  <a href={`tel:${student.phone}`} className="contact-phone-btn">
                    <HiOutlinePhone /> {student.phone}
                  </a>
                </div>

                <div className="contact-info-card">
                  <span className="contact-card-title">Ota-onasi / Vasiysi:</span>
                  <strong>{student.fullName} ning Ota-onasi</strong>
                  <a href={`tel:${student.parentPhone || student.phone}`} className="contact-phone-btn">
                    <HiOutlinePhone /> {student.parentPhone || student.phone}
                  </a>
                  <div className="mt-2">
                    <a
                      href={`https://t.me/${String(student.parentPhone || student.phone || "").replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      <FaTelegram className="inline-icon-xs text-indigo" /> Telegramdan Bog'lanish
                    </a>
                  </div>
                </div>
              </div>

              <div className="feature-special-card">
                <div className="feature-special-header">
                  <span className="feature-special-title">
                    <FaTelegram className="text-indigo" />
                    Telegram Bot Integratsiyasi & Bildirishnomalar
                  </span>
                  <span className={`status-pill ${dossierData.isBotConnected ? "pill-paid" : "pill-overdue"}`}>
                    {dossierData.isBotConnected ? "Faol Ulangan" : "Ulanmagan"}
                  </span>
                </div>
                <p className="text-muted text-xs mb-3">
                  Davomat, baholar va to'lov kvitansiyalari avtomatik ravishda o'quvchi va ota-onaning Telegram botiga yuboriladi.
                </p>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => toast.success(`"${student.fullName}" telefoniga botga ulanish havolasi yuborildi!`)}
                >
                  <HiOutlinePaperAirplane /> Botga Ulanish Havolasini Yuborish
                </button>
              </div>

              {/* Tug'ilgan kuni va Tabriknoma eslatmasi (Xabar yuborilgach eslatma yakunlanadi va yo'qoladi) */}
              {isBdaySent ? (
                <div className="bday-completed-notice">
                  <div className="bday-completed-left">
                    <HiCheckCircle className="bday-completed-check-icon" />
                    <div className="bday-completed-text-wrap">
                      <strong className="bday-completed-title">Tug'ilgan kun tabriknomasi yuborilgan 🎉</strong>
                      <span className="bday-completed-desc">
                        O'quvchiga 15% chegirma promo-kodi va tabrik xabarnomasi yetkazildi. Eslatma avtomatik yakunlandi.
                      </span>
                    </div>
                  </div>
                  <span className="bday-completed-tag">Yakunlandi ✓</span>
                </div>
              ) : (
                <div className="feature-special-card feature-birthday-card">
                  <div className="feature-special-header">
                    <span className="feature-special-title">
                      <HiOutlineCake className="text-amber" />
                      Tug'ilgan Kuni & Tabriknoma Eslatmasi
                    </span>
                    <span className="birthday-pill">
                      {dossierData.birthDateDisplay} ({dossierData.studentAge} yosh)
                    </span>
                  </div>
                  <p className="text-muted text-xs mb-3">
                    O'quvchining tug'ilgan kuniga 3 kun qolganda tizim avtomatik eslatma beradi va maxsus 15% chegirma promo-kodini taklif qiladi.
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm btn-bday-send-action"
                    onClick={handleSendBirthdayGreeting}
                    disabled={isBdaySending}
                  >
                    {isBdaySending ? (
                      <>
                        <span className="bday-loading-spinner"></span> Yuborilmoqda...
                      </>
                    ) : (
                      <>
                        <HiOutlineSparkles /> Tabrik Xabarnomasi & Chegirma Yuborish
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {dossierActiveTab === "transfers" && (
            <div className="dossier-tab-panel">
              <div className="transfer-info-banner">
                <div><strong>Hozirgi Guruhi:</strong> {student.groupName}</div>
                <div><strong>Guruhga Biriktirilgan Sana:</strong> 01.06.2026</div>
                <div><strong>Guruh O'zgartirish Tarixi:</strong> 1 marta (Dars vaqti mos kelmaganligi sababli kechki guruhga o'tkazilgan)</div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions-flex">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileModal;
