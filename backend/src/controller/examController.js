import { Exam } from "../models/index.js";

export const createExam = async (req, res) => {
  try {
    const newExamData = {
      id: req.body.id || `EX-${Math.floor(100 + Math.random() * 900)}`,
      group_name: req.body.group_name || req.body.groupName || "",
      title: req.body.title || "",
      date: req.body.date || new Date().toISOString().split("T")[0],
      total_score: req.body.total_score || req.body.totalScore || 100,
      max_passing_score: req.body.max_passing_score || req.body.maxPassingScore || 70,
      status: req.body.status || "Upcoming",
    };
    const exam = await Exam.create(newExamData);
    res.status(201).json(exam);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getExams = async (req, res) => {
  try {
    const exams = await Exam.findAll({ order: [["date", "DESC"]] });
    res.status(200).json(exams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) return res.status(404).json({ error: "Imtihon topilmadi" });
    res.status(200).json(exam);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateExam = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) return res.status(404).json({ error: "Imtihon topilmadi" });

    const updateData = {
      group_name: req.body.group_name || req.body.groupName || exam.group_name,
      title: req.body.title || exam.title,
      date: req.body.date || exam.date,
      total_score: req.body.total_score || req.body.totalScore || exam.total_score,
      max_passing_score: req.body.max_passing_score || req.body.maxPassingScore || exam.max_passing_score,
      status: req.body.status || exam.status,
    };

    await exam.update(updateData);
    res.status(200).json(exam);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) return res.status(404).json({ error: "Imtihon topilmadi" });

    await exam.destroy();
    res.status(200).json({ message: "Imtihon o'chirildi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
