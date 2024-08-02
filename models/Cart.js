const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
    }
});

const CartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [CartItemSchema],
    deliveryCharge: {
        type: Number,
        default: 0,
    },
    distance: {
        type: Number,
        default: 0,
    }
}, { timestamps: true });

const Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart;