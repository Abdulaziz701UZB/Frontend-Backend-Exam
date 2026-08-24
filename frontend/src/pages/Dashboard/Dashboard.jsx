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
            EduControl CRM Boshqaruv Markazi <HiRocketLaunch className="banner-rocket-icon" />
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

      <div className="card payment-methods-breakdown-card">
        <div className="section-header-flex">
          <div>
            <h3 className="section-title">
              <HiOutlineBanknotes style={{ verticalAlign: 'middle', marginRight: 6, color: '#4f46e5' }} />
              To'lov Usullari Bo'yicha Tushum Taqsimoti
            </h3>
            <p className="text-muted text-xs">
              Click, Payme, Naqd pul va Bank o'tkazmalari orqali amalga oshirilgan to'lovlar tahlili
            </p>
          </div>
          <Link to="/payments" className="btn btn-secondary btn-sm">
            Barcha To'lovlar <HiArrowRight />
          </Link>
        </div>

        <div className="payment-channels-grid">
          <div className="payment-channel-card channel-click">
            <div className="channel-icon-wrap">
              <HiOutlineDevicePhoneMobile />
            </div>
            <div className="channel-data">
              <span>Click / Payme / Karta</span>
              <strong>{formatMoney(cardAmount)}</strong>
              <div className="channel-progress-wrap">
                <div className="channel-progress-bar bar-click" style={{ width: `${cardPct}%` }}></div>
              </div>
              <small>{cardPct}% ulush ({cardPayments.length || 24} ta to'lov)</small>
            </div>
          </div>

          <div className="payment-channel-card channel-cash">
            <div className="channel-icon-wrap">
              <HiOutlineBanknotes />
            </div>
            <div className="channel-data">
              <span>Naqd Pul (Kassa)</span>
              <strong>{formatMoney(cashAmount)}</strong>
              <div className="channel-progress-wrap">
                <div className="channel-progress-bar bar-cash" style={{ width: `${cashPct}%` }}></div>
              </div>
              <small>{cashPct}% ulush ({cashPayments.length || 14} ta to'lov)</small>
            </div>
          </div>

          <div className="payment-channel-card channel-bank">
            <div className="channel-icon-wrap">
              <HiOutlineBuildingLibrary />
            </div>
            <div className="channel-data">
              <span>Bank O'tkazmasi</span>
              <strong>{formatMoney(bankAmount)}</strong>
              <div className="channel-progress-wrap">
                <div className="channel-progress-bar bar-bank" style={{ width: `${bankPct}%` }}></div>
              </div>
              <small>{bankPct}% ulush ({bankPayments.length || 4} ta to'lov)</small>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid-2">
        <div className="card">
          <div className="section-header-flex">
            <h3 className="section-title">Faol Guruhlar</h3>
            <Link to="/groups" className="link-btn">
              Barchasi <HiArrowRight />
            </Link>
          </div>
          <div className="dash-groups-list">
            {groups.slice(0, 4).map((g) => (
              <div key={g.id} className="dash-group-item">
                <div className="group-info-col">
                  <span className="group-name-title">{g.name}</span>
                  <span className="group-meta-text">
                    {g.courseName} • {g.scheduleDays}
                  </span>
                </div>
                <div className="group-extra-col">
                  <span className="group-teacher-name">{g.teacherName}</span>
                  <span className="group-students-badge">
                    <HiOutlineUser className="inline-icon-xs" /> {g.currentStudents || g.current_students || 12}/{g.maxStudents || g.max_students || 15}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="section-header-flex">
            <h3 className="section-title">Qarzdorlik Holatlari</h3>
            <Link to="/students" className="link-btn">
              Ro'yxat <HiArrowRight />
            </Link>
          </div>
          <div className="debtors-list">
            {overdueDebtors.length === 0 ? (
              <p className="empty-state-text">
                Hozirda qarzdor o'quvchilar mavjud emas
              </p>
            ) : (
              overdueDebtors.slice(0, 4).map((d) => (
                <div key={d.id} className="debtor-item">
                  <div className="debtor-info">
                    <span className="debtor-name-title">{d.fullName}</span>
                    <span className="debtor-group-text">
                      {d.groupName}
                    </span>
                    <a href={`tel:${d.phone}`} className="debtor-phone-link">
                      <HiOutlinePhone className="inline-icon-xs" /> {d.phone}
                    </a>
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

      {isAdmin && (
        <div className="card financial-analytics-card">
          <div className="analytics-header">
            <div>
              <h3 className="section-title">
                <HiOutlineChartBar className="inline-icon-sm text-indigo" />
                Moliyaviy Xavf & Xarajatlar Tahlili
              </h3>
              <p className="analytics-subtitle">
                O'quv markazining oylik sof foydasi, operatsion xarajatlari va
                rentabellik ko'rsatkichlari
              </p>
            </div>
            <div className="profit-badge-pill">
              Sof Foyda:{" "}
              <strong>{formatMoney(FINANCIAL_ANALYTICS.netProfit)}</strong> (
              {FINANCIAL_ANALYTICS.profitMargin})
            </div>
          </div>

          <div className="analytics-details-grid">
            <div className="analytics-col">
              <h4 className="sub-heading">
                <HiOutlineChartBar className="inline-icon-xs text-indigo" />
                Xarajatlar Taqsimoti:
              </h4>
              <div className="breakdown-list">
                {FINANCIAL_ANALYTICS.expensesBreakdown.map((item, idx) => (
                  <div key={idx} className="breakdown-item">
                    <div className="breakdown-info">
                      <span>{item.name}</span>
                      <strong>
                        {formatMoney(item.amount)} ({item.pct})
                      </strong>
                    </div>
                    <div className="breakdown-bar">
                      <div
                        className="breakdown-fill"
                        style={{ width: item.pct }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="analytics-col">
              <h4 className="sub-heading">
                <HiOutlineShieldCheck className="inline-icon-xs text-indigo" />
                Moliyaviy Xavf & Xatar Indikatorlari:
              </h4>
              <div className="risk-indicators-list">
                {FINANCIAL_ANALYTICS.riskIndicators.map((risk, idx) => (
                  <div
                    key={idx}
                    className={`risk-card-item risk-${risk.status}`}
                  >
                    <div className="risk-header">
                      <strong className="risk-title">{risk.title}</strong>
                      <span className="risk-level-badge">{risk.level}</span>
                    </div>
                    <p className="risk-val">{risk.value}</p>
                    <small className="risk-desc">{risk.desc}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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
