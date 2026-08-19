import { Student, Group } from "../models/index.js";
import { validateStudent } from "../validation/studentValidation.js";
import { Op } from "sequelize";

export const createStudent = async (req, res) => {
  const { error } = validateStudent(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const student = await Student.create(req.body);
    const result = await Student.findByPk(student.id, {
      include: [{ model: Group, as: "group" }],
    });
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const getStudents = async (req, res) => {
  try {
    const students = await Student.findAll({
      include: [{ model: Group, as: "group" }],
    });
    res.status(200).send(students);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [{ model: Group, as: "group" }],
    });
    if (!student) return res.status(404).send("Student not found");
    res.status(200).send(student);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const updateStudent = async (req, res) => {
  const { error } = validateStudent(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).send("Student not found");

    await student.update(req.body);
    const updatedStudent = await Student.findByPk(req.params.id, {
      include: [{ model: Group, as: "group" }],
    });
    res.status(200).send(updatedStudent);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [{ model: Group, as: "group" }],
    });
    if (!student) return res.status(404).send("Student not found");

    const studentData = student.toJSON();
    await student.destroy();
    res.status(200).send(studentData);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const searchStudents = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).send("Search query is required");
    }

    const students = await Student.findAll({
      where: {
        [Op.or]: [
          { full_name: { [Op.iLike]: `%${query}%` } },
          { phone: { [Op.iLike]: `%${query}%` } },
          { parent_phone: { [Op.iLike]: `%${query}%` } },
          { group_name: { [Op.iLike]: `%${query}%` } },
        ],
      },
      include: [{ model: Group, as: "group" }],
    });

    res.status(200).send(students);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
