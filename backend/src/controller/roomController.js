import { Room, Group } from "../models/index.js";

export const createRoom = async (req, res) => {
  try {
    const newRoomData = {
      id: req.body.id || `R-${Math.floor(100 + Math.random() * 900)}`,
      name: req.body.name,
      capacity: req.body.capacity || 20,
      computers_count: req.body.computers_count !== undefined ? req.body.computers_count : req.body.computersCount || 0,
      projector: req.body.projector || "Mavjud",
      status: req.body.status || "Active",
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

    const updateData = {
      name: req.body.name || room.name,
      capacity: req.body.capacity !== undefined ? req.body.capacity : room.capacity,
      computers_count: req.body.computers_count !== undefined ? req.body.computers_count : req.body.computersCount !== undefined ? req.body.computersCount : room.computers_count,
      projector: req.body.projector || room.projector,
      status: req.body.status || room.status,
    };

    await room.update(updateData);
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

export const getRoomOccupancy = async (req, res) => {
  try {
    const [rooms, activeGroups] = await Promise.all([
      Room.findAll({ order: [["id", "ASC"]] }),
      Group.findAll({ where: { status: "Active" } }),
    ]);

    const standardTimeSlots = [
      "09:00 - 11:00",
      "11:00 - 13:00",
      "14:00 - 16:00",
      "16:00 - 18:00",
      "18:00 - 20:00",
    ];

    const standardDayPairs = [
      "Dushanba - Chorshanba - Juma",
      "Seshanba - Payshanba - Shanba",
    ];

    const totalSlotsPerRoom = standardTimeSlots.length * standardDayPairs.length;

    const occupancyData = rooms.map((room) => {
      const roomGroups = activeGroups.filter(
        (g) => (g.room || "").trim().toLowerCase() === (room.name || "").trim().toLowerCase()
      );

      const occupiedSlotsCount = roomGroups.length;
      const occupancyRate = Math.min(
        100,
        Math.round((occupiedSlotsCount / totalSlotsPerRoom) * 100)
      );

      const scheduleMatrix = [];
      standardDayPairs.forEach((days) => {
        standardTimeSlots.forEach((time) => {
          const assignedGroup = roomGroups.find(
            (g) =>
              (g.schedule_days || "").trim().toLowerCase() === days.toLowerCase() &&
              (g.schedule_time || "").trim().toLowerCase() === time.toLowerCase()
          );

          scheduleMatrix.push({
            days,
            time,
            isOccupied: !!assignedGroup,
            groupName: assignedGroup?.name || null,
            courseName: assignedGroup?.course_name || null,
            teacherName: assignedGroup?.teacher_name || null,
            groupId: assignedGroup?.id || null,
          });
        });
      });

      return {
        room: {
          id: room.id,
          name: room.name,
          capacity: room.capacity,
          computersCount: room.computers_count,
          projector: room.projector,
          status: room.status,
        },
        activeGroupsCount: roomGroups.length,
        occupancyRate,
        totalPossibleSlots: totalSlotsPerRoom,
        freeSlotsCount: Math.max(0, totalSlotsPerRoom - occupiedSlotsCount),
        scheduleMatrix,
        assignedGroups: roomGroups.map((g) => ({
          id: g.id,
          name: g.name,
          courseName: g.course_name,
          teacherName: g.teacher_name,
          scheduleDays: g.schedule_days,
          scheduleTime: g.schedule_time,
        })),
      };
    });

    res.status(200).json(occupancyData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
