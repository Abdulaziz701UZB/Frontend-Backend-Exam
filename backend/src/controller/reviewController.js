import { Review, sequelize } from "../models/index.js";
import { validateReview } from "../validation/reviewValidation.js";

export const createReview = async (req, res) => {
  const { error } = validateReview(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const payload = {
      student_id: req.body.student_id || req.body.studentId || null,
      student_name: req.body.student_name || req.body.studentName || "Anonim O'quvchi",
      teacher_name: req.body.teacher_name || req.body.teacherName || "Bosh O'qituvchi",
      group_name: req.body.group_name || req.body.groupName || "",
      rating: parseInt(req.body.rating),
      category: req.body.category || "O'qitish sifati",
      comment: req.body.comment,
      status: req.body.status || "Yangi",
      date: req.body.date || new Date().toISOString().split("T")[0],
    };

    let review;
    try {
      review = await Review.create(payload);
    } catch (createErr) {
      if (createErr.name === "SequelizeUniqueConstraintError") {
        await sequelize.query(
          "SELECT setval(pg_get_serial_sequence('reviews', 'id'), COALESCE((SELECT MAX(id) FROM reviews), 1));"
        );
        review = await Review.create(payload);
      } else {
        throw createErr;
      }
    }

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({ order: [["date", "DESC"], ["id", "DESC"]] });
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getReviewById = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ error: "Fikr-mulohaza topilmadi" });
    res.status(200).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ error: "Fikr-mulohaza topilmadi" });

    const updateData = {
      status: req.body.status || review.status,
      category: req.body.category || review.category,
      comment: req.body.comment || review.comment,
      rating: req.body.rating ? parseInt(req.body.rating) : review.rating,
    };

    await review.update(updateData);
    res.status(200).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ error: "Fikr-mulohaza topilmadi" });

    await review.destroy();
    res.status(200).json({ message: "Fikr-mulohaza muvaffaqiyatli o'chirildi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
