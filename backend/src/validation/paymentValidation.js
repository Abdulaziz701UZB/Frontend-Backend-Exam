import Joi from "joi";

export const validatePayment = (payment) => {
  const schema = Joi.object({
    id: Joi.string().optional(),
    student_id: Joi.number().integer().optional().allow(null),
    student_name: Joi.string().required(),
    group_name: Joi.string().optional().allow(""),
    amount: Joi.number().required(),
    month: Joi.string().required(),
    payment_method: Joi.string().required(),
    date: Joi.string().optional(),
    recorded_by: Joi.string().optional(),
  });

  return schema.validate(payment);
};

export default { validatePayment };
