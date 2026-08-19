import Joi from "joi";

export const validateCertificate = (certificate) => {
  const schema = Joi.object({
    id: Joi.string().optional(),
    student_name: Joi.string().required(),
    course_name: Joi.string().required(),
    issue_date: Joi.string().optional(),
    qr_code: Joi.string().optional(),
    grade: Joi.string().optional(),
  });

  return schema.validate(certificate);
};

export default { validateCertificate };
