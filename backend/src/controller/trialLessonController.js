import { TrialLesson, sequelize } from "../models/index.js";
import { validateTrialLesson } from "../validation/trialLessonValidation.js";

export const createTrialLesson = async (req, res) => {
  const { error } = validateTrialLesson(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const payload = {
      student_name: req.body.student_name || req.body.studentName || "Yangi Qiziquvchi",
      phone: req.body.phone,
      teacher_name: req.body.teacher_name || req.body.teacherName || "Abdulaziz Abdulhayev",
      course_name: req.body.course_name || req.body.courseName || "Frontend ReactJS",
      date: req.body.date,
      time: req.body.time || "14:00 - 15:30",
      room: req.body.room || "201-xona",
      status: req.body.status || "Kutilyapti",
      notes: req.body.notes || "",
    };

    let trial;
    try {
      trial = await TrialLesson.create(payload);
    } catch (createErr) {
      if (createErr.name === "SequelizeUniqueConstraintError") {
        await sequelize.query(
          "SELECT setval(pg_get_serial_sequence('trial_lessons', 'id'), COALESCE((SELECT MAX(id) FROM trial_lessons), 1));"
        );
        trial = await TrialLesson.create(payload);
      } else {
        throw createErr;
      }
    }

    res.status(201).json(trial);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTrialLessons = async (req, res) => {
  try {
    const trials = await TrialLesson.findAll({ order: [["date", "DESC"], ["id", "DESC"]] });
    res.status(200).json(trials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTrialLessonById = async (req, res) => {
  try {
    const trial = await TrialLesson.findByPk(req.params.id);
    if (!trial) return res.status(404).json({ error: "Sinov darsi topilmadi" });
    res.status(200).json(trial);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateTrialLesson = async (req, res) => {
  try {
    const trial = await TrialLesson.findByPk(req.params.id);
    if (!trial) return res.status(404).json({ error: "Sinov darsi topilmadi" });

    const updateData = {
      student_name: req.body.student_name || req.body.studentName || trial.student_name,
      phone: req.body.phone || trial.phone,
      teacher_name: req.body.teacher_name || req.body.teacherName || trial.teacher_name,
      course_name: req.body.course_name || req.body.courseName || trial.course_name,
      date: req.body.date || trial.date,
      time: req.body.time || trial.time,
      room: req.body.room || trial.room,
      status: req.body.status || trial.status,
      notes: req.body.notes !== undefined ? req.body.notes : trial.notes,
    };

    await trial.update(updateData);
    res.status(200).json(trial);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteTrialLesson = async (req, res) => {
  try {
    const trial = await TrialLesson.findByPk(req.params.id);
    if (!trial) return res.status(404).json({ error: "Sinov darsi topilmadi" });

    await trial.destroy();
    res.status(200).json({ message: "Sinov darsi muvaffaqiyatli o'chirildi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
