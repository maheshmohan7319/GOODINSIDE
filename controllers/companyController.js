const Company = require('../models/Company');


exports.createOrUpdateCompany = async (req, res) => {
    try {
        const { companyName, address, latitude, longitude } = req.body;

        const company = await Company.findOne(); 

        if (company) {
            company.companyName = companyName;
            company.address = address;
            company.latitude = latitude;
            company.longitude = longitude;

            await company.save();

            return res.status(200).json({
                status: true,
                message: 'Company information updated successfully',
                company
            });
        } else {
            const newCompany = new Company({
                companyName,
                address,
                latitude,
                longitude
            });

            await newCompany.save();

            return res.status(201).json({
                status: true,
                message: 'Company information saved successfully',
                company: newCompany
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            message: 'Internal server error'
        });
    }
};