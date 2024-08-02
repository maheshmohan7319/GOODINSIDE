const Order = require('../models/Order');
const Product = require('../models/Product');


exports.createOrder = async (req, res) => {
    try {
      const { user, items, paymentMethod, address } = req.body;
  
      // Validate and calculate total amount
      let totalAmount = 0;
      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({ message: `Product with ID ${item.product} not found` });
        }
        totalAmount += product.price * item.quantity;
      }
  
      // Create the order
      const newOrder = new Order({
        user,
        items: items.map(item => ({
          product: item.product,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount,
        paymentMethod,
        address,
      });
  
      await newOrder.save();
      res.status(201).json({ message: 'Order created successfully', order: newOrder });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };
  
// Get all orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name').populate('items.product', 'name price');
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get a single order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name')
      .populate('items.product', 'name price');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update an order (e.g., update status)
exports.updateOrder = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status || order.status;
    order.updatedAt = Date.now();

    await order.save();
    res.status(200).json({ message: 'Order updated successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Delete an order
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await order.remove();
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
