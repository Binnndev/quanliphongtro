const { Room } = require("../models");
const { Op } = require("sequelize");

exports.getRooms = async (req, res) => {
  try {
    // Lấy tham số query: status (vacant, rented) và search (tìm kiếm theo title)
    const { status, search } = req.query;
    let filter = {};
    if (status) {
      filter.status = status;
    }
    if (search) {
      filter.title = { [Op.like]: `%${search}%` };
    }
    const rooms = await Room.findAll({ where: filter });
    res.status(200).json(rooms);
  } catch (error) {
    console.error("Error retrieving rooms:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    res.status(200).json(room);
  } catch (error) {
    console.error("Error retrieving room:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const { title, description, price, status, amenities } = req.body;
    let imageUrl = null;
    // Nếu có file upload (ảnh phòng)
    if (req.file) {
      imageUrl = req.file.path;
    }
    const newRoom = await Room.create({
      title,
      description,
      price,
      status: status || "vacant",
      imageUrl,
      amenities,
    });
    res.status(201).json(newRoom);
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, status, amenities } = req.body;
    const room = await Room.findByPk(id);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    let imageUrl = room.imageUrl;
    if (req.file) {
      imageUrl = req.file.path;
    }
    await room.update({
      title: title || room.title,
      description: description || room.description,
      price: price || room.price,
      status: status || room.status,
      imageUrl,
      amenities: amenities || room.amenities,
    });
    res.status(200).json(room);
  } catch (error) {
    console.error("Error updating room:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findByPk(id);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    await room.destroy();
    res.status(200).json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
