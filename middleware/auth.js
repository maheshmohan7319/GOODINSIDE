const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ status: false, error: 'Access denied. Token is missing.' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ status: false, error: 'Token expired. Please log in again.' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({ status: false, error: 'Token not verified.' });
        }
        return res.status(400).json({ status: false, error: 'Token error.' });
    }
};

const verifyOptionalToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return next();
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ status: false, error: 'Token expired. Please log in again.' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({ status: false, error: 'Token not verified.' });
        }
        return res.status(400).json({ status: false, error: 'Token error.' });
    }
};


const checkAdmin = (req, res, next) => {
    if (req.user.user.role !== 'Admin') {
        return res.status(403).json({ status: false, error: 'Access denied. Admins only' });
    }
    next();
};

module.exports = { verifyToken,checkAdmin,verifyOptionalToken };
