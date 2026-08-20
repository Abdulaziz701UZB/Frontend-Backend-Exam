import { Course } from "../models/index.js";
import { validateCourse } from "../validation/courseValidation.js";
import { Op } from "sequelize";

export const createCourse = async (req, res) => {
  const { error } = validateCourse(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({ order: [["id", "ASC"]] });
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: "Kurs topilmadi" });
    res.status(200).json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateCourse = async (req, res) => {
  const { error } = validateCourse(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: "Kurs topilmadi" });
    await course.update(req.body);
    res.status(200).json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: "Kurs topilmadi" });
    await course.destroy();
    res.status(200).json({ message: "Kurs o'chirildi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
