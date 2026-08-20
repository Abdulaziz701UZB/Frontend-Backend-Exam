import { Homework } from "../models/index.js";

export const createHomework = async (req, res) => {
  try {
    const newHwData = {
      id: req.body.id || `HW-${Math.floor(10 + Math.random() * 90)}`,
      group_name: req.body.group_name || req.body.groupName || "",
      title: req.body.title || "",
      deadline: req.body.deadline || new Date().toISOString().split("T")[0],
      total_submitted: req.body.total_submitted !== undefined ? req.body.total_submitted : req.body.totalSubmitted || 0,
      status: req.body.status || "Active",
    };
    const hw = await Homework.create(newHwData);
    res.status(201).json(hw);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getHomework = async (req, res) => {
  try {
    const hwList = await Homework.findAll({ order: [["deadline", "DESC"]] });
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

    const updateData = {
      group_name: req.body.group_name || req.body.groupName || hw.group_name,
      title: req.body.title || hw.title,
      deadline: req.body.deadline || hw.deadline,
      total_submitted: req.body.total_submitted !== undefined ? req.body.total_submitted : req.body.totalSubmitted !== undefined ? req.body.totalSubmitted : hw.total_submitted,
      status: req.body.status || hw.status,
    };

    await hw.update(updateData);
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
