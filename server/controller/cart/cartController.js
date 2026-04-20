const Cart = require('../../model/cartModel');
const Product = require('../../model/productModel');

// Helper to calculate total price - keeps code DRY
const calculateTotal = (cart) => {
    cart.totalPrice = cart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
};

// 1. ADD TO CART
// controller/cart/cartController.js

exports.addToCart = async (req, res) => {
    try {
        // Use unique variable names to avoid any scope clashing
        const { productId, quantity } = req.body;
        const currentUserId = req.user._id; 

        // 1. Check Product
        const targetProduct = await Product.findById(productId);
        if (!targetProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // 2. Find Cart
        let userCart = await Cart.findOne({ user: currentUserId });

        const itemPrice = targetProduct.isFestivalOffer ? targetProduct.discountPrice : targetProduct.price;
        const itemImage = targetProduct.images && targetProduct.images.length > 0 ? targetProduct.images[0].url : "";

        if (!userCart) {
            // Create new if none exists
            userCart = await Cart.create({
                user: currentUserId,
                items: [{
                    product: productId,
                    name: targetProduct.name,
                    price: itemPrice,
                    image: itemImage,
                    unit: targetProduct.unit,
                    quantity: quantity || 1
                }]
            });
        } else {
            // Update existing
            const existingItem = userCart.items.find(item => item.product.toString() === productId);

            if (existingItem) {
                existingItem.quantity += (quantity || 1);
            } else {
                userCart.items.push({
                    product: productId,
                    name: targetProduct.name,
                    price: itemPrice,
                    image: itemImage,
                    unit: targetProduct.unit,
                    quantity: quantity || 1
                });
            }
        }

        // 3. Calculate Total
        userCart.totalPrice = userCart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        await userCart.save();
        
        return res.status(200).json({ 
            success: true, 
            message: "Item added to basket",
            cart: userCart 
        });

    } catch (err) {
        // Log the actual error to your terminal so you can see what's happening
        console.error("ADD TO CART ERROR:", err);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error", 
            error: err.message 
        });
    }
};

// 2. GET USER CART
exports.getCart = async (req, res) => {
    try {
        // Use ._id to ensure compatibility with most Auth middlewares
        const userId = req.user._id || req.user.id;

        // .populate is essential to get product details (name, price, etc.)
        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        
        if (!cart) {
            return res.status(200).json({ 
                success: true, 
                cart: { items: [], totalPrice: 0 } 
            });
        }

        // --- PRODUCT INTEGRITY CHECK ---
        // If a product was deleted from the Products collection, 
        // Mongoose populate returns 'null'. We filter those out.
        const originalLength = cart.items.length;
        cart.items = cart.items.filter(item => item.product !== null);

        // If we found and removed "ghost" products, update the database
        if (cart.items.length !== originalLength) {
            calculateTotal(cart);
            await cart.save();
        }

        res.status(200).json({ 
            success: true, 
            cart 
        });
    } catch (error) {
        console.error("GET_CART_ERROR:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to retrieve cart",
            error: error.message 
        });
    }
};
// 3. REMOVE ITEM
// Change req.params.id to req.params.productId (or whatever matches your route)
exports.removeItem = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ 
                success: false, 
                message: "Cart not found" 
            });
        }

        // We check both 'productId' and 'id' to match whatever you named 
        // your parameter in cartRoutes.js
        const pId = req.params.productId || req.params.id; 
        
        // Filter out the item that matches the ID
        const initialCount = cart.items.length;
        cart.items = cart.items.filter(item => item.product.toString() !== pId);

        if (cart.items.length === initialCount) {
            return res.status(404).json({
                success: false,
                message: "Item not found in cart"
            });
        }

        // Recalculate the total price after removal
        calculateTotal(cart);
        await cart.save();

        res.status(200).json({ 
            success: true, 
            message: "Item removed from basket",
            cart 
        });
    } catch (error) {
        console.error("REMOVE_ITEM_ERROR:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to remove item",
            error: error.message 
        });
    }
};
// 4. UPDATE QUANTITY
exports.updateQuantity = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const cart = await Cart.findOne({ user: req.user.id });

        const item = cart.items.find(i => i.product.toString() === productId);
        if (item) {
            item.quantity = quantity;
            calculateTotal(cart);
            await cart.save();
        }

        res.status(200).json({ success: true, cart });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. CLEAR CART
exports.clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });
        if (cart) {
            cart.items = [];
            cart.totalPrice = 0;
            await cart.save();
        }
        res.status(200).json({ success: true, message: "Cart cleared" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};