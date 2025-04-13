const { RoomType } = require("../models");

exports.getAllRoomTypes = async (req, res) => {
    try {
        const roomTypes = await RoomType.findAll();
        res.status(200).json(roomTypes);
    } catch (error) {
        console.error("Error retrieving room types:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}