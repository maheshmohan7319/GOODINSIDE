
const Address = require('../models/Address');


exports.createAddress = async (req, res) => {
    try {
        const userId = req.user.user.id; 
        const { name, latitude, longitude } = req.body;

        const userAddresses = await Address.find({ userId });

        if (userAddresses.length >= 3) {
            return res.status(400).json({ status: false, message: 'You cannot add more than three addresses.' });
        }

        const isDefault = userAddresses.length === 0 ? true : false;
    
        const existingNameAddress = await Address.findOne({ 
            userId,
            name
        });

        if (existingNameAddress) {
            return res.status(400).json({ status: false, message: 'An address with the same name already exists.' });
        }

        const existingLocationAddress = await Address.findOne({ 
            userId,
            latitude,
            longitude
        });

        if (existingLocationAddress) {
            return res.status(400).json({ status: false, message: 'An address with the same latitude and longitude already exists.' });
        }

  
       

        const newAddress = new Address({
            ...req.body,
            userId, 
            isDefault
        });

        const savedAddress = await newAddress.save();
        res.status(201).json(savedAddress);
    } catch (err) {
        res.status(400).json({ status: false, message: err.message });
    }
};


exports.getAddressesByUserId = async (req, res) => {
    try {
        const userId = req.user.user.id; 
        const addresses = await Address.find({ userId });
        res.json(addresses);
    } catch (err) {
        res.status(500).json({status: false, message: err.message });
    }
};

exports.getAddressById = async (req, res) => {
    try {
        const address = await Address.findById(req.params.id);
        if (!address) return res.status(404).json({status: false, message: 'Address not found' });
        res.json(address);
    } catch (err) {
        res.status(500).json({status: false, message: err.message });
    }
};


exports.updateAddress = async (req, res) => {
    try {
        const address = await Address.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!address) return res.status(404).json({status: false, message: 'Address not found' });
        res.json(address);
    } catch (err) {
        res.status(400).json({status: false, message: err.message });
    }
};

exports.updateIsDefaultAddress = async (req, res) => {
    const userId = req.user.user.id; 

    try {
        const address = await Address.findById(req.params.id);
        if (!address) return res.status(404).json({ status: false, message: 'Address not found' });

        if (!address.isDefault) {
            await Address.updateMany(
                { userId, _id: { $ne: req.params.id } },
                { isDefault: false }
            );

            req.body.isDefault = true;
        }

        const updatedAddress = await Address.findByIdAndUpdate(req.params.id, req.body, { new: true });

        res.json({ status: true, message: 'Address updated successfully', address: updatedAddress });
    } catch (err) {
        console.error(err);
        res.status(400).json({ status: false, message: err.message });
    }
};


exports.deleteAddress = async (req, res) => {
    try {
        const address = await Address.findByIdAndDelete(req.params.id);
        if (!address) return res.status(404).json({status: false, message: 'Address not found' });
        res.json({ message: 'Address deleted successfully' });
    } catch (err) {
        res.status(500).json({status: false, message: err.message });
    }
};