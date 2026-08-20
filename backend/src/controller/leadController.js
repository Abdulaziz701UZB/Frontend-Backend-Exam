import { Lead } from "../models/index.js";

export const createLead = async (req, res) => {
  try {
    const newLeadData = {
      ...req.body,
      id: req.body.id || `L-${Math.floor(500 + Math.random() * 900)}`,
    };
    const lead = await Lead.create(newLeadData);
    res.status(201).json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getLeads = async (req, res) => {
  try {
    const leads = await Lead.findAll({ order: [["id", "ASC"]] });
    res.status(200).json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ error: "Lid topilmadi" });
    res.status(200).json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ error: "Lid topilmadi" });

    await lead.update(req.body);
    res.status(200).json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ error: "Lid topilmadi" });

    await lead.destroy();
    res.status(200).json({ message: "Lid o'chirildi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
