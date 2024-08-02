const Order = require('../models/Order');
const Product = require('../models/Product');


exports.createOrder = async (req, res) => {
    try {
      const { items, paymentMethod, address } = req.body;
      const user = req.user.user.id;
  
      let totalAmount = 0;
      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({ message: `Product with ID ${item.product} not found` });
        }
        totalAmount += product.salePrice * item.quantity;
      }

      const orderCount = await Order.countDocuments();
      const orderNumber = `ORD-${Date.now()}-${orderCount + 1}`;
  
      const newOrder = new Order({
        orderNumber,
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
        console.log(error);
      res.status(500).json({ message: 'Server error', error });
    }
  };
  

  exports.getOrders = async (req, res) => {
    try {
      const orders = await Order.find()
        .populate('user', 'name') // Populate user details with 'name'
        .populate({
          path: 'items.product', // Populate product details within items
          select: 'name price' // Return 'name' and 'price' from Product
        })
        .populate('address'); // Populate full address details
  
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };
  

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
