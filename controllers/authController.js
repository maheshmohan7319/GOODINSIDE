const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');


const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'GOODINSIDE/profile',
        format: async (req, file) => 'jpg', 
        public_id: (req, file) => Date.now() + '-' + file.originalname.split('.')[0],
    },
});

const upload = multer({ storage });

exports.register = async (req, res) => {
    const { phoneNumber, password, role } = req.body;

    try {
        let user = await User.findOne({ phoneNumber });
        if (user) {
            return res.status(400).json({ status : false, message: 'User already exists' });
        }

        user = new User({
            phoneNumber,
            password,
            role
        });

        await user.save();

        const payload = {
            user: {
                id: user.id,
                role:user.role,
            },
        };

        jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '1h',
        }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ status : false, message: 'Internal server error' });
    }
};

exports.login = async (req, res) => {
    const { phoneNumber, password } = req.body;

    try {
        let user = await User.findOne({ phoneNumber });

        if (!user) {
            return res.status(400).json({status : false, message: 'User not exist!' });
        }


        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({status : false, message: 'Incorrect password' });
        }

        const payload = {
            user: {
                id: user.id,
                role:user.role,
            },
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1D' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ status : false, message: 'Internal server error' });
    }
};

exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
  
    if (!currentPassword || !newPassword) {
      return res.status(400).json({status:false, message: 'Please provide both current and new passwords.' });
    }
  
    try {
      const user = await User.findById(req.user.user.id);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      const isMatch = await user.matchPassword(currentPassword);
  
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect.' });
      }
  
      user.password = newPassword;
      await user.save();
  
      res.status(200).json({ message: 'Password changed successfully.' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
};

exports.updateProfile = [
    upload.single('image'), 
    async (req, res) => {
        const { email, name } = req.body;

        try {
            const user = await User.findById(req.user.user.id);

            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }

            if (email) user.email = email;
            if (name) user.name = name;

            if (req.file) {
                // Upload new image to Cloudinary
                const result = await cloudinary.uploader.upload(req.file.path);

                // Delete the previous image from Cloudinary if it exists
                if (user.image) {
                    const publicId = user.image.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(publicId);
                }

                // Update user profile with new image URL
                user.image = result.secure_url;
            }

            await user.save();

            res.status(200).json({ message: 'User profile updated successfully.', user });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    }
];

exports.getUser = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.user.id);

        if (!currentUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (currentUser.role === 'Admin') {
            const users = await User.find().select('-password'); 
            return res.json(users);
        } else {     
            const user = await User.findById(req.user.user.id).select('-password');
            return res.json(user);
        }
    } catch (err) {
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};