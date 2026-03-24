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
        const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
        
        if (!cart) {
            return res.status(200).json({ success: true, cart: { items: [], totalPrice: 0 } });
        }

        res.status(200).json({ success: true, cart });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. REMOVE ITEM
exports.removeItem = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

        cart.items = cart.items.filter(item => item.product.toString() !== req.params.id);

        calculateTotal(cart);
        await cart.save();
        res.status(200).json({ success: true, cart });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
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