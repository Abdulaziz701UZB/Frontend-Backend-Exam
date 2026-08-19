import Joi from "joi";

export const validateExam = (exam) => {
  const schema = Joi.object({
    id: Joi.string().optional(),
    group_name: Joi.string().required(),
    title: Joi.string().required(),
    date: Joi.string().required(),
    total_score: Joi.number().integer().optional(),
    max_passing_score: Joi.number().integer().optional(),
    status: Joi.string().optional(),
  });

  return schema.validate(exam);
};

export default { validateExam };
