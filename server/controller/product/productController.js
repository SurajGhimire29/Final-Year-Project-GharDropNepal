const Product = require('../../model/productModel');
const { cloudinary } = require('../../utils/cloudinary');

// --- CREATE PRODUCT ---
// @route   POST /api/product/new
exports.createProduct = async (req, res) => {
    try {
        // 1. Link the product to the logged-in vendor
        req.body.user = req.user.id; 

        // 2. Handle Image Upload (via Multer + Cloudinary)
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

        // 3. Convert numeric fields correctly
        req.body.price = Number(req.body.price);
        req.body.stock = Number(req.body.stock) || 0; // Maps to your schema's 'stock' field

        // 4. Handle Festival Offer & Discount Price Logic
        const isFestival = req.body.isFestivalOffer === 'true' || req.body.isFestivalOffer === true;
        
        if (isFestival) {
            const percentage = Number(req.body.discountPercentage) || 0;
            // Calculate discounted price: Price - (Price * %)
            req.body.discountPrice = req.body.price - (req.body.price * (percentage / 100));
            req.body.isFestivalOffer = true;
        } else {
            // If no offer, discountPrice is same as original price
            req.body.discountPrice = req.body.price;
            req.body.isFestivalOffer = false;
        }

        // 5. Save to Database
        const product = await Product.create(req.body);

        // Populate vendor details to return in response
        await product.populate('user', 'fullName email');

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product
        });

    } catch (error) {
        console.error("Create Product Error:", error);
        res.status(400).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// --- GET ALL PRODUCTS ---
// @route   GET /api/products
exports.getProducts = async (req, res) => {
    try {
        const query = req.query.isFestivalOffer ? { isFestivalOffer: true } : {};
        
        if (req.query.category) {
            query.category = req.query.category;
        }

        const products = await Product.find(query)
            .populate('user', 'fullName email avatar') 
            .sort({ createdAt: -1 })
            .lean(); // .lean() makes the query faster and return plain JS objects

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
        const product = await Product.findById(req.params.id)
            .populate('user', 'fullName name email avatar') // Populates the Vendor
            .populate({
                path: 'reviews.user', 
                select: 'fullName avatar' // Populates the Reviewer's profile
            });
        
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        
        res.status(200).json({ success: true, product });
    } catch (error) {
        res.status(400).json({ success: false, message: "Invalid ID format or Server Error" });
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