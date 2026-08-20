import { Room } from "../models/index.js";

export const createRoom = async (req, res) => {
  try {
    const newRoomData = {
      ...req.body,
      id: req.body.id || `R-${Math.floor(100 + Math.random() * 900)}`,
    };
    const room = await Room.create(newRoomData);
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll({ order: [["id", "ASC"]] });
    res.status(200).json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ error: "Xona topilmadi" });
    res.status(200).json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ error: "Xona topilmadi" });

    await room.update(req.body);
    res.status(200).json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ error: "Xona topilmadi" });

    await room.destroy();
    res.status(200).json({ message: "Xona o'chirildi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
