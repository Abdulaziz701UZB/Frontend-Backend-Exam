import Joi from "joi";

export const validateGroup = (group) => {
  const schema = Joi.object({
    id: Joi.string().optional().allow(""),
    course_id: Joi.number().integer().optional().allow(null),
    courseId: Joi.number().integer().optional().allow(null),
    course_name: Joi.string().optional().allow(""),
    courseName: Joi.string().optional().allow(""),
    name: Joi.string().required(),
    teacher_id: Joi.number().integer().optional().allow(null),
    teacherId: Joi.number().integer().optional().allow(null),
    teacher_name: Joi.string().optional().allow(""),
    teacherName: Joi.string().optional().allow(""),
    room: Joi.string().required(),
    schedule_days: Joi.string().optional(),
    scheduleDays: Joi.string().optional(),
    schedule_time: Joi.string().optional(),
    scheduleTime: Joi.string().optional(),
    monthly_fee: Joi.number().optional(),
    monthlyFee: Joi.number().optional(),
    status: Joi.string().optional(),
    start_date: Joi.string().optional(),
    startDate: Joi.string().optional(),
  }).unknown(true);

  return schema.validate(group);
};

export default { validateGroup };
