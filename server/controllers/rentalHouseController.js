const { RentalHouse } = require("../models");

exports.getAllHouses = async (req, res) => {
  try {
    const houses = await RentalHouse.findAll();
    res.status(200).json(houses);
  } catch (error) {
    console.error("Lỗi lấy danh sách nhà trọ:", error);
    res.status(500).json({ message: "Lỗi server", error });
  }
};

exports.getHouseById = async (req, res) => {
  try {
    const house = await RentalHouse.findByPk(req.params.id);
    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }
    res.status(200).json(house);
  } catch (error) {
    res.status(500).json({ message: "Error fetching house", error });
  }
};

exports.getHouseByName = async (req, res) => {
  try {
    const house = await RentalHouse.findOne({
      where: { TenNhaTro: req.params.name },
    });
    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }
    res.status(200).json(house);
  } catch (error) {
    res.status(500).json({ message: "Error fetching house", error });
  }
};

exports.createHouse = async (req, res) => {
  try {
    const newHouse = await RentalHouse.create(req.body);
    res.status(201).json(newHouse);
  } catch (error) {
    res.status(500).json({ message: "Error creating house", error });
  }
};

exports.updateHouse = async (req, res) => {
  try {
    const [updatedCount] = await RentalHouse.update(req.body, {
      where: { id: req.params.id },
    });

    if (!updatedCount) {
      return res.status(404).json({ message: "House not found" });
    }

    const updatedHouse = await RentalHouse.findByPk(req.params.id);
    res.status(200).json(updatedHouse);
  } catch (error) {
    res.status(500).json({ message: "Error updating house", error });
  }
};

exports.deleteHouse = async (req, res) => {
  try {
    const deletedCount = await RentalHouse.destroy({
      where: { id: req.params.id },
    });

    if (!deletedCount) {
      return res.status(404).json({ message: "House not found" });
    }

    res.status(200).json({ message: "House deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting house", error });
  }
};
