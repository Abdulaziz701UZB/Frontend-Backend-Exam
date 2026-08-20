import Joi from "joi";

export const validateAttendance = (attendance) => {
  const schema = Joi.object({
    id: Joi.number().integer().optional().allow(null),
    group_id: Joi.string().optional(),
    groupId: Joi.string().optional(),
    student_id: Joi.number().integer().optional(),
    studentId: Joi.number().integer().optional(),
    date: Joi.string().optional(),
    status: Joi.string().optional(),
    note: Joi.string().optional().allow(""),
    reason_category: Joi.string().optional().allow(""),
    reasonCategory: Joi.string().optional().allow(""),
  }).unknown(true);

  return schema.validate(attendance);
};

export default { validateAttendance };
