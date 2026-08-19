import { Lead } from "../models/index.js";

export const createLead = async (req, res) => {
  try {
    const newLeadData = {
      ...req.body,
      id: req.body.id || `L-${Math.floor(500 + Math.random() * 900)}`,
    };
    const lead = await Lead.create(newLeadData);
    res.status(201).send(lead);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const getLeads = async (req, res) => {
  try {
    const leads = await Lead.findAll();
    res.status(200).send(leads);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).send("Lead not found");

    await lead.update(req.body);
    res.status(200).send(lead);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).send("Lead not found");

    const leadData = lead.toJSON();
    await lead.destroy();
    res.status(200).send(leadData);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
