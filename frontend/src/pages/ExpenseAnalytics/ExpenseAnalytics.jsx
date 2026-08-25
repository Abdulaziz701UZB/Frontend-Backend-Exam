import { useState, useEffect } from "react";
import { useEduAuth } from "../../context/EduAuthContext";
import { useToast } from "../../context/ToastContext";
import { FINANCIAL_ANALYTICS } from "../../data/eduData";
import {
  HiOutlineBanknotes,
  HiOutlineChartBar,
  HiOutlineShieldCheck,
  HiOutlinePlus,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineArrowDownTray,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineBuildingLibrary,
  HiOutlineMagnifyingGlass,
  HiOutlineFunnel,
  HiOutlineCreditCard,
  HiOutlineBuildingOffice2,
  HiOutlineDevicePhoneMobile,
  HiOutlineUsers,
  HiXMark
} from "react-icons/hi2";
import "./ExpenseAnalytics.css";

const INITIAL_EXPENSES = [
  {
    id: 1,
    title: "O'qituvchilar Oylik Maoshi (Avgust)",
    category: "O'qituvchilar Maoshi",
    amount: 65000000,
    date: "2026-08-20",
    recipient: "15 nafar mentor va assistentlar",
    paymentMethod: "Karta / Bank",
    status: "To'langan",
    notes: "Oylik to'liq yopildi"
  },
  {
    id: 2,
    title: "Markaz Binosi Oylik Ijarasi",
    category: "Xonalar Ijarasi & Kommunal",
    amount: 20000000,
    date: "2026-08-05",
    recipient: "Biznes Markaz MChJ",
    paymentMethod: "Bank O'tkazmasi",
    status: "To'langan",
    notes: "14 ta o'quv xonasi va ma'muriyat"
  },
  {
    id: 3,
    title: "Elektr energiyasi va Internet (Wi-Fi)",
    category: "Xonalar Ijarasi & Kommunal",
    amount: 5000000,
    date: "2026-08-10",
    recipient: "Toshkent Elektr & Turon Telecom",
    paymentMethod: "Bank O'tkazmasi",
    status: "To'langan",
    notes: "Optik tolali 500 Mbps"
  },
  {
    id: 4,
    title: "Instagram & Facebook Targeted Ads",
    category: "Marketing & Reklama",
    amount: 8500000,
    date: "2026-08-15",
    recipient: "Meta Ads / Targetolog Sardor",
    paymentMethod: "Karta",
    status: "To'langan",
    notes: "Yangi kuzgi qabul kampaniyasi"
  },
  {
    id: 5,
    title: "Tashqi Bannerlar va Flayerlar",
    category: "Marketing & Reklama",
    amount: 3500000,
    date: "2026-08-18",
    recipient: "Print Pro Poligrafiya",
    paymentMethod: "Naqd Pul",
    status: "To'langan",
    notes: "Namangan shahar bo'ylab 5000 ta flayer"
  },
  {
    id: 6,
    title: "Bulutli Server (AWS & Postgres) va SMS Paket",
    category: "IT Tizim & Server",
    amount: 8000000,
    date: "2026-08-01",
    recipient: "Amazon Web Services & PlayMobile SMS",
    paymentMethod: "Karta",
    status: "To'langan",
    notes: "20,000 ta avto-SMS va 99.9% Uptime server"
  }
];

const CATEGORIES = [
  "Barchasi",
  "O'qituvchilar Maoshi",
  "Xonalar Ijarasi & Kommunal",
  "Marketing & Reklama",
  "IT Tizim & Server",
  "Xo'jalik & Kanselyariya",
  "Boshqa Xarajatlar"
];

const ExpenseAnalytics = () => {
  const { isAdmin } = useEduAuth();
  const { showToast } = useToast();

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem("velnex_expenses_v2");
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Barchasi");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "O'qituvchilar Maoshi",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    recipient: "",
    paymentMethod: "Bank O'tkazmasi",
    status: "To'langan",
    notes: ""
  });

  useEffect(() => {
    localStorage.setItem("velnex_expenses_v2", JSON.stringify(expenses));
  }, [expenses]);

  const formatMoney = (amount) => {
    return Number(amount || 0).toLocaleString("uz-UZ") + " so'm";
  };

  const totalExpenseAmount = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const grossRevenue = 185000000;
  const netProfit = grossRevenue - totalExpenseAmount;
  const profitMarginPct = ((netProfit / grossRevenue) * 100).toFixed(1) + "%";

  const handleOpenAddModal = () => {
    setEditingExpense(null);
    setFormData({
      title: "",
      category: "O'qituvchilar Maoshi",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      recipient: "",
      paymentMethod: "Bank O'tkazmasi",
      status: "To'langan",
      notes: ""
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingExpense(item);
    setFormData({
      title: item.title,
      category: item.category,
      amount: item.amount,
      date: item.date,
      recipient: item.recipient,
      paymentMethod: item.paymentMethod,
      status: item.status,
      notes: item.notes || ""
    });
    setIsModalOpen(true);
  };

  const handleDeleteExpense = (id) => {
    if (window.confirm("Haqiqatan ham ushbu xarajat yozuvini o'chirmoqchimisiz?")) {
      setExpenses((prev) => prev.filter((item) => item.id !== id));
      showToast("Xarajat yozuvi muvaffaqiyatli o'chirildi", "info");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) {
      showToast("Iltimos, xarajat nomi va summasini kiriting", "error");
      return;
    }

    if (editingExpense) {
      setExpenses((prev) =>
        prev.map((item) =>
          item.id === editingExpense.id
            ? { ...item, ...formData, amount: Number(formData.amount) }
            : item
        )
      );
      showToast("Xarajat ma'lumotlari muvaffaqiyatli yangilandi", "success");
    } else {
      const newEntry = {
        id: Date.now(),
        ...formData,
        amount: Number(formData.amount)
      };
      setExpenses((prev) => [newEntry, ...prev]);
      showToast("Yangi xarajat muvaffaqiyatli qo'shildi", "success");
    }

    setIsModalOpen(false);
  };

  const filteredExpenses = expenses.filter((item) => {
    const matchesCategory =
      selectedCategory === "Barchasi" || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.recipient.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="expense-analytics-page">
      {/* Page Top Header */}
      <div className="page-header-flex">
        <div>
          <h1 className="page-main-title">
            <HiOutlineChartBar className="page-title-icon text-indigo" />
            Moliyaviy Xavf & Xarajatlar Tahlili
          </h1>
          <p className="page-sub-title">
            O'quv markazining oylik operatsion byudjeti, xarajatlar moddalari va rentabellik monitoringi
          </p>
        </div>
        <div className="header-action-buttons">
          <button className="btn-primary-action" onClick={handleOpenAddModal}>
            <HiOutlinePlus className="btn-icon" />
            <span>Yangi Xarajat Qo'shish</span>
          </button>
        </div>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="expense-kpi-grid">
        <div className="kpi-card kpi-revenue">
          <div className="kpi-icon-wrap">
            <HiOutlineBanknotes />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Oylik Jami Daromad</span>
            <strong className="kpi-value">{formatMoney(grossRevenue)}</strong>
            <span className="kpi-subtext">312 nafar o'quvchi to'lovlari</span>
          </div>
        </div>

        <div className="kpi-card kpi-expense">
          <div className="kpi-icon-wrap">
            <HiOutlineCreditCard />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Oylik Jami Xarajat</span>
            <strong className="kpi-value">{formatMoney(totalExpenseAmount)}</strong>
            <span className="kpi-subtext">{expenses.length} ta tasdiqlangan to'lov</span>
          </div>
        </div>

        <div className="kpi-card kpi-profit">
          <div className="kpi-icon-wrap">
            <HiOutlineCheckCircle />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Oylik Sof Foyda</span>
            <strong className="kpi-value">{formatMoney(netProfit)}</strong>
            <span className="kpi-badge-pill">{profitMarginPct} Rentabellik</span>
          </div>
        </div>

        <div className="kpi-card kpi-risk">
          <div className="kpi-icon-wrap">
            <HiOutlineShieldCheck />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Tizim Xavf Darajasi</span>
            <strong className="kpi-value">Barqaror (Xavfsiz)</strong>
            <span className="kpi-subtext">Qarzdorlik atigi 3.8%</span>
          </div>
        </div>
      </div>

      {/* 2 Separated Analytics Cards */}
      <div className="analytics-two-columns">
        {/* Card 1: Xarajatlar Taqsimoti */}
        <div className="card expense-breakdown-card">
          <div className="card-header-styled">
            <div>
              <h3 className="card-heading">
                <HiOutlineChartBar className="inline-icon text-indigo" />
                Xarajatlar Moddalari Taqsimoti
              </h3>
              <p className="card-subheading">Kategoriyalar bo'yicha sarflangan mablag' ulushi</p>
            </div>
            <span className="badge-total-expense">
              Jami: {formatMoney(totalExpenseAmount)}
            </span>
          </div>

          <div className="breakdown-list">
            {FINANCIAL_ANALYTICS.expensesBreakdown.map((item, idx) => {
              const themeClasses = ["theme-indigo", "theme-blue", "theme-amber", "theme-purple"];
              const theme = themeClasses[idx % themeClasses.length];
              return (
                <div key={idx} className={`breakdown-item ${theme}`}>
                  <div className="breakdown-info">
                    <div className="breakdown-name-wrap">
                      <span className="breakdown-bullet"></span>
                      <span className="breakdown-name">{item.name}</span>
                    </div>
                    <div className="breakdown-numbers">
                      <strong className="breakdown-amount">{formatMoney(item.amount)}</strong>
                      <span className="breakdown-pct-tag">{item.pct}</span>
                    </div>
                  </div>
                  <div className="breakdown-bar">
                    <div className="breakdown-fill" style={{ width: item.pct }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 2: Moliyaviy Xavf & Sifat Indikatorlari */}
        <div className="card risk-indicators-card">
          <div className="card-header-styled">
            <div>
              <h3 className="card-heading">
                <HiOutlineShieldCheck className="inline-icon text-emerald" />
                Moliyaviy Xavf & Sifat Indikatorlari
              </h3>
              <p className="card-subheading">Qarzdorlik, talabalar oqimi va xonalar rentabelligi</p>
            </div>
            <span className="badge-system-health">
              <HiOutlineCheckCircle className="icon-sm" /> Tizim Barqaror
            </span>
          </div>

          <div className="risk-indicators-list">
            {FINANCIAL_ANALYTICS.riskIndicators.map((risk, idx) => (
              <div key={idx} className={`risk-card-item risk-${risk.status}`}>
                <div className="risk-header">
                  <div className="risk-title-wrap">
                    {risk.status === "amber" && <HiOutlineExclamationTriangle className="risk-icon text-amber" />}
                    {risk.status === "emerald" && <HiOutlineCheckCircle className="risk-icon text-emerald" />}
                    {risk.status === "indigo" && <HiOutlineBuildingLibrary className="risk-icon text-indigo" />}
                    <strong className="risk-title">{risk.title}</strong>
                  </div>
                  <span className={`risk-level-badge level-${risk.status}`}>{risk.level}</span>
                </div>
                <div className="risk-body">
                  <span className="risk-val">{risk.value}</span>
                  <p className="risk-desc">{risk.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CRUD Expense List & Search/Filter Section */}
      <div className="card expense-table-card">
        <div className="table-top-bar">
          <div className="table-title-group">
            <h3 className="card-heading">
              <HiOutlineCreditCard className="inline-icon text-indigo" />
              Barcha Operatsion Xarajatlar Jurnali (CRUD)
            </h3>
            <p className="card-subheading">Markazning barcha to'langan va rejalashtirilgan xarajat yozuvlari</p>
          </div>

          <div className="table-controls-row">
            <div className="search-input-wrap">
              <HiOutlineMagnifyingGlass className="search-icon" />
              <input
                type="text"
                placeholder="Xarajat nomi yoki qabul qiluvchi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="category-filter-wrap">
              <HiOutlineFunnel className="filter-icon" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="category-select"
              >
                {CATEGORIES.map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="responsive-table-wrap">
          <table className="custom-expense-table">
            <thead>
              <tr>
                <th>№ Sana</th>
                <th>Xarajat Nomi</th>
                <th>Kategoriya</th>
                <th>Qabul Qiluvchi / Vendor</th>
                <th>To'lov Usuli</th>
                <th>Summa</th>
                <th>Holati</th>
                <th className="text-right">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-table-cell">
                    Qidiruv yoki filtr bo'yicha xarajatlar topilmadi
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((item, idx) => (
                  <tr key={item.id}>
                    <td>
                      <span className="date-badge">{item.date}</span>
                    </td>
                    <td>
                      <strong className="expense-name">{item.title}</strong>
                      {item.notes && <p className="expense-notes">{item.notes}</p>}
                    </td>
                    <td>
                      <span className="category-tag">{item.category}</span>
                    </td>
                    <td className="vendor-name">{item.recipient}</td>
                    <td>
                      <span className="payment-method-chip">{item.paymentMethod}</span>
                    </td>
                    <td>
                      <strong className="expense-amount-val">{formatMoney(item.amount)}</strong>
                    </td>
                    <td>
                      <span className="status-pill status-paid">{item.status}</span>
                    </td>
                    <td className="text-right">
                      <div className="action-buttons-wrap">
                        <button
                          className="btn-icon-action btn-edit"
                          onClick={() => handleOpenEditModal(item)}
                          title="Tahrirlash"
                        >
                          <HiOutlinePencilSquare />
                        </button>
                        <button
                          className="btn-icon-action btn-delete"
                          onClick={() => handleDeleteExpense(item.id)}
                          title="O'chirish"
                        >
                          <HiOutlineTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="custom-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="custom-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingExpense ? (
                  <><HiOutlinePencilSquare className="inline-icon-sm text-indigo" /> Xarajatni Tahrirlash</>
                ) : (
                  <><HiOutlinePlus className="inline-icon-sm text-indigo" /> Yangi Xarajat Qo'shish</>
                )}
              </h3>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <HiXMark />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Xarajat Nomi *</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: O'qituvchilar maoshi yoki SMM reklama"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Kategoriya *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="form-control"
                  >
                    {CATEGORIES.filter((c) => c !== "Barchasi").map((cat, idx) => (
                      <option key={idx} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Summa (so'mda) *</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    placeholder="Masalan: 5000000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Sana *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Qabul Qiluvchi / Vendor</label>
                  <input
                    type="text"
                    placeholder="Kompaniya yoki shaxs nomi"
                    value={formData.recipient}
                    onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">To'lov Usuli</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="form-control"
                  >
                    <option value="Bank O'tkazmasi">Bank O'tkazmasi</option>
                    <option value="Karta (Click / Payme)">Karta (Click / Payme)</option>
                    <option value="Naqd Pul">Naqd Pul</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Holati</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="form-control"
                  >
                    <option value="To'langan">To'langan</option>
                    <option value="Kutilmoqda">Kutilmoqda</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Qo'shimcha Izoh</label>
                <textarea
                  rows="2"
                  placeholder="Kvitansiya raqami yoki xarajat tafsilotlari..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="form-control"
                ></textarea>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Bekor Qilish
                </button>
                <button type="submit" className="btn-save">
                  {editingExpense ? "O'zgarishlarni Saqlash" : "Xarajatni Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseAnalytics;
