const Product = require('../../model/productModel'); // Adjust path as needed

// Create New Review or Update the review
exports.createProductReview = async (req, res) => {
    try {
        const { rating, comment, productId } = req.body;

        const review = {
            user: req.user._id,
            name: req.user.fullName, // Assumes your User model has fullName
            rating: Number(rating),
            comment,
        };

        const product = await Product.findById(productId || req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Check if user has already reviewed the product
        const isReviewed = product.reviews.find(
            (rev) => rev.user.toString() === req.user._id.toString()
        );

        if (isReviewed) {
            // Update existing review
            product.reviews.forEach((rev) => {
                if (rev.user.toString() === req.user._id.toString()) {
                    rev.comment = comment;
                    rev.rating = rating;
                }
            });
        } else {
            // Add new review
            product.reviews.push(review);
            product.numOfReviews = product.reviews.length;
        }

        // Calculate Average Ratings
        // (Sum of all ratings / total number of reviews)
        product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

        await product.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
            message: "Review added successfully",
            product
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get All Reviews of a product
exports.getProductReviews = async (req, res) => {
    try {
        const product = await Product.findById(req.query.id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.status(200).json({
            success: true,
            reviews: product.reviews,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};