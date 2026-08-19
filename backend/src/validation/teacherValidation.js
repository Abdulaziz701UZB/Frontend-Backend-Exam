import Joi from "joi";

export const validateTeacher = (teacher) => {
  const schema = Joi.object({
    id: Joi.number().integer().optional(),
    name: Joi.string().required(),
    phone: Joi.string().required(),
    subject: Joi.string().required(),
    salary: Joi.number().optional(),
    experience: Joi.string().optional().allow(""),
    avatar: Joi.string().optional(),
  });

  return schema.validate(teacher);
};

export default { validateTeacher };
