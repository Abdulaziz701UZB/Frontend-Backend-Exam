import { Teacher, sequelize } from "../models/index.js";
import { Op } from "sequelize";

export const createTeacher = async (req, res) => {
  try {
    let teacher;
    try {
      teacher = await Teacher.create(req.body);
    } catch (createErr) {
      if (createErr.name === "SequelizeUniqueConstraintError") {
        await sequelize.query(
          "SELECT setval(pg_get_serial_sequence('teachers', 'id'), COALESCE((SELECT MAX(id) FROM teachers), 1));"
        );
        teacher = await Teacher.create(req.body);
      } else {
        throw createErr;
      }
    }
    res.status(201).json(teacher);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.findAll({ order: [["id", "ASC"]] });
    res.status(200).json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) return res.status(404).json({ error: "O'qituvchi topilmadi" });
    res.status(200).json(teacher);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) return res.status(404).json({ error: "O'qituvchi topilmadi" });

    await teacher.update(req.body);
    res.status(200).json(teacher);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) return res.status(404).json({ error: "O'qituvchi topilmadi" });

    await teacher.destroy();
    res.status(200).json({ message: "O'qituvchi muvaffaqiyatli o'chirildi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const searchTeachers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Qidiruv so'rovi kiritilishi shart" });
    }

    const teachers = await Teacher.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { phone: { [Op.iLike]: `%${query}%` } },
          { subject: { [Op.iLike]: `%${query}%` } },
        ],
      },
    });

    res.status(200).json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
