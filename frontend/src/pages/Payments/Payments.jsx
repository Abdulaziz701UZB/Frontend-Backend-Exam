import { useState, useEffect } from "react";
import { useEduAuth } from "../../context/EduAuthContext";
import { paymentsApi, studentsApi, groupsApi } from "../../services/api";
import {
  HiOutlineCreditCard,
  HiOutlinePlus,
  HiOutlineBanknotes,
  HiOutlineExclamationTriangle,
  HiOutlineDocumentText,
  HiMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiXMark,
  HiOutlinePhone,
  HiOutlineUser,
  HiOutlineChatBubbleLeftRight
} from "react-icons/hi2";
import { FaMoneyBillWave } from "react-icons/fa6";
import "./Payments.css";

const Payments = () => {
  const { canManagePayments, isStudent, user } = useEduAuth();

  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("history");
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  const [formData, setFormData] = useState({
    studentId: 1,
    amount: 850000,
    month: "Avgust 2026",
    paymentMethod: "Card (Click)",
    date: new Date().toISOString().split("T")[0],
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [pData, sData, gData] = await Promise.all([
        paymentsApi.getAll(),
        studentsApi.getAll(),
        groupsApi.getAll(),
      ]);
      setPayments(pData);
      setStudents(sData);
      setGroups(gData);
    } catch (err) {
      console.error("Payments load error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingPayment(null);
    const firstStudent = students[0];
    const firstGroup = groups.find((g) => g.id === firstStudent?.groupId);

    setFormData({
      studentId: firstStudent?.id || 1,
      amount: firstGroup?.monthlyFee || 850000,
      month: "Avgust 2026",
      paymentMethod: "Card (Click)",
      date: new Date().toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (payment) => {
    setEditingPayment(payment);
    setFormData({
      studentId: payment.studentId,
      amount: payment.amount,
      month: payment.month,
      paymentMethod: payment.paymentMethod,
      date: payment.date,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const studentObj =
      students.find((s) => s.id === parseInt(formData.studentId)) ||
      students[0];
    const amountVal = parseFloat(formData.amount);

    const payload = {
      student_id: studentObj?.id,
      student_name: studentObj?.fullName || "",
      group_name: studentObj?.groupName || "",
      amount: amountVal,
      month: formData.month,
      payment_method: formData.paymentMethod,
      date: formData.date,
      recorded_by: user.name,
    };

    try {
      if (editingPayment) {
        await paymentsApi.update(editingPayment.id, payload);
      } else {
        await paymentsApi.create({
          id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
          ...payload,
        });

        if (studentObj) {
          const newBal = (studentObj.balance || 0) + amountVal;
          await studentsApi.update(studentObj.id, {
            balance: newBal >= 0 ? 0 : newBal,
            payment_status: newBal >= 0 ? "Paid" : "Overdue",
          });
        }
      }
      await loadData();
      setIsModalOpen(false);
    } catch (err) {
      alert("Xatolik yuz berdi: " + (err.response?.data?.error || err.message));
    }
  };

  const displayPayments = isStudent
    ? payments.filter((p) => p.studentId === user.studentId)
    : payments.filter((p) => {
        if (searchTerm) {
          const s = searchTerm.toLowerCase();
          return (
            (p.studentName || "").toLowerCase().includes(s) ||
            (p.id || "").toLowerCase().includes(s) ||
            (p.paymentMethod || "").toLowerCase().includes(s)
          );
        }
        return true;
      });

  const debtorsList = students.filter((s) => s.paymentStatus === "Overdue");
  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalDebts = debtorsList.reduce(
    (sum, s) => sum + Math.abs(s.balance || 0),
    0,
  );

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("uz-UZ").format(amount || 0) + " so'm";
  };

  return (
    <div className="payments-page">
      <div className="page-header-flex">
        <div>
          <h1 className="page-title">
            <HiOutlineCreditCard style={{ verticalAlign: 'middle', marginRight: 6 }} />
            To'lovlar va Moliya Boshqaruvi
          </h1>
          <p className="page-subtitle">
            O'quv markazining oylik to'lovlari, qarzdorliklar va tushum hisoboti
          </p>
        </div>
        {canManagePayments && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            <HiOutlinePlus /> To'lov Qabul Qilish
          </button>
        )}
      </div>

      {canManagePayments && (
        <div className="stats-grid mb-6">
          <div className="stat-card stat-emerald">
            <div className="stat-icon-wrap">
              <span className="stat-icon"><HiOutlineBanknotes /></span>
            </div>
            <div className="stat-details">
              <span className="stat-label">Jami Qabul Qilingan Tushum</span>
              <h3 className="stat-value">{formatMoney(totalRevenue)}</h3>
              <span className="stat-subtext text-success">
                {payments.length} ta kvitansiya
              </span>
            </div>
          </div>

          <div className="stat-card stat-amber">
            <div className="stat-icon-wrap">
              <span className="stat-icon"><HiOutlineExclamationTriangle /></span>
            </div>
            <div className="stat-details">
              <span className="stat-label">Qarzdorliklar Jami</span>
              <h3 className="stat-value text-danger">
                {formatMoney(totalDebts)}
              </h3>
              <span className="stat-subtext text-danger">
                {debtorsList.length} ta qarzdor talaba
              </span>
            </div>
          </div>
        </div>
      )}

      {!isStudent && (
        <div className="card filter-card mb-6">
          <div className="filter-row">
            <div className="filter-pills">
              <button
                className={`pill-btn ${activeTab === "history" ? "active" : ""}`}
                onClick={() => setActiveTab("history")}
              >
                <HiOutlineDocumentText style={{ verticalAlign: 'middle', marginRight: 4 }} />
                To'lovlar Tarixi ({payments.length})
              </button>
              <button
                className={`pill-btn ${activeTab === "debtors" ? "active" : ""}`}
                onClick={() => setActiveTab("debtors")}
              >
                <HiOutlineExclamationTriangle style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Qarzdorlar Ro'yxati ({debtorsList.length})
              </button>
            </div>

            {activeTab === "history" && (
              <div className="search-input-wrap">
                <span className="search-icon"><HiMagnifyingGlass /></span>
                <input
                  type="text"
                  className="form-input search-field"
                  placeholder="O'quvchi ismi yoki kvitansiya kodi bo'yicha..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="card table-card">
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Kvitansiya №</th>
                  <th>O'quvchi F.I.SH</th>
                  <th>Guruh</th>
                  <th>Oylik Qaysi Oy</th>
                  <th>To'lov Usuli</th>
                  <th>Sana</th>
                  <th>Summa</th>
                  <th>Qabul Qildi</th>
                  {canManagePayments && (
                    <th className="text-center">HARAKATLAR</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {displayPayments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={canManagePayments ? "9" : "8"}
                      className="text-center py-6 text-muted"
                    >
                      To'lovlar tarixi topilmadi
                    </td>
                  </tr>
                ) : (
                  displayPayments.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <span className="id-pill">{p.id}</span>
                      </td>
                      <td>
                        <strong className="student-name-text">
                          {p.studentName}
                        </strong>
                      </td>
                      <td>
                        <span className="group-tag-pill">{p.groupName}</span>
                      </td>
                      <td>{p.month}</td>
                      <td>
                        <span className="payment-method-tag">
                          {p.paymentMethod.includes("Card") ? <HiOutlineCreditCard style={{ marginRight: 3, verticalAlign: 'middle' }} /> : <FaMoneyBillWave style={{ marginRight: 3, verticalAlign: 'middle' }} />}
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="text-muted">{p.date}</td>
                      <td>
                        <strong className="text-emerald">
                          {formatMoney(p.amount)}
                        </strong>
                      </td>
                      <td className="text-muted">{p.recordedBy}</td>
                      {canManagePayments && (
                        <td className="text-center">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => openEditModal(p)}
                          >
                            <HiOutlinePencilSquare /> Tahrirlash
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "debtors" && !isStudent && (
        <div className="card table-card">
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>O'quvchi F.I.SH</th>
                  <th>Guruh</th>
                  <th>Telefon</th>
                  <th>Ota-onasi Telefoni</th>
                  <th>Qarzdorlik Summasi</th>
                  {canManagePayments && <th className="text-right">Harakat</th>}
                </tr>
              </thead>
              <tbody>
                {debtorsList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-muted">
                      Qarzdor o'quvchilar mavjud emas!
                    </td>
                  </tr>
                ) : (
                  debtorsList.map((d) => (
                    <tr key={d.id}>
                      <td>
                        <strong className="student-name-text">
                          {d.fullName}
                        </strong>
                      </td>
                      <td>
                        <span className="group-tag-pill">{d.groupName}</span>
                      </td>
                      <td>
                        <HiOutlinePhone style={{ verticalAlign: 'middle', marginRight: 3 }} />
                        {d.phone}
                      </td>
                      <td className="text-muted">
                        <HiOutlineUser style={{ verticalAlign: 'middle', marginRight: 3 }} />
                        {d.parentPhone || "Kiritilmagan"}
                      </td>
                      <td>
                        <strong className="text-danger">
                          {formatMoney(Math.abs(d.balance))}
                        </strong>
                      </td>
                      {canManagePayments && (
                        <td className="text-center">
                          <div className="action-buttons-flex">
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() =>
                                alert(
                                  `SMS Eslatnoma yuborildi!\nQabul qiluvchi: ${d.fullName} (${d.phone})\nMatn: "Hurmatli ${d.fullName}, EduControl o'quv markazidagi oylik to'lovingiz muddati o'tdi. Iltimos to'lovni amalga oshiring."`,
                                )
                              }
                              title="Avtomatik SMS eslatma yuborish"
                            >
                              <HiOutlineChatBubbleLeftRight /> SMS Eslatish
                            </button>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={openCreateModal}
                            >
                              <HiOutlineCreditCard /> To'lov Qabul Qilish
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <div className="modal-header">
              <h2>
                {editingPayment
                  ? "To'lov Ma'lumotini Tahrirlash"
                  : "Oylik To'lovni Qabul Qilish"}
              </h2>
              <button
                className="close-modal-btn"
                onClick={() => setIsModalOpen(false)}
                aria-label="Yopish"
              >
                <HiXMark />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="admin-modal-form">
              <div className="form-group">
                <label className="form-label">To'lov Qilayotgan O'quvchi</label>
                <select
                  className="form-select"
                  value={formData.studentId}
                  onChange={(e) => {
                    const sid = parseInt(e.target.value);
                    const st = students.find((s) => s.id === sid);
                    const grp = groups.find((g) => g.id === st?.groupId);
                    setFormData({
                      ...formData,
                      studentId: sid,
                      amount: grp?.monthlyFee || 850000,
                    });
                  }}
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.groupName}){" "}
                      {s.paymentStatus === "Overdue" ? " [Qarzdor]" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">To'lov Summasi (so'm)</label>
                  <input
                    type="number"
                    className="form-input"
                    required
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Qaysi Oy Uchun</label>
                  <select
                    className="form-select"
                    value={formData.month}
                    onChange={(e) =>
                      setFormData({ ...formData, month: e.target.value })
                    }
                  >
                    <option value="Avgust 2026">Avgust 2026</option>
                    <option value="Sentabr 2026">Sentabr 2026</option>
                    <option value="Oktabr 2026">Oktabr 2026</option>
                    <option value="Iyul 2026">Iyul 2026</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">To'lov Usuli</label>
                  <select
                    className="form-select"
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentMethod: e.target.value,
                      })
                    }
                  >
                    <option value="Card (Click)">Card (Click)</option>
                    <option value="Card (Payme)">Card (Payme)</option>
                    <option value="Naqd pul">Naqd pul</option>
                    <option value="Bank O'tkazmasi">Bank O'tkazmasi</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">To'lov Sanasi</label>
                  <input
                    type="date"
                    className="form-input"
                    required
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Bekor qilish
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPayment
                    ? "Saqlash"
                    : "To'lovni Tasdiqlash & Kvitansiya Berish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
