import { Homework } from "../models/index.js";

export const createHomework = async (req, res) => {
  try {
    const newHwData = {
      ...req.body,
      id: req.body.id || `HW-${Math.floor(10 + Math.random() * 90)}`,
    };
    const hw = await Homework.create(newHwData);
    res.status(201).send(hw);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const getHomework = async (req, res) => {
  try {
    const hwList = await Homework.findAll();
    res.status(200).send(hwList);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const updateHomework = async (req, res) => {
  try {
    const hw = await Homework.findByPk(req.params.id);
    if (!hw) return res.status(404).send("Homework not found");

    await hw.update(req.body);
    res.status(200).send(hw);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const deleteHomework = async (req, res) => {
  try {
    const hw = await Homework.findByPk(req.params.id);
    if (!hw) return res.status(404).send("Homework not found");

    const hwData = hw.toJSON();
    await hw.destroy();
    res.status(200).send(hwData);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
