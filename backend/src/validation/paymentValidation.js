import Joi from "joi";

export const validatePayment = (payment) => {
  const schema = Joi.object({
    id: Joi.string().optional().allow(""),
    student_id: Joi.number().integer().optional().allow(null),
    studentId: Joi.number().integer().optional().allow(null),
    student_name: Joi.string().optional(),
    studentName: Joi.string().optional(),
    group_name: Joi.string().optional().allow(""),
    groupName: Joi.string().optional().allow(""),
    amount: Joi.number().required(),
    month: Joi.string().required(),
    payment_method: Joi.string().optional(),
    paymentMethod: Joi.string().optional(),
    date: Joi.string().optional(),
    recorded_by: Joi.string().optional(),
    recordedBy: Joi.string().optional(),
  }).unknown(true);

  return schema.validate(payment);
};

export default { validatePayment };
