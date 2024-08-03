const Order = require('../models/Order');
const Product = require('../models/Product');
const Address = require('../models/Address');
const Cart = require('../models/Cart');
const { calculateDistance } = require('../middleware/helper');

exports.createOrder = async (req, res) => {
  try {
    const { items, address, paymentMethod, transactionId } = req.body;
    const user = req.user.user.id;

    if (!items || !address || !paymentMethod) {
      return res.status(400).json({ status: false, message: 'Required fields missing' });
    }

    let totalAmount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ status: false, message: `Product with ID ${item.product} not found` });
      }
      totalAmount += product.salePrice * item.quantity;
    }

    const deliveryAddress = await Address.findById(address);
    if (!deliveryAddress) {
      return res.status(404).json({ status: false, message: `Address with ID ${address} not found` });
    }

   
    const storeLatitude = 28.704060; 
    const storeLongitude = 77.102493; 

    const distance = calculateDistance(storeLatitude, storeLongitude, deliveryAddress.latitude, deliveryAddress.longitude);

    const deliveryDays = Math.ceil(distance / 1000);
    const expectedDeliveryDate = new Date();
    expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + deliveryDays);

    const orderCount = await Order.countDocuments();
    const orderNumber = `ORD-${orderCount + 1}`;

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
      transactionId: paymentMethod !== 'Cash on Delivery' ? transactionId : null,
      expectedDeliveryDate, 
    });

    await newOrder.save();
    await Cart.findOneAndDelete({ userId: user });

    res.status(201).json({ status: true, message: 'Order created successfully'});
  } catch (error) {
    console.log('Error creating order:', error);
    res.status(500).json({ status: false, message: 'Server error', error });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const userId = req.user ? req.user.user.id : null;

    const query = userId ? { user: userId } : {};

    const orders = await Order.find(query)
      .populate('user', 'name')
      .populate({
        path: 'items.product',
        select: 'name price'
      })
      .populate('address');

    if (orders.length === 0) {
      return res.status(404).json({ message: 'No orders found' });
    }

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    .populate('user', 'name') 
    .populate({
      path: 'items.product', 
      select: 'name price' 
    })
    .populate('address');
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

