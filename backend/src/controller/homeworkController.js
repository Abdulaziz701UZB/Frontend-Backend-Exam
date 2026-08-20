import { Homework } from "../models/index.js";

export const createHomework = async (req, res) => {
  try {
    const newHwData = {
      ...req.body,
      id: req.body.id || `HW-${Math.floor(10 + Math.random() * 90)}`,
    };
    const hw = await Homework.create(newHwData);
    res.status(201).json(hw);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getHomework = async (req, res) => {
  try {
    const hwList = await Homework.findAll({ order: [["id", "ASC"]] });
    res.status(200).json(hwList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getHomeworkById = async (req, res) => {
  try {
    const hw = await Homework.findByPk(req.params.id);
    if (!hw) return res.status(404).json({ error: "Uyga vazifa topilmadi" });
    res.status(200).json(hw);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateHomework = async (req, res) => {
  try {
    const hw = await Homework.findByPk(req.params.id);
    if (!hw) return res.status(404).json({ error: "Uyga vazifa topilmadi" });

    await hw.update(req.body);
    res.status(200).json(hw);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteHomework = async (req, res) => {
  try {
    const hw = await Homework.findByPk(req.params.id);
    if (!hw) return res.status(404).json({ error: "Uyga vazifa topilmadi" });

    await hw.destroy();
    res.status(200).json({ message: "Uyga vazifa o'chirildi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
