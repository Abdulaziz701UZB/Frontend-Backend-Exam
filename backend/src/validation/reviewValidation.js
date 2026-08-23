import Joi from "joi";

export const validateReview = (review) => {
  const schema = Joi.object({
    id: Joi.number().integer().optional().allow(null),
    student_id: Joi.number().integer().optional().allow(null),
    studentId: Joi.number().integer().optional().allow(null),
    student_name: Joi.string().optional(),
    studentName: Joi.string().optional(),
    teacher_name: Joi.string().optional(),
    teacherName: Joi.string().optional(),
    group_name: Joi.string().optional().allow(""),
    groupName: Joi.string().optional().allow(""),
    rating: Joi.number().min(1).max(10).required(),
    category: Joi.string().optional(),
    comment: Joi.string().required(),
    status: Joi.string().optional(),
    date: Joi.string().optional(),
  }).unknown(true);

  return schema.validate(review);
};

export default { validateReview };
