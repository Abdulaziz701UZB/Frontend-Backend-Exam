import { Attendance, Student, Group } from "../models/index.js";

export const createAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.create(req.body);
    const result = await Attendance.findByPk(attendance.id, {
      include: [
        { model: Student, as: "student" },
        { model: Group, as: "group" },
      ],
    });
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const getAttendance = async (req, res) => {
  try {
    const where = {};
    if (req.query.groupId) where.group_id = req.query.groupId;
    if (req.query.date) where.date = req.query.date;

    const records = await Attendance.findAll({
      where,
      include: [
        { model: Student, as: "student" },
        { model: Group, as: "group" },
      ],
    });
    res.status(200).send(records);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const deleteAttendance = async (req, res) => {
  try {
    const record = await Attendance.findByPk(req.params.id);
    if (!record) return res.status(404).send("Attendance record not found");

    const recordData = record.toJSON();
    await record.destroy();
    res.status(200).send(recordData);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
