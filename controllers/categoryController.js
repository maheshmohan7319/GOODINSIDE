
const Category = require('../models/Category');
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


exports.getCategories = async (req, res) => {
    try {
        let categoriesQuery = Category.find();

        if (!req.user) {
            categoriesQuery = categoriesQuery.where({ isActive: true });
        }

        const categories = await categoriesQuery.exec();
        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        let categoryQuery = Category.findOne({ _id: req.params.id });

        if (!req.user) {
            categoryQuery = categoryQuery.where({ isActive: true });
        }

        const category = await categoryQuery.exec();
        if (!category) {
            return res.status(404).json({ status: true, message: 'Category not found' });
        }
        res.json(category);
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};



exports.createCategory = [
    upload.single('image'),
    async (req, res) => {
        const { name, description } = req.body;
        const image = req.file ? req.file.path : null;
        const createdBy = req.user.user.id; 

        try {
            const existingCategory = await Category.findOne({ name });
            if (existingCategory) {
                return res.status(400).json({ status: false, message: 'Category name already exists' });
            }

            const newCategory = new Category({ name, description, image, createdBy });
            await newCategory.save();
            res.json(newCategory);
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ status: false, message: 'Internal server error' });
        }
    },
];

exports.updateCategory = [
    upload.single('image'),
    async (req, res) => {
      const { name, description, isActive } = req.body;
      const image = req.file ? req.file.path : null;
      const updatedBy = req.user.userId;
  
      try {
        let category = await Category.findById(req.params.id);
        if (!category) {
          return res.status(404).json({ status: false, message: 'Category not found' });
        }
  
        if (name !== category.name) {
          const existingCategory = await Category.findOne({ name });
          if (existingCategory && existingCategory._id.toString() !== req.params.id) {
            return res.status(400).json({ status: false, message: 'Category name already exists' });
          }
        }
  

        if (image && category.image) {
          const publicId = category.image.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        }
  
        category.name = name || category.name;
        category.description = description || category.description;
        if (image) category.image = image;
        category.updatedBy = updatedBy || category.updatedBy;
        category.isActive = isActive !== undefined ? isActive : category.isActive;
  
        await category.save();
        res.json(category);
      } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: 'Internal server error' });
      }
    }
  ];



  exports.deleteCategory = async (req, res) => {
    try {
      const categoryId = req.params.id;
      const productsInCategory = await Product.find({ category: categoryId });
  
      if (productsInCategory.length > 0) {
        return res.status(400).json({ status: false, message: 'Cannot delete category. There are products associated with it.' });
      }
  
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ status: false, message: 'Category not found' });
      }
  
      if (category.image) {
        const publicId = category.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      }
  
      await category.deleteOne();
      res.status(200).json({ status: true, message: 'Category removed and image deleted' });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ status: false, message: 'Internal server error' });
    }
  };