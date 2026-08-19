import Joi from "joi";

export const validateGroup = (group) => {
  const schema = Joi.object({
    id: Joi.string().optional().allow(""),
    course_id: Joi.number().integer().optional().allow(null),
    course_name: Joi.string().optional().allow(""),
    name: Joi.string().required(),
    teacher_id: Joi.number().integer().optional().allow(null),
    teacher_name: Joi.string().optional().allow(""),
    room: Joi.string().required(),
    schedule_days: Joi.string().required(),
    schedule_time: Joi.string().required(),
    monthly_fee: Joi.number().required(),
    status: Joi.string().optional(),
    start_date: Joi.string().optional(),
  });

  return schema.validate(group);
};

export default { validateGroup };
