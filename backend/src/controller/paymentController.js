import { Payment, Student } from "../models/index.js";
import { Op } from "sequelize";

export const createPayment = async (req, res) => {
  try {
    const newPaymentData = {
      ...req.body,
      id: req.body.id || `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    const payment = await Payment.create(newPaymentData);
    const result = await Payment.findByPk(payment.id, {
      include: [{ model: Student, as: "student" }],
    });
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [{ model: Student, as: "student" }],
    });
    res.status(200).send(payments);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id, {
      include: [{ model: Student, as: "student" }],
    });
    if (!payment) return res.status(404).send("Payment not found");
    res.status(200).send(payment);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).send("Payment not found");

    await payment.update(req.body);
    const updatedPayment = await Payment.findByPk(req.params.id, {
      include: [{ model: Student, as: "student" }],
    });
    res.status(200).send(updatedPayment);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id, {
      include: [{ model: Student, as: "student" }],
    });
    if (!payment) return res.status(404).send("Payment not found");

    const paymentData = payment.toJSON();
    await payment.destroy();
    res.status(200).send(paymentData);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const searchPayments = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).send("Search query is required");

    const payments = await Payment.findAll({
      where: {
        [Op.or]: [
          { student_name: { [Op.iLike]: `%${query}%` } },
          { group_name: { [Op.iLike]: `%${query}%` } },
          { month: { [Op.iLike]: `%${query}%` } },
        ],
      },
      include: [{ model: Student, as: "student" }],
    });
    res.status(200).send(payments);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
