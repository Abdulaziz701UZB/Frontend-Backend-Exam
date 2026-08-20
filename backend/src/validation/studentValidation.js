import Joi from "joi";

export const validateStudent = (student) => {
  const schema = Joi.object({
    id: Joi.number().integer().optional().allow(null),
    full_name: Joi.string().optional(),
    fullName: Joi.string().optional(),
    phone: Joi.string().required(),
    parent_phone: Joi.string().optional().allow(""),
    parentPhone: Joi.string().optional().allow(""),
    group_id: Joi.string().optional().allow(null, ""),
    groupId: Joi.string().optional().allow(null, ""),
    group_name: Joi.string().optional().allow(""),
    groupName: Joi.string().optional().allow(""),
    join_date: Joi.string().optional(),
    joinDate: Joi.string().optional(),
    payment_status: Joi.string().optional(),
    paymentStatus: Joi.string().optional(),
    balance: Joi.number().optional(),
    status: Joi.string().optional(),
  }).unknown(true);

  return schema.validate(student);
};

export default { validateStudent };
