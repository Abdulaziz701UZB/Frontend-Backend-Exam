import Joi from "joi";

export const validateLead = (lead) => {
  const schema = Joi.object({
    id: Joi.string().optional(),
    name: Joi.string().required(),
    phone: Joi.string().required(),
    interested_course: Joi.string().optional().allow(""),
    source: Joi.string().optional().allow(""),
    status: Joi.string().optional(),
  });

  return schema.validate(lead);
};

export default { validateLead };
