import Joi from "joi";

export const validateCourse = (course) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    duration: Joi.string().allow("", null).optional(),
    price: Joi.number().precision(2).required(),
    description: Joi.string().allow("", null).optional(),
  });

  return schema.validate(course);
};
