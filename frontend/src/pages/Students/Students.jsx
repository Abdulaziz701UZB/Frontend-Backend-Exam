import { useState } from "react";
import { useEduAuth } from "../../context/EduAuthContext";
import {
  getStoredData,
  setStoredData,
  INITIAL_STUDENTS,
  INITIAL_GROUPS,
  STORAGE,
} from "../../data/eduData";
import {
  HiOutlinePlus,
  HiMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiXMark,
  HiOutlinePhone,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineUser
} from "react-icons/hi2";
import { FaUserGraduate } from "react-icons/fa6";
import "./Students.css";

const Students = () => {
  const { canManageStudents } = useEduAuth();

  const [students, setStudents] = useState(() =>
    getStoredData(STORAGE.STUDENTS, INITIAL_STUDENTS),
  );
  const [groups] = useState(() =>
    getStoredData(STORAGE.GROUPS, INITIAL_GROUPS),
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroupFilter, setSelectedGroupFilter] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "Abdulaziz Abdulhayev",
    phone: "+998 90 599 06 00",
    parentPhone: "+998 90 599 06 00",
    groupId: "G-101",
    paymentStatus: "Paid",
    balance: 0,
    status: "Active",
  });

  const saveStudentsToStorage = (updated) => {
    setStudents(updated);
    setStoredData(STORAGE.STUDENTS, updated);
  };

  const openCreateModal = () => {
    setEditingStudent(null);
    setFormData({
      fullName: "",
      phone: "+998 90 599 06 00",
      parentPhone: "+998 90 599 06 00",
      groupId: groups[0]?.id || "G-101",
      paymentStatus: "Paid",
      balance: 0,
      status: "Active",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setFormData({
      fullName: student.fullName,
      phone: student.phone,
      parentPhone: student.parentPhone,
      groupId: student.groupId,
      paymentStatus: student.paymentStatus,
      balance: student.balance,
      status: student.status,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const groupObj = groups.find((g) => g.id === formData.groupId) || groups[0];
    const groupNameText = `${groupObj?.name} (${groupObj?.courseName})`;

    if (editingStudent) {
      const updated = students.map((s) => {
        if (s.id === editingStudent.id) {
          return {
            ...s,
            ...formData,
            groupName: groupNameText,
            balance: parseFloat(formData.balance),
          };
        }
        return s;
      });
      saveStudentsToStorage(updated);
    } else {
      const newStudent = {
        id: Math.floor(10 + Math.random() * 900),
        ...formData,
        groupName: groupNameText,
        balance: parseFloat(formData.balance),
        joinDate: new Date().toISOString().split("T")[0],
      };
      saveStudentsToStorage([newStudent, ...students]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteStudent = (studentId) => {
    if (
      window.confirm(
        "Haqiqatan ham ushbu o'quvchini guruhdan chiqarmoqchisiz/arxivlamoqchisiz?",
      )
    ) {
      const updated = students.filter((s) => s.id !== studentId);
      saveStudentsToStorage(updated);
    }
  };

  const filteredStudents = students.filter((s) => {
    if (selectedGroupFilter !== "All" && s.groupId !== selectedGroupFilter)
      return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        s.fullName.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        s.groupName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";
  };

  return (
    <div className="students-page">
      <div className="page-header-flex">
        <div>
          <h1 className="page-title">
            <FaUserGraduate style={{ verticalAlign: 'middle', marginRight: 6 }} />
            O'quvchilar va Guruhga Biriktirish
          </h1>
          <p className="page-subtitle">
            O'quv markazining barcha talabalari directoryasi va guruhlar
            bo'yicha taqsimot
          </p>
        </div>
        {canManageStudents && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            <HiOutlinePlus /> Yangi O'quvchi Qo'shish
          </button>
        )}
      </div>

      <div className="card filter-card">
        <div className="filter-row">
          <div className="search-input-wrap">
            <span className="search-icon"><HiMagnifyingGlass /></span>
            <input
              type="text"
              className="form-input search-field"
              placeholder="Masalan: Abdulaziz Abdulhayev yoki +998 90 599 06 00..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="group-filter-wrap">
            <label className="form-label mb-0">Guruh bo'yicha filter:</label>
            <select
              className="form-select filter-select"
              value={selectedGroupFilter}
              onChange={(e) => setSelectedGroupFilter(e.target.value)}
            >
              <option value="All">
                Barcha Guruhlar ({students.length} ta o'quvchi)
              </option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.courseName})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card table-card">
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th style={{ width: "50px" }}>ID</th>
                <th>F.I.SH (O'QUVCHI)</th>
                <th>TELEFON / OTA-ONA</th>
                <th>BIRIKTIRILGAN GURUH</th>
                <th>QO'SHILGAN SANA</th>
                <th>TO'LOV HOLATI</th>
                <th>BALANS</th>
                {canManageStudents && (
                  <th className="text-center">HARAKATLAR</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={canManageStudents ? "8" : "7"}
                    className="text-center py-6 text-muted"
                  >
                    O'quvchilar topilmadi
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <span className="id-pill">#{student.id}</span>
                    </td>
                    <td>
                      <div className="student-name-cell">
                        <span className="avatar-circle"><FaUserGraduate /></span>
                        <div>
                          <strong className="student-name-text">
                            {student.fullName}
                          </strong>
                          <span className="student-status-tag">
                            {student.status}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="phone-cell">
                        <span className="user-phone">
                          <HiOutlinePhone style={{ verticalAlign: 'middle', marginRight: 2 }} /> {student.phone}
                        </span>
                        <small className="parent-phone">
                          <HiOutlineUser style={{ verticalAlign: 'middle', marginRight: 2 }} /> {student.parentPhone || "+998 90 599 06 00"}
                        </small>
                      </div>
                    </td>
                    <td>
                      <span className="group-tag-pill">
                        {student.groupName}
                      </span>
                    </td>
                    <td className="text-muted">{student.joinDate}</td>
                    <td>
                      <span
                        className={`status-pill pill-${student.paymentStatus.toLowerCase()}`}
                      >
                        {student.paymentStatus === "Paid" ? (
                          <><HiOutlineCheckCircle style={{ verticalAlign: 'middle', marginRight: 4 }} /> To'langan</>
                        ) : (
                          <><HiOutlineExclamationTriangle style={{ verticalAlign: 'middle', marginRight: 4 }} /> Qarzdor</>
                        )}
                      </span>
                    </td>
                    <td>
                      <strong
                        className={
                          student.balance < 0 ? "text-danger" : "text-success"
                        }
                      >
                        {formatMoney(student.balance)}
                      </strong>
                    </td>
                    {canManageStudents && (
                      <td className="text-center">
                        <div className="action-buttons-flex">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => openEditModal(student)}
                          >
                            <HiOutlinePencilSquare /> Tahrirlash
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteStudent(student.id)}
                          >
                            <HiOutlineTrash /> O'chirish
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

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <div className="modal-header">
              <h2>
                {editingStudent
                  ? "O'quvchi Ma'lumotlarini Tahrirlash"
                  : "Yangi O'quvchi Qo'shish & Guruhga Biriktirish"}
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
                <label className="form-label">
                  O'quvchining F.I.SH (Familya va Ism)
                </label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="Masalan: Abdulaziz Abdulhayev"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </div>

              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">
                    O'quvchining Telefon Raqami
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="+998 90 599 06 00"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ota-onasi Telefon Raqami</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="+998 90 599 06 00"
                    value={formData.parentPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, parentPhone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">Biriktiriladigan Guruh</label>
                  <select
                    className="form-select"
                    value={formData.groupId}
                    onChange={(e) =>
                      setFormData({ ...formData, groupId: e.target.value })
                    }
                  >
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.courseName}) - {g.teacherName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">To'lov Holati</label>
                  <select
                    className="form-select"
                    value={formData.paymentStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentStatus: e.target.value,
                      })
                    }
                  >
                    <option value="Paid">Paid (To'langan)</option>
                    <option value="Overdue">Overdue (Qarzdor)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Balans (Musbat yoki Manfiy masalan: -850000)
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.balance}
                  onChange={(e) =>
                    setFormData({ ...formData, balance: e.target.value })
                  }
                />
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
                  {editingStudent ? "Saqlash" : "O'quvchini Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
