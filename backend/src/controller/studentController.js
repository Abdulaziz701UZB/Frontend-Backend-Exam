import { Student, Group, sequelize } from "../models/index.js";
import { validateStudent } from "../validation/studentValidation.js";
import { Op } from "sequelize";

export const createStudent = async (req, res) => {
  const { error } = validateStudent(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const newStudentData = {
      full_name: req.body.full_name || req.body.fullName || "",
      phone: req.body.phone,
      parent_phone: req.body.parent_phone || req.body.parentPhone || "",
      group_id: req.body.group_id || req.body.groupId || null,
      group_name: req.body.group_name || req.body.groupName || "",
      join_date: req.body.join_date || req.body.joinDate || new Date().toISOString().split("T")[0],
      payment_status: req.body.payment_status || req.body.paymentStatus || "Paid",
      balance: req.body.balance !== undefined ? req.body.balance : 0,
      status: req.body.status || "Active",
    };

    let student;
    try {
      student = await Student.create(newStudentData);
    } catch (createErr) {
      if (createErr.name === "SequelizeUniqueConstraintError") {
        await sequelize.query(
          "SELECT setval(pg_get_serial_sequence('students', 'id'), COALESCE((SELECT MAX(id) FROM students), 1));"
        );
        student = await Student.create(newStudentData);
      } else {
        throw createErr;
      }
    }

    const result = await Student.findByPk(student.id, {
      include: [{ model: Group, as: "group" }],
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getStudents = async (req, res) => {
  try {
    const students = await Student.findAll({
      order: [["id", "ASC"]],
      include: [{ model: Group, as: "group" }],
    });
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [{ model: Group, as: "group" }],
    });
    if (!student) return res.status(404).json({ error: "O'quvchi topilmadi" });
    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateStudent = async (req, res) => {
  const { error } = validateStudent(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: "O'quvchi topilmadi" });

    const updateData = {
      full_name: req.body.full_name || req.body.fullName || student.full_name,
      phone: req.body.phone || student.phone,
      parent_phone: req.body.parent_phone || req.body.parentPhone || student.parent_phone,
      group_id: req.body.group_id || req.body.groupId || student.group_id,
      group_name: req.body.group_name || req.body.groupName || student.group_name,
      payment_status: req.body.payment_status || req.body.paymentStatus || student.payment_status,
      balance: req.body.balance !== undefined ? req.body.balance : student.balance,
      status: req.body.status || student.status,
    };

    await student.update(updateData);
    const updatedStudent = await Student.findByPk(req.params.id, {
      include: [{ model: Group, as: "group" }],
    });
    res.status(200).json(updatedStudent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ error: "O'quvchi topilmadi" });

    await student.destroy();
    res.status(200).json({ message: "O'quvchi muvaffaqiyatli o'chirildi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const searchStudents = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Qidiruv so'rovi kiritilishi shart" });
    }

    const students = await Student.findAll({
      where: {
        [Op.or]: [
          { full_name: { [Op.iLike]: `%${query}%` } },
          { phone: { [Op.iLike]: `%${query}%` } },
          { group_name: { [Op.iLike]: `%${query}%` } },
        ],
      },
      include: [{ model: Group, as: "group" }],
    });

    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const transferStudent = async (req, res) => {
  try {
    const { newGroupId, newGroupName, transferReason } = req.body;
    if (!newGroupId) {
      return res.status(400).json({ error: "Yangi guruh tanlanishi shart" });
    }

    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ error: "O'quvchi topilmadi" });
    }

    const oldGroupName = student.group_name;
    await student.update({
      group_id: newGroupId,
      group_name: newGroupName || newGroupId,
    });

    const updated = await Student.findByPk(req.params.id, {
      include: [{ model: Group, as: "group" }],
    });

    res.status(200).json({
      message: `O'quvchi ${oldGroupName} guruhidan ${newGroupName || newGroupId} guruhiga muvaffaqiyatli o'tkazildi!`,
      student: updated,
      transferReason: transferReason || "O'quvchi / ota-ona istagi",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
