import { Attendance, Student, Group } from "../models/index.js";
import { validateAttendance } from "../validation/attendanceValidation.js";

export const createAttendance = async (req, res) => {
  const { error } = validateAttendance ? validateAttendance(req.body) : { error: null };
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const { group_id, student_id, date, status, note, reason_category } = req.body;
    
    // Check if attendance already exists for this student in this group on this date:
    let existing = null;
    if (group_id && student_id && date) {
      existing = await Attendance.findOne({
        where: { group_id, student_id, date }
      });
    }

    if (existing) {
      await existing.update({
        status: status !== undefined ? status : existing.status,
        note: note !== undefined ? note : existing.note,
        reason_category: reason_category !== undefined ? reason_category : existing.reason_category
      });
      const result = await Attendance.findByPk(existing.id, {
        include: [
          { model: Student, as: "student" },
          { model: Group, as: "group" },
        ],
      });
      return res.status(200).json(result);
    }

    const attendance = await Attendance.create(req.body);
    const result = await Attendance.findByPk(attendance.id, {
      include: [
        { model: Student, as: "student" },
        { model: Group, as: "group" },
      ],
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAttendance = async (req, res) => {
  try {
    const where = {};
    if (req.query.groupId) where.group_id = req.query.groupId;
    if (req.query.date) where.date = req.query.date;

    const records = await Attendance.findAll({
      where,
      order: [["updatedAt", "DESC"], ["id", "DESC"]],
      include: [
        { model: Student, as: "student" },
        { model: Group, as: "group" },
      ],
    });
    res.status(200).json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAttendanceById = async (req, res) => {
  try {
    const record = await Attendance.findByPk(req.params.id, {
      include: [
        { model: Student, as: "student" },
        { model: Group, as: "group" },
      ],
    });
    if (!record) return res.status(404).json({ error: "Davomat yozuvi topilmadi" });
    res.status(200).json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateAttendance = async (req, res) => {
  try {
    const record = await Attendance.findByPk(req.params.id);
    if (!record) return res.status(404).json({ error: "Davomat yozuvi topilmadi" });
    await record.update(req.body);
    res.status(200).json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteAttendance = async (req, res) => {
  try {
    const record = await Attendance.findByPk(req.params.id);
    if (!record) return res.status(404).json({ error: "Davomat yozuvi topilmadi" });
    await record.destroy();
    res.status(200).json({ message: "Davomat o'chirildi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
