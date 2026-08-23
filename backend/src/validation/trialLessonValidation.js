import Joi from "joi";

export const validateTrialLesson = (trialLesson) => {
  const schema = Joi.object({
    id: Joi.number().integer().optional().allow(null),
    student_name: Joi.string().optional(),
    studentName: Joi.string().optional(),
    phone: Joi.string().required(),
    teacher_name: Joi.string().optional(),
    teacherName: Joi.string().optional(),
    course_name: Joi.string().optional(),
    courseName: Joi.string().optional(),
    date: Joi.string().required(),
    time: Joi.string().required(),
    room: Joi.string().optional().allow(""),
    status: Joi.string().optional(),
    notes: Joi.string().optional().allow(""),
  }).unknown(true);

  return schema.validate(trialLesson);
};

export default { validateTrialLesson };
