import Joi from "joi";

export const validateHomework = (homework) => {
  const schema = Joi.object({
    id: Joi.string().optional(),
    group_name: Joi.string().required(),
    title: Joi.string().required(),
    deadline: Joi.string().required(),
    total_submitted: Joi.number().integer().optional(),
    status: Joi.string().optional(),
  });

  return schema.validate(homework);
};

export default { validateHomework };
