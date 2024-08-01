const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
    },
    salePrice: {
        type: Number,
        required: true,
    },
    offerPrice: {
        type: Number,
        required: true,
    },
    purchasePrice: {
        type: Number,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },
    image: {
        type: String,
    },
    isTaxInclusive: {
        type: Boolean,
        required: true,
    },
    taxPercentage: {
        type: Number,
        required: true,
    },
   
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
   
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
