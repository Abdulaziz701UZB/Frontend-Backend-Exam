import { Room } from "../models/index.js";

export const createRoom = async (req, res) => {
  try {
    const newRoomData = {
      ...req.body,
      id: req.body.id || `R-${Math.floor(100 + Math.random() * 900)}`,
    };
    const room = await Room.create(newRoomData);
    res.status(201).send(room);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll();
    res.status(200).send(rooms);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const updateRoom = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).send("Room not found");

    await room.update(req.body);
    res.status(200).send(room);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).send("Room not found");

    const roomData = room.toJSON();
    await room.destroy();
    res.status(200).send(roomData);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
