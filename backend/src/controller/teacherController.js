import { Teacher } from "../models/index.js";
import { Op } from "sequelize";

export const createTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.create(req.body);
    res.status(201).send(teacher);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.findAll();
    res.status(200).send(teachers);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) return res.status(404).send("Teacher not found");
    res.status(200).send(teacher);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const updateTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) return res.status(404).send("Teacher not found");

    await teacher.update(req.body);
    res.status(200).send(teacher);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) return res.status(404).send("Teacher not found");

    const teacherData = teacher.toJSON();
    await teacher.destroy();
    res.status(200).send(teacherData);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const searchTeachers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).send("Search query is required");

    const teachers = await Teacher.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { subject: { [Op.iLike]: `%${query}%` } },
          { phone: { [Op.iLike]: `%${query}%` } },
        ],
      },
    });
    res.status(200).send(teachers);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
