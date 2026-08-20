import { Lead } from "../models/index.js";

export const createLead = async (req, res) => {
  try {
    const newLeadData = {
      id: req.body.id || `L-${Math.floor(500 + Math.random() * 900)}`,
      name: req.body.name,
      phone: req.body.phone,
      interested_course: req.body.interested_course || req.body.interestedCourse || "",
      source: req.body.source || "Instagram Ads",
      status: req.body.status || "Yangi",
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

    const updateData = {
      name: req.body.name || lead.name,
      phone: req.body.phone || lead.phone,
      interested_course: req.body.interested_course || req.body.interestedCourse || lead.interested_course,
      source: req.body.source || lead.source,
      status: req.body.status || lead.status,
    };

    await lead.update(updateData);
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
