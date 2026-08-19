import Joi from "joi";

export const validateRoom = (room) => {
  const schema = Joi.object({
    id: Joi.string().optional(),
    name: Joi.string().required(),
    capacity: Joi.number().integer().required(),
    computers_count: Joi.number().integer().optional(),
    projector: Joi.string().optional(),
    status: Joi.string().optional(),
  });

  return schema.validate(room);
};

export default { validateRoom };
