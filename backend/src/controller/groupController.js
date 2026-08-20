import { Group, Course, Teacher } from "../models/index.js";
import { validateGroup } from "../validation/groupValidation.js";
import { Op } from "sequelize";

export const createGroup = async (req, res) => {
  const { error } = validateGroup(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const newGroupData = {
      id: req.body.id || `G-${Math.floor(100 + Math.random() * 900)}`,
      name: req.body.name,
      course_id: req.body.course_id || req.body.courseId || null,
      course_name: req.body.course_name || req.body.courseName || "",
      teacher_id: req.body.teacher_id || req.body.teacherId || null,
      teacher_name: req.body.teacher_name || req.body.teacherName || "",
      room: req.body.room,
      schedule_days: req.body.schedule_days || req.body.scheduleDays || "",
      schedule_time: req.body.schedule_time || req.body.scheduleTime || "",
      monthly_fee: req.body.monthly_fee !== undefined ? req.body.monthly_fee : req.body.monthlyFee,
      status: req.body.status || "Active",
      start_date: req.body.start_date || req.body.startDate || new Date().toISOString().split("T")[0],
    };
    const group = await Group.create(newGroupData);
    const result = await Group.findByPk(group.id, {
      include: [
        { model: Course, as: "course" },
        { model: Teacher, as: "teacher" },
      ],
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getGroups = async (req, res) => {
  try {
    const groups = await Group.findAll({
      order: [["id", "ASC"]],
      include: [
        { model: Course, as: "course" },
        { model: Teacher, as: "teacher" },
      ],
    });
    res.status(200).json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getGroupById = async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id, {
      include: [
        { model: Course, as: "course" },
        { model: Teacher, as: "teacher" },
      ],
    });
    if (!group) return res.status(404).json({ error: "Guruh topilmadi" });
    res.status(200).json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateGroup = async (req, res) => {
  const { error } = validateGroup(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const group = await Group.findByPk(req.params.id);
    if (!group) return res.status(404).json({ error: "Guruh topilmadi" });

    const updateData = {
      name: req.body.name || group.name,
      course_id: req.body.course_id || req.body.courseId || group.course_id,
      course_name: req.body.course_name || req.body.courseName || group.course_name,
      teacher_id: req.body.teacher_id || req.body.teacherId || group.teacher_id,
      teacher_name: req.body.teacher_name || req.body.teacherName || group.teacher_name,
      room: req.body.room || group.room,
      schedule_days: req.body.schedule_days || req.body.scheduleDays || group.schedule_days,
      schedule_time: req.body.schedule_time || req.body.scheduleTime || group.schedule_time,
      monthly_fee: req.body.monthly_fee !== undefined ? req.body.monthly_fee : req.body.monthlyFee !== undefined ? req.body.monthlyFee : group.monthly_fee,
      status: req.body.status || group.status,
    };

    await group.update(updateData);
    const updatedGroup = await Group.findByPk(req.params.id, {
      include: [
        { model: Course, as: "course" },
        { model: Teacher, as: "teacher" },
      ],
    });
    res.status(200).json(updatedGroup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id);
    if (!group) return res.status(404).json({ error: "Guruh topilmadi" });

    await group.destroy();
    res.status(200).json({ message: "Guruh muvaffaqiyatli o'chirildi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const searchGroups = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Qidiruv so'rovi kiritilishi shart" });
    }

    const groups = await Group.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { room: { [Op.iLike]: `%${query}%` } },
          { course_name: { [Op.iLike]: `%${query}%` } },
          { teacher_name: { [Op.iLike]: `%${query}%` } },
        ],
      },
      include: [
        { model: Course, as: "course" },
        { model: Teacher, as: "teacher" },
      ],
    });

    res.status(200).json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
