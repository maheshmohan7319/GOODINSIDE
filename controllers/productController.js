const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'GOODINSIDE/categories',
    format: async (req, file) => 'jpg',
    public_id: (req, file) => Date.now() + '-' + file.originalname.split('.')[0],
  },
});

const upload = multer({ storage });


exports.getProducts = async (req, res) => {
  try {
    let productsQuery = Product.find();

    if (!req.user) {
      productsQuery = productsQuery.where({ isActive: true });
    }

    const products = await productsQuery.exec();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Internal server error' });
  }
};


exports.getProductById = async (req, res) => {
  try {
    let productQuery = Product.findOne({ _id: req.params.id });

    if (!req.user) {
      productQuery = productQuery.where({ isActive: true });
    }

    const product = await productQuery.exec();
    if (!product) {
      return res.status(404).json({ status: true, message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: 'Internal server error' });
  }
};


exports.createProduct = [
  upload.single('image'),
  async (req, res) => {
    const { name, description, salePrice, offerPrice, purchasePrice, category, isTaxInclusive, taxPercentage, isActive, ingredients } = req.body;
    const image = req.file ? req.file.path : null;
    const createdBy = req.user.user.id;

    try {
      const existingProduct = await Product.findOne({ name });
      if (existingProduct) {
        return res.status(400).json({ status: false, message: 'Product name already exists' });
      }

      const newProduct = new Product({
        name,
        description,
        salePrice,
        offerPrice,
        purchasePrice,
        category,
        isTaxInclusive,
        taxPercentage,
        createdBy,
        updatedBy: createdBy,
        isActive,
        image,
        ingredients: JSON.parse(ingredients || '[]'), 
      });
      await newProduct.save();
      res.json(newProduct);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ status: false, message: 'Internal server error' });
    }
  },
];


exports.updateProduct = [
  upload.single('image'),
  async (req, res) => {
    const { id } = req.params;
    const { name, description, salePrice, offerPrice, purchasePrice, category, isTaxInclusive, taxPercentage, isActive, ingredients } = req.body;
    const updatedBy = req.user.user.id;

    try {
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ status: false, message: 'Product not found' });
      }

      product.name = name || product.name;
      product.description = description || product.description;
      product.salePrice = salePrice || product.salePrice;
      product.offerPrice = offerPrice || product.offerPrice;
      product.purchasePrice = purchasePrice || product.purchasePrice;
      product.category = category || product.category;
      product.isTaxInclusive = typeof isTaxInclusive !== 'undefined' ? isTaxInclusive : product.isTaxInclusive;
      product.taxPercentage = typeof taxPercentage !== 'undefined' ? taxPercentage : product.taxPercentage;
      product.isActive = typeof isActive !== 'undefined' ? isActive : product.isActive;
      product.updatedBy = updatedBy;

      if (ingredients) {
        product.ingredients = JSON.parse(ingredients);
      }

      if (req.file) {
        if (product.image) {
          const publicId = product.image.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        }
        product.image = req.file.path;
      }

      const result = await product.save();
      res.json(result);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ status: false, message: 'Internal server error' });
    }
  },
];


exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ status: false, message: 'Product not found' });
    }

    if (product.image) {
      const publicId = product.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    await Product.findByIdAndDelete(id);
    res.json({ status: true, message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ status: false, message: 'Internal server error' });
  }
};
