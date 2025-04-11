const RentalHouse = require('../models/RentalHouse'); // Assuming you have a House model

exports.getAllHouses = async (req, res) => {
    try {
        const houses = await RentalHouse.find();
        res.status(200).json(houses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching houses', error });
    }
};

exports.getHouseById = async (req, res) => {
    try {
        const house = await RentalHouse.findById(req.params.id);
        if (!house) {
            return res.status(404).json({ message: 'House not found' });
        }
        res.status(200).json(house);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching house', error });
    }
};

exports.getHouseByName = async (req, res) => {
    try {
        const house = await RentalHouse.findOne({ name: req.params.name });
        if (!house) {
            return res.status(404).json({ message: 'House not found' });
        }
        res.status(200).json(house);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching house', error });
    }
};


exports.createHouse = async (req, res) => {
    try {
        const newHouse = new RentalHouse(req.body);
        const savedHouse = await newHouse.save();
        res.status(201).json(savedHouse);
    } catch (error) {
        res.status(500).json({ message: 'Error creating house', error });
    }
};

exports.updateHouse = async (req, res) => {
    try {
        const updatedHouse = await RentalHouse.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedHouse) {
            return res.status(404).json({ message: 'House not found' });
        }
        res.status(200).json(updatedHouse);
    } catch (error) {
        res.status(500).json({ message: 'Error updating house', error });
    }
};

exports.deleteHouse = async (req, res) => {
    try {
        const deletedHouse = await RentalHouse.findByIdAndDelete(req.params.id);
        if (!deletedHouse) {
            return res.status(404).json({ message: 'House not found' });
        }
        res.status(200).json({ message: 'House deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting house', error });
    }
};
