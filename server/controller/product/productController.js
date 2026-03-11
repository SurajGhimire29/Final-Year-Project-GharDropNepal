const Product = require('../../model/productModel');
const { cloudinary } = require('../../utils/cloudinary');

// --- CREATE PRODUCT ---
exports.createProduct = async (req, res) => {
    try {
        req.body.user = req.user.id; 

        // Check if a file was uploaded by Multer
        if (req.file) {
            // Map to the array of objects structure in your Schema
            req.body.images = [
                {
                    public_id: req.file.filename, // Cloudinary unique ID
                    url: req.file.path            // Cloudinary URL
                }
            ];
        }

        const product = await Product.create(req.body);
        res.status(201).json({
            success: true,
            product
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// --- GET ALL PRODUCTS ---
exports.getProducts = async (req, res) => {
    try {
        const query = req.query.isFestivalOffer ? { isFestivalOffer: true } : {};
        const products = await Product.find(query);
        
        res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- GET SINGLE PRODUCT ---
exports.getSingleProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        
        res.status(200).json({ success: true, product });
    } catch (error) {
        res.status(400).json({ success: false, message: "Invalid ID format" });
    }
};

// --- UPDATE PRODUCT ---
exports.updateProduct = async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Ownership Check
        if (product.user.toString() !== req.user.id) {
            return res.status(403).json({ 
                success: false, 
                message: "You can only update your own products" 
            });
        }

        // If a new image is uploaded
        if (req.file) {
            // 1. Delete the OLD image from Cloudinary first (optional but recommended)
            if (product.images && product.images.length > 0) {
                await cloudinary.uploader.destroy(product.images.public_id);
            }

            // 2. Set the NEW image in the correct array format
            req.body.images = [
                {
                    public_id: req.file.filename,
                    url: req.file.path
                }
            ];
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// --- DELETE PRODUCT ---
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if (product.user.toString() !== req.user.id) {
            return res.status(403).json({ 
                success: false, 
                message: "You can only delete your own products" 
            });
        }

        // Delete image from Cloudinary before removing from DB
        if (product.images && product.images.length > 0) {
            // Loop through images array if you eventually allow multiple
            for (let img of product.images) {
                await cloudinary.uploader.destroy(img.public_id);
            }
        }

        await product.deleteOne();

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};