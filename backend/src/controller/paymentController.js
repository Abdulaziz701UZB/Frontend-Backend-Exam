import { Payment, Student } from "../models/index.js";
import { validatePayment } from "../validation/paymentValidation.js";
import { Op } from "sequelize";

export const createPayment = async (req, res) => {
  const { error } = validatePayment(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const newPaymentData = {
      id: req.body.id || `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
      student_id: req.body.student_id || req.body.studentId || null,
      student_name: req.body.student_name || req.body.studentName || "",
      group_name: req.body.group_name || req.body.groupName || "",
      amount: req.body.amount,
      month: req.body.month,
      payment_method: req.body.payment_method || req.body.paymentMethod || "Card (Click)",
      date: req.body.date || new Date().toISOString().split("T")[0],
      recorded_by: req.body.recorded_by || req.body.recordedBy || "Admin",
    };
    const payment = await Payment.create(newPaymentData);
    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      order: [["date", "DESC"], ["id", "DESC"]],
      include: [{ model: Student, as: "student" }],
    });
    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id, {
      include: [{ model: Student, as: "student" }],
    });
    if (!payment) return res.status(404).json({ error: "To'lov kvitansiyasi topilmadi" });
    res.status(200).json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updatePayment = async (req, res) => {
  const { error } = validatePayment(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ error: "To'lov kvitansiyasi topilmadi" });

    const updateData = {
      student_name: req.body.student_name || req.body.studentName || payment.student_name,
      amount: req.body.amount !== undefined ? req.body.amount : payment.amount,
      month: req.body.month || payment.month,
      payment_method: req.body.payment_method || req.body.paymentMethod || payment.payment_method,
      date: req.body.date || payment.date,
    };

    await payment.update(updateData);
    res.status(200).json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ error: "To'lov kvitansiyasi topilmadi" });

    await payment.destroy();
    res.status(200).json({ message: "To'lov kvitansiyasi o'chirildi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const searchPayments = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Qidiruv so'rovi kiritilishi shart" });
    }

    const payments = await Payment.findAll({
      where: {
        [Op.or]: [
          { student_name: { [Op.iLike]: `%${query}%` } },
          { id: { [Op.iLike]: `%${query}%` } },
          { payment_method: { [Op.iLike]: `%${query}%` } },
        ],
      },
    });

    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
