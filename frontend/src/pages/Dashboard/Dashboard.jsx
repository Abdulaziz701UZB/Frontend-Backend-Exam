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
  HiOutlineCheckCircle
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

  const studentData =
    students.find((s) => s.id === user?.studentId) || students[0];
  const myGroup = groups.find((g) => g.id === studentData?.groupId);
  const myPayments = payments.filter((p) => p.studentId === studentData?.id);

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("uz-UZ").format(amount || 0) + " so'm";
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-welcome-banner">
        <div className="banner-text">
          <h2>
            EduControl CRM Boshqaruv Markazi <HiRocketLaunch style={{ verticalAlign: 'middle', color: '#6366f1' }} />
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
              <HiOutlineClipboardDocumentCheck /> Davomat Belgilash
            </Link>
          )}
        </div>
      </div>

      {!isStudent && (
        <div className="stats-grid">
          <div className="stat-card stat-indigo">
            <div className="stat-icon-wrap">
              <span className="stat-icon"><FaUserGraduate /></span>
            </div>
            <div className="stat-details">
              <span className="stat-label">Faol O'quvchilar</span>
              <h3 className="stat-value">{activeStudents.length} ta</h3>
              <span className="stat-subtext text-success">↑ 100% qamrov</span>
            </div>
          </div>

          <div className="stat-card stat-emerald">
            <div className="stat-icon-wrap">
              <span className="stat-icon"><HiOutlineAcademicCap /></span>
            </div>
            <div className="stat-details">
              <span className="stat-label">Faol Guruhlar</span>
              <h3 className="stat-value">{activeGroups.length} ta</h3>
              <span className="stat-subtext">Xonalar bandligi 88%</span>
            </div>
          </div>

          <div className="stat-card stat-blue">
            <div className="stat-icon-wrap">
              <span className="stat-icon"><HiOutlineBanknotes /></span>
            </div>
            <div className="stat-details">
              <span className="stat-label">Jami Oylik Tushum</span>
              <h3 className="stat-value">{formatMoney(totalRevenue)}</h3>
              <span className="stat-subtext text-success">
                Muvaffaqiyatli to'lovlar
              </span>
            </div>
          </div>

          <div className="stat-card stat-amber">
            <div className="stat-icon-wrap">
              <span className="stat-icon"><HiOutlineExclamationTriangle /></span>
            </div>
            <div className="stat-details">
              <span className="stat-label">Qarzdorlik Balansi</span>
              <h3 className="stat-value text-danger">
                {formatMoney(totalOverdueAmount)}
              </h3>
              <span className="stat-subtext text-danger">
                {overdueDebtors.length} ta qarzdor o'quvchi
              </span>
            </div>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="card risk-profit-card mb-6">
          <div className="card-header-flex mb-4">
            <div>
              <h3 className="section-title mb-0">
                <HiOutlineChartBar style={{ verticalAlign: 'middle', marginRight: 6 }} />
                Financial Profit & Risk Analytics (Foyda, Zarar & Xavf Tahlili)
              </h3>
              <p className="text-muted text-sm">
                O'quv markazining operatsion xarajatlari, sof foyda marjasi va
                moliyaviy xavflar radari
              </p>
            </div>
            <span className="profit-badge-pill">
              Rentabellik: <strong>40.5%</strong>
            </span>
          </div>

          <div className="profit-metrics-row">
            <div className="metric-box gross">
              <span className="metric-label">Jami Tushum (Gross Revenue)</span>
              <h4 className="metric-val">
                {formatMoney(FINANCIAL_ANALYTICS.grossRevenue)}
              </h4>
            </div>

            <div className="metric-box expenses">
              <span className="metric-label">
                Xarajatlar (Maoshlar & Ijara)
              </span>
              <h4 className="metric-val text-danger">
                -{formatMoney(FINANCIAL_ANALYTICS.totalExpenses)}
              </h4>
            </div>

            <div className="metric-box net">
              <span className="metric-label">Sof Foyda (Net Profit)</span>
              <h4 className="metric-val text-emerald">
                +{formatMoney(FINANCIAL_ANALYTICS.netProfit)}
              </h4>
            </div>
          </div>

          <div className="analytics-details-grid">
            <div className="analytics-col">
              <h4 className="sub-heading">
                <HiOutlineChartBar style={{ verticalAlign: 'middle', marginRight: 4 }} />
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
                <HiOutlineShieldCheck style={{ verticalAlign: 'middle', marginRight: 4 }} />
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
              <HiOutlineAcademicCap style={{ verticalAlign: 'middle', marginRight: 6 }} />
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
              <HiOutlineCreditCard style={{ verticalAlign: 'middle', marginRight: 6 }} />
              To'lov Holatim
            </h3>
            <div className="student-payment-box">
              <div
                className={`status-pill pill-${(studentData.paymentStatus || "paid").toLowerCase()}`}
              >
                {studentData.paymentStatus === "Paid" ? (
                  <><HiOutlineCheckCircle style={{ verticalAlign: 'middle', marginRight: 4 }} /> To'langan (Qarzsiz)</>
                ) : (
                  <><HiOutlineExclamationTriangle style={{ verticalAlign: 'middle', marginRight: 4 }} /> Qarzdorlik Mavjud</>
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
                      {p.date} - {p.month}
                    </span>
                    <strong>{formatMoney(p.amount)}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {!isStudent && (
        <div className="dashboard-content-grid">
          <div className="card">
            <div className="card-header-flex">
              <h3 className="section-title">
                <HiOutlineAcademicCap style={{ verticalAlign: 'middle', marginRight: 6 }} />
                Guruhlar va Dars Jadvallari
              </h3>
              <Link to="/groups" className="link-action">
                Barchasini ko'rish <HiArrowRight style={{ verticalAlign: 'middle' }} />
              </Link>
            </div>

            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Guruh Nomi</th>
                    <th>Kurs</th>
                    <th>O'qituvchi</th>
                    <th>Jadval</th>
                    <th>Xona</th>
                    <th>Holati</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((g) => (
                    <tr key={g.id}>
                      <td className="font-bold">{g.name}</td>
                      <td>{g.courseName}</td>
                      <td>{g.teacherName}</td>
                      <td className="text-muted">
                        {g.scheduleDays} <br />
                        <small>{g.scheduleTime}</small>
                      </td>
                      <td>{g.room}</td>
                      <td>
                        <span
                          className={`status-badge badge-${(g.status || 'active').toLowerCase()}`}
                        >
                          {g.status === "Active" ? "Faol" : "Yakunlangan"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-header-flex">
              <h3 className="section-title">
                <HiOutlineExclamationTriangle style={{ verticalAlign: 'middle', marginRight: 6, color: '#ef4444' }} />
                Qarzdor O'quvchilar
              </h3>
              <Link to="/payments" className="link-action">
                Moliya bo'limi <HiArrowRight style={{ verticalAlign: 'middle' }} />
              </Link>
            </div>

            {overdueDebtors.length === 0 ? (
              <p className="text-muted text-center py-4">
                Barcha o'quvchilar to'lovni o'z vaqtida amalga oshirgan!
              </p>
            ) : (
              <div className="debtors-list">
                {overdueDebtors.map((s) => (
                  <div key={s.id} className="debtor-item">
                    <div className="debtor-info">
                      <span className="debtor-avatar"><HiOutlineUser /></span>
                      <div>
                        <h4 className="debtor-name">{s.fullName}</h4>
                        <p className="debtor-group">{s.groupName}</p>
                        <p className="debtor-phone">
                          <HiOutlinePhone style={{ verticalAlign: 'middle', marginRight: 2 }} /> {s.phone}
                        </p>
                      </div>
                    </div>
                    <div className="debtor-amount">
                      <span className="debt-badge">
                        {formatMoney(Math.abs(s.balance))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
