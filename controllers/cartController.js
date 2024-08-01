const User = require('../models/User');
const Cart = require('../models/Cart');
const Product = require('../models/Product');



exports.addItemToCart = async (req, res) => {
    const { productId } = req.body;
    const userId = req.user.user.id;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ status: false, message: 'Product not found' });
        }

        const newItem = {
            productId,
            quantity: 1
        };

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [newItem] });
        } else {
            const existingItem = cart.items.find(item =>
                item.productId.equals(productId)
            );

            if (existingItem) {
                return res.status(400).json({ status: false, message: 'Item already exists in cart' });
            } else {
                cart.items.push(newItem);
            }
        }

        await cart.save();

        res.status(200).json({ status: true, message: 'Cart added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};

exports.getCart = async (req, res) => {
    const userId = req.user.user.id;

    try {
        const cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart) {
            return res.status(404).json({ status: false, message: 'Cart not found' });
        }

        let grossTotal = 0;
        let totalTaxAmount = 0;
        let totalSGST = 0;
        let totalCGST = 0;
        let netAmount = 0;

        const user = await User.findById(userId);

        const items = cart.items.map(item => {
            const product = item.productId;
            const itemTotal = product.offerPrice * item.quantity;
            const sgst = itemTotal * (product.taxPercentage / 2) / 100;
            const cgst = itemTotal * (product.taxPercentage / 2) / 100;

            netAmount += itemTotal;
            totalSGST += sgst;
            totalCGST += cgst;
            totalTaxAmount += sgst + cgst;

            return {
                productId: product._id,
                productName: product.name,
                quantity: item.quantity,
                itemTotal: itemTotal.toFixed(2),
                sgst: sgst.toFixed(2),
                cgst: cgst.toFixed(2),
                productImage: product.images && product.images.length > 0 ? product.images[0] : null,
                isFavorite: user.favorites.includes(product._id)
            };
        });

        grossTotal = netAmount - totalTaxAmount;

        const roundedGrossTotal = grossTotal.toFixed(2);
        const roundedTotalTaxAmount = totalTaxAmount.toFixed(2);
        const roundedNetAmount = netAmount.toFixed(2);
        const roundedTotalSGST = totalSGST.toFixed(2);
        const roundedTotalCGST = totalCGST.toFixed(2);

        const address = await Address.findOne({ userId, isDefault: true });

        res.json({
            status: true,
            message: 'Cart retrieved successfully',
            cart: {
                userId: cart.userId,
                items: items,
            },
            grossTotal: roundedGrossTotal,
            totalTaxAmount: roundedTotalTaxAmount,
            netAmount: roundedNetAmount,
            totalSGST: roundedTotalSGST,
            totalCGST: roundedTotalCGST,
            defaultAddress: address ? address : 'No default address found'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};

exports.getCartByProductId = async (req, res) => {
    try {
        const { productId } = req.query;
        const userId = req.user ? req.user.user.id : null;

        let isInCart = false;
        if (userId) {
            const cart = await Cart.findOne({ userId });
            if (cart) {
                isInCart = cart.items.some(item =>
                    item.productId.equals(productId)
                );
            }
        }

        res.status(200).json({ status: true, isInCart });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};

exports.removeItemFromCart = async (req, res) => {
    const { productId } = req.body;
    const userId = req.user.user.id;

    try {
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ status: false, message: 'Cart not found' });
        }


        const itemIndex = cart.items.findIndex(item =>
            item.productId.equals(productId)
        );

        if (itemIndex === -1) {
            return res.status(404).json({ status: false, message: 'Item not found in cart' });
        }

        cart.items.splice(itemIndex, 1);

        await cart.save();


        res.status(200).json({ status: true, message: 'Item removed from cart successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};

exports.updateCartItemQuantity = async (req, res) => {
    const { productId, key } = req.body; 
    const userId = req.user.user.id;

    try {
        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ status: false, message: 'Cart not found' });

        const item = cart.items.find(item =>
            item.productId.equals(productId)
        );

        if (!item) return res.status(404).json({ status: false, message: 'Item not found in cart' });

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ status: false, message: 'Product not found' });

        if (key === 'add') {
            item.quantity += 1;
        } else if (key === 'sub' && item.quantity > 1) {
            item.quantity -= 1;
        } else {
            return res.status(400).json({ status: false, message: 'Invalid operation or quantity cannot be less than 1' });
        }

        await cart.save();

        res.json({ status: true, message: 'Cart item quantity updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};

