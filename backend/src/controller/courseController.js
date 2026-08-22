import { Course, sequelize } from "../models/index.js";
import { validateCourse } from "../validation/courseValidation.js";

export const createCourse = async (req, res) => {
  const { error } = validateCourse(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    let course;
    try {
      course = await Course.create(req.body);
    } catch (createErr) {
      if (createErr.name === "SequelizeUniqueConstraintError") {
        await sequelize.query(
          "SELECT setval(pg_get_serial_sequence('courses', 'id'), COALESCE((SELECT MAX(id) FROM courses), 1));"
        );
        course = await Course.create(req.body);
      } else {
        throw createErr;
      }
    }
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
