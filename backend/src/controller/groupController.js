import { Group, Course, Teacher } from "../models/index.js";
import { validateGroup } from "../validation/groupValidation.js";
import { Op } from "sequelize";

export const createGroup = async (req, res) => {
  const { error } = validateGroup(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const newGroupData = {
      ...req.body,
      id: req.body.id || `G-${Math.floor(100 + Math.random() * 900)}`,
    };
    const group = await Group.create(newGroupData);
    const result = await Group.findByPk(group.id, {
      include: [
        { model: Course, as: "course" },
        { model: Teacher, as: "teacher" },
      ],
    });
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const getGroups = async (req, res) => {
  try {
    const groups = await Group.findAll({
      include: [
        { model: Course, as: "course" },
        { model: Teacher, as: "teacher" },
      ],
    });
    res.status(200).send(groups);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const getGroupById = async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id, {
      include: [
        { model: Course, as: "course" },
        { model: Teacher, as: "teacher" },
      ],
    });
    if (!group) return res.status(404).send("Group not found");
    res.status(200).send(group);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const updateGroup = async (req, res) => {
  const { error } = validateGroup(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const group = await Group.findByPk(req.params.id);
    if (!group) return res.status(404).send("Group not found");

    await group.update(req.body);
    const updatedGroup = await Group.findByPk(req.params.id, {
      include: [
        { model: Course, as: "course" },
        { model: Teacher, as: "teacher" },
      ],
    });
    res.status(200).send(updatedGroup);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id, {
      include: [
        { model: Course, as: "course" },
        { model: Teacher, as: "teacher" },
      ],
    });
    if (!group) return res.status(404).send("Group not found");

    const groupData = group.toJSON();
    await group.destroy();
    res.status(200).send(groupData);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const searchGroups = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).send("Search query is required");
    }

    const groups = await Group.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { room: { [Op.iLike]: `%${query}%` } },
          { course_name: { [Op.iLike]: `%${query}%` } },
          { teacher_name: { [Op.iLike]: `%${query}%` } },
        ],
      },
      include: [
        { model: Course, as: "course" },
        { model: Teacher, as: "teacher" },
      ],
    });

    res.status(200).send(groups);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
