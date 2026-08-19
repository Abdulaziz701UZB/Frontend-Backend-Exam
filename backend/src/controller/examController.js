import { Exam } from "../models/index.js";
import { Op } from "sequelize";

export const createExam = async (req, res) => {
  try {
    const newExamData = {
      ...req.body,
      id: req.body.id || `EX-${Math.floor(100 + Math.random() * 900)}`,
    };
    const exam = await Exam.create(newExamData);
    res.status(201).send(exam);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const getExams = async (req, res) => {
  try {
    const exams = await Exam.findAll();
    res.status(200).send(exams);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) return res.status(404).send("Exam not found");
    res.status(200).send(exam);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const updateExam = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) return res.status(404).send("Exam not found");

    await exam.update(req.body);
    res.status(200).send(exam);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) return res.status(404).send("Exam not found");

    const examData = exam.toJSON();
    await exam.destroy();
    res.status(200).send(examData);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
