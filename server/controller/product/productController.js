const Product = require('../../model/productModel');
const { cloudinary } = require('../../utils/cloudinary');

// --- CREATE PRODUCT ---
// @route   POST /api/product/new
exports.createProduct = async (req, res) => {
    try {
        // Link the product to the logged-in vendor/user
        req.body.user = req.user.id; 

        // Handle Image Upload to Cloudinary via Multer
        if (req.file) {
            req.body.images = [
                {
                    public_id: req.file.filename,
                    url: req.file.path
                }
            ];
        } else {
            return res.status(400).json({ 
                success: false, 
                message: "Please upload a product image" 
            });
        }
        if (req.body.isFestivalOffer === 'true' || req.body.isFestivalOffer === true) {
            const price = Number(req.body.price);
            const percentage = Number(req.body.discountPercentage) || 0;
            
            // Calculate discount and save it to a new field
            req.body.discountPrice = price - (price * (percentage / 100));
        } else {
            // If no offer, discount price is just the regular price
            req.body.discountPrice = req.body.price;
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
// @route   GET /api/products
exports.getProducts = async (req, res) => {
    try {
        // Supports filtering by Festival Offer (e.g., /api/products?isFestivalOffer=true)
        const query = req.query.isFestivalOffer ? { isFestivalOffer: true } : {};
        
        // You can also add category filtering here easily
        if (req.query.category) {
            query.category = req.query.category;
        }

        const products = await Product.find(query).sort({ createdAt: -1 });
        
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
// @route   GET /api/product/:id
exports.getSingleProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('user', 'fullName name email');
        
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        
        res.status(200).json({ success: true, product });
    } catch (error) {
        res.status(400).json({ success: false, message: "Invalid ID format" });
    }
};

// --- UPDATE PRODUCT ---
// @route   PUT /api/product/:id
exports.updateProduct = async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Ownership Check: Ensure only the creator can update
        if (product.user.toString() !== req.user.id) {
            return res.status(403).json({ 
                success: false, 
                message: "Unauthorized: You can only update your own products" 
            });
        }

        // If a new image is being uploaded
        if (req.file) {
            // 1. Delete the old image from Cloudinary to save space
            if (product.images && product.images.length > 0) {
                await cloudinary.uploader.destroy(product.images[0].public_id);
            }

            // 2. Map the new Cloudinary data
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
// @route   DELETE /api/product/:id
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Ownership Check
        if (product.user.toString() !== req.user.id) {
            return res.status(403).json({ 
                success: false, 
                message: "Unauthorized: You can only delete your own products" 
            });
        }

        // Remove images from Cloudinary before deleting from DB
        if (product.images && product.images.length > 0) {
            for (const img of product.images) {
                await cloudinary.uploader.destroy(img.public_id);
            }
        }

        await product.deleteOne();

        res.status(200).json({
            success: true,
            message: "Product deleted successfully from shop"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};