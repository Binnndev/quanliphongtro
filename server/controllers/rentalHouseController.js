const { Landlord, RentalHouse } = require('../models'); // Assuming you have a House model

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

exports.getHouseByLandlord = async (req, res) => {
    const landlordUserId = req.params.landlordId; // This is the MaTK from the User account

    if (!landlordUserId) {
        // Send 400 Bad Request if the ID is missing from the URL parameter
        return res.status(400).json({ message: "Thiếu ID của chủ trọ (MaTK)." });
    }

    try {
        // 1. Find the Landlord record using MaTK to get MaChuTro
        const landlord = await Landlord.findOne({
            where: { MaTK: landlordUserId },
            attributes: ['MaChuTro'], // Only need the MaChuTro field
        });

        // If no landlord record found for the given MaTK
        if (!landlord) {
            console.log(`Không tìm thấy chủ trọ (Landlord) với MaTK: ${landlordUserId}`);
            // Return 200 OK with an empty array, consistent with previous logic
            return res.status(200).json([]);
        }

        const landlordMaChuTro = landlord.MaChuTro; // Extract the actual landlord ID (MaChuTro)

        // 2. Find all RentalHouses associated with this MaChuTro
        const houses = await RentalHouse.findAll({
            where: {
                MaChuTro: landlordMaChuTro, // Filter by the correct landlord foreign key
            },
             order: [
                // Optional: Add default ordering if desired, e.g., by name or ID
                 ['TenNhaTro', 'ASC']
             ],
             // attributes: ['MaNhaTro', 'TenNhaTro', 'DiaChi'] // Optional: Select only specific fields
        });

        // findAll returns an array ([] if no matches found)
        // Send the array of houses (or empty array) with 200 OK status
        res.status(200).json(houses);

    } catch (error) {
        // Log the detailed error on the server for debugging
        console.error(`Error fetching houses for landlord MaTK ${landlordUserId}:`, error);
        // Send a generic 500 Internal Server Error response to the client
        res.status(500).json({ message: "Lỗi máy chủ xảy ra khi lấy danh sách nhà trọ." });
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
