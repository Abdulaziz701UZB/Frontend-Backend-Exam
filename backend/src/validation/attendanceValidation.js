import Joi from "joi";

export const validateAttendance = (attendance) => {
  const schema = Joi.object({
    id: Joi.number().integer().optional(),
    group_id: Joi.string().required(),
    student_id: Joi.number().integer().required(),
    date: Joi.string().required(),
    status: Joi.string().optional(),
    note: Joi.string().optional().allow(""),
    reason_category: Joi.string().optional().allow(""),
  });

  return schema.validate(attendance);
};

export default { validateAttendance };
