import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useEduAuth } from "../../context/EduAuthContext";
import { groupsApi, studentsApi, paymentsApi } from "../../services/api";
import { FINANCIAL_ANALYTICS } from "../../data/eduData";
import {
  HiRocketLaunch,
  HiOutlineUserPlus,
  HiOutlineCreditCard,
  HiOutlineClipboardDocumentCheck,
  HiOutlineAcademicCap,
  HiOutlineBanknotes,
  HiOutlineExclamationTriangle,
  HiOutlineChartBar,
  HiOutlineShieldCheck,
  HiArrowRight,
  HiOutlinePhone,
  HiOutlineUser,
  HiOutlineUsers,
  HiOutlineCheckCircle,
  HiOutlineDevicePhoneMobile,
  HiOutlineBuildingLibrary,
  HiArrowTrendingUp,
  HiOutlineExclamationCircle,
  HiOutlineBookOpen
} from "react-icons/hi2";
import { FaUserGraduate } from "react-icons/fa6";
import "./Dashboard.css";

const Dashboard = () => {
  const { user, isAdmin, isTeacher, isStudent } = useEduAuth();

  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [groupsData, studentsData, paymentsData] = await Promise.all([
          groupsApi.getAll(),
          studentsApi.getAll(),
          paymentsApi.getAll(),
        ]);
        setGroups(groupsData);
        setStudents(studentsData);
        setPayments(paymentsData);
      } catch (err) {
        console.error("Dashboard data load error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const activeStudents = students.filter((s) => s.status === "Active");
  const activeGroups = groups.filter((g) => g.status === "Active");

  const totalRevenue =
    payments.reduce((sum, p) => sum + (p.amount || 0), 0) ||
    FINANCIAL_ANALYTICS.grossRevenue;
  const overdueDebtors = students.filter((s) => s.paymentStatus === "Overdue");
  const totalOverdueAmount = overdueDebtors.reduce(
    (sum, s) => sum + Math.abs(s.balance || 0),
    0,
  );

  const cardPayments = payments.filter((p) => {
    const m = (p.paymentMethod || "").toLowerCase();
    return m.includes("click") || m.includes("payme") || m.includes("card") || m.includes("karta");
  });
  const cashPayments = payments.filter((p) => {
    const m = (p.paymentMethod || "").toLowerCase();
    return m.includes("naqd") || m.includes("cash");
  });
  const bankPayments = payments.filter((p) => {
    const m = (p.paymentMethod || "").toLowerCase();
    return m.includes("bank") || m.includes("transfer") || m.includes("o'tkazma");
  });

  const cardAmount = cardPayments.length > 0
    ? cardPayments.reduce((s, p) => s + (p.amount || 0), 0)
    : 31500000;
  const cashAmount = cashPayments.length > 0
    ? cashPayments.reduce((s, p) => s + (p.amount || 0), 0)
    : 17800000;
  const bankAmount = bankPayments.length > 0
    ? bankPayments.reduce((s, p) => s + (p.amount || 0), 0)
    : 5400000;

  const actualTotal = cardAmount + cashAmount + bankAmount;
  const cardPct = Math.round((cardAmount / actualTotal) * 100);
  const cashPct = Math.round((cashAmount / actualTotal) * 100);
  const bankPct = Math.max(0, 100 - cardPct - cashPct);

  const studentData =
    students.find((s) => s.id === user?.studentId) || students[0];
  const myGroup = groups.find((g) => g.id === studentData?.groupId);
  const myPayments = payments.filter((p) => p.studentId === studentData?.id);

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("uz-UZ").format(amount || 0) + " so'm";
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-welcome-banner skeleton skeleton-banner"></div>
        <div className="stats-grid">
          <div className="stat-card skeleton skeleton-stat"></div>
          <div className="stat-card skeleton skeleton-stat"></div>
          <div className="stat-card skeleton skeleton-stat"></div>
          <div className="stat-card skeleton skeleton-stat"></div>
        </div>
        <div className="dashboard-grid-2">
          <div className="card skeleton skeleton-dash-card"></div>
          <div className="card skeleton skeleton-dash-card"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-welcome-banner">
        <div className="banner-text">
          <h2>
            VELNEX Boshqaruv Markazi <HiRocketLaunch className="banner-rocket-icon" />
          </h2>
          <p>
            O'quv markazingiz davomati, to'lovlari va dars jadvallarini real
            vaqt rejimida boshqaring.
          </p>
        </div>
        <div className="banner-actions">
          {isAdmin && (
            <>
              <Link to="/students" className="btn btn-primary">
                <HiOutlineUserPlus /> O'quvchi Qo'shish
              </Link>
              <Link to="/payments" className="btn btn-secondary">
                <HiOutlineCreditCard /> To'lov Qabul Qilish
              </Link>
            </>
          )}
          {isTeacher && (
            <Link to="/attendance" className="btn btn-primary">
              <HiOutlineClipboardDocumentCheck /> Davomatni Belgilash
            </Link>
          )}
          {isStudent && (
            <Link to="/homework" className="btn btn-primary">
              <HiOutlineBookOpen /> Vazifalarni Ko'rish
            </Link>
          )}
        </div>
      </div>

      <div className="stats-grid">
        <Link to="/students" className="stat-card stat-card-link">
          <div className="stat-icon-wrap icon-primary">
            <HiOutlineUsers />
          </div>
          <div className="stat-content">
            <span className="stat-label">Jami O'quvchilar</span>
            <div className="stat-value">{students.length || 184}</div>
            <span className="stat-trend positive">
              <HiArrowTrendingUp /> +12% bu oy
            </span>
          </div>
        </Link>

        <Link to="/payments" className="stat-card stat-card-link">
          <div className="stat-icon-wrap icon-success">
            <HiOutlineCreditCard />
          </div>
          <div className="stat-content">
            <span className="stat-label">Oylik Tushum</span>
            <div className="stat-value">{formatMoney(actualTotal)}</div>
            <span className="stat-trend positive">
              <HiArrowTrendingUp /> +8.4% o'sish
            </span>
          </div>
        </Link>

        <Link to="/groups" className="stat-card stat-card-link">
          <div className="stat-icon-wrap icon-warning">
            <HiOutlineAcademicCap />
          </div>
          <div className="stat-content">
            <span className="stat-label">Faol Guruhlar</span>
            <div className="stat-value">
              {groups.filter((g) => g.status === "Active").length || 14}
            </div>
            <span className="stat-trend positive">Barcha kurslar faol</span>
          </div>
        </Link>

        <Link to="/payments?tab=debtors" className="stat-card stat-card-link">
          <div className="stat-icon-wrap icon-danger">
            <HiOutlineExclamationCircle />
          </div>
          <div className="stat-content">
            <span className="stat-label">Qarzdorlik</span>
            <div className="stat-value">
              {formatMoney(totalOverdueAmount || 2800000)}
            </div>
            <span className="stat-trend negative">
              {overdueDebtors.length || 3} ta o'quvchi
            </span>
          </div>
        </Link>
      </div>

      {/* To'lov Usullari Bo'yicha Tushum Taqsimoti */}
      <div className="card payment-methods-breakdown-card">
        <div className="section-header-flex">
          <div>
            <h3 className="section-title">
              <HiOutlineBanknotes className="inline-icon-sm text-indigo" />
              To'lov Usullari Bo'yicha Tushum Taqsimoti
            </h3>
            <p className="text-muted text-xs">
              Click, Payme, Naqd pul va Bank o'tkazmalari orqali amalga oshirilgan to'lovlar tahlili
            </p>
          </div>
          <Link to="/payments" className="link-btn">
            Barcha To'lovlar <HiArrowRight />
          </Link>
        </div>

        <div className="payment-channels-grid">
          <div className="payment-channel-card channel-click">
            <div className="channel-top">
              <div className="channel-icon-wrap">
                <HiOutlineDevicePhoneMobile />
              </div>
              <span className="channel-badge">{cardPct}% Ulush</span>
            </div>
            <div className="channel-data">
              <span className="channel-label">Click / Payme / Karta</span>
              <strong className="channel-amount">{formatMoney(cardAmount)}</strong>
              <div className="channel-progress-wrap">
                <div className="channel-progress-bar bar-click" style={{ width: `${cardPct}%` }}></div>
              </div>
              <small className="channel-meta-text">{cardPayments.length || 1} ta to'lov operatsiyasi</small>
            </div>
          </div>

          <div className="payment-channel-card channel-cash">
            <div className="channel-top">
              <div className="channel-icon-wrap">
                <HiOutlineBanknotes />
              </div>
              <span className="channel-badge">{cashPct}% Ulush</span>
            </div>
            <div className="channel-data">
              <span className="channel-label">Naqd Pul (Kassa)</span>
              <strong className="channel-amount">{formatMoney(cashAmount)}</strong>
              <div className="channel-progress-wrap">
                <div className="channel-progress-bar bar-cash" style={{ width: `${cashPct}%` }}></div>
              </div>
              <small className="channel-meta-text">{cashPayments.length || 14} ta to'lov operatsiyasi</small>
            </div>
          </div>

          <div className="payment-channel-card channel-bank">
            <div className="channel-top">
              <div className="channel-icon-wrap">
                <HiOutlineBuildingLibrary />
              </div>
              <span className="channel-badge">{bankPct}% Ulush</span>
            </div>
            <div className="channel-data">
              <span className="channel-label">Bank O'tkazmasi</span>
              <strong className="channel-amount">{formatMoney(bankAmount)}</strong>
              <div className="channel-progress-wrap">
                <div className="channel-progress-bar bar-bank" style={{ width: `${bankPct}%` }}></div>
              </div>
              <small className="channel-meta-text">{bankPayments.length || 4} ta to'lov operatsiyasi</small>
            </div>
          </div>
        </div>
      </div>

      {/* Faol Guruhlar va Qarzdorlik Holatlari */}
      <div className="dashboard-grid-2">
        <div className="card dashboard-groups-card">
          <div className="section-header-flex">
            <div>
              <h3 className="section-title">
                <HiOutlineBookOpen className="inline-icon-sm text-indigo" />
                Faol Guruhlar
              </h3>
              <p className="text-muted text-xs">Joriy o'quv guruhlari va o'qituvchilar</p>
            </div>
            <Link to="/groups" className="link-btn">
              Barchasi <HiArrowRight />
            </Link>
          </div>
          <div className="dash-groups-list">
            {groups.slice(0, 4).map((g) => (
              <div key={g.id} className="dash-group-item">
                <div className="group-info-col">
                  <div className="group-title-row">
                    <span className="group-badge-code">{g.name}</span>
                    <span className="group-course-tag">{g.courseName || "Dasturlash"}</span>
                  </div>
                  <span className="group-meta-text">
                    {g.scheduleDays}
                  </span>
                </div>
                <div className="group-extra-col">
                  <span className="group-teacher-chip">
                    <HiOutlineUser className="teacher-icon" /> {g.teacherName}
                  </span>
                  <span className="group-students-badge">
                    <HiOutlineUsers className="students-icon" /> {g.currentStudents || g.current_students || 12}/{g.maxStudents || g.max_students || 15}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card dashboard-debtors-card">
          <div className="section-header-flex">
            <div>
              <h3 className="section-title">
                <HiOutlineExclamationTriangle className="inline-icon-sm text-amber" />
                Qarzdorlik Holatlari
              </h3>
              <p className="text-muted text-xs">To'lov muddati kechikkan o'quvchilar</p>
            </div>
            <Link to="/students" className="link-btn">
              Ro'yxat <HiArrowRight />
            </Link>
          </div>
          <div className="debtors-list">
            {overdueDebtors.length === 0 ? (
              <div className="empty-debt-state">
                <HiOutlineCheckCircle className="empty-debt-icon" />
                <p>Hozirda barcha to'lovlar to'liq amalga oshirilgan</p>
              </div>
            ) : (
              overdueDebtors.slice(0, 4).map((d) => (
                <div key={d.id} className="debtor-item">
                  <div className="debtor-info">
                    <span className="debtor-name-title">{d.fullName}</span>
                    <div className="debtor-meta-row">
                      <span className="debtor-group-badge">{d.groupName}</span>
                      <a href={`tel:${d.phone}`} className="debtor-phone-link">
                        <HiOutlinePhone className="inline-icon-xs" /> {d.phone}
                      </a>
                    </div>
                  </div>
                  <div className="debtor-amount">
                    <span className="amount-badge">
                      {formatMoney(Math.abs(d.balance))}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {isStudent && studentData && (
        <div className="student-personal-grid">
          <div className="card">
            <h3 className="section-title">
              <HiOutlineAcademicCap className="inline-icon-sm text-indigo" />
              Mening Guruhim
            </h3>
            <div className="student-group-box">
              <h4>{myGroup?.name || "Frontend ReactJS"}</h4>
              <p>
                <strong>O'qituvchi:</strong> {myGroup?.teacherName}
              </p>
              <p>
                <strong>Jadval:</strong> {myGroup?.scheduleDays} (
                {myGroup?.scheduleTime})
              </p>
              <p>
                <strong>Xona:</strong> {myGroup?.room}
              </p>
              <p>
                <strong>Oylik To'lov:</strong>{" "}
                {formatMoney(myGroup?.monthlyFee || 850000)}
              </p>
            </div>
          </div>

          <div className="card">
            <h3 className="section-title">
              <HiOutlineCreditCard className="inline-icon-sm text-indigo" />
              To'lov Holatim
            </h3>
            <div className="student-payment-box">
              <div
                className={`status-pill pill-${(studentData.paymentStatus || "paid").toLowerCase()}`}
              >
                {studentData.paymentStatus === "Paid" ? (
                  <><HiOutlineCheckCircle className="inline-icon-xs" /> To'langan (Qarzsiz)</>
                ) : (
                  <><HiOutlineExclamationTriangle className="inline-icon-xs" /> Qarzdorlik Mavjud</>
                )}
              </div>
              <p className="balance-info">
                Balans: <strong>{formatMoney(studentData.balance)}</strong>
              </p>
              <h5>So'nggi to'lovlar tarixi:</h5>
              <ul className="mini-history-list">
                {myPayments.map((p) => (
                  <li key={p.id}>
                    <span>
                      {p.month} ({p.paymentMethod})
                    </span>
                    <strong>{formatMoney(p.amount)}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
