import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Wallet, Loader2, ArrowLeft, ShieldCheck, ShoppingBag, CreditCard } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Destructure state passed from the Checkout/Cart page
    const { amount, items, shippingAddress } = location.state || {};
    const [loading, setLoading] = useState(false);

    // 1. Safety Check: Handle direct navigation or page refresh
    if (!amount || !items || !shippingAddress) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f0f9f4]">
                <ShoppingBag size={48} className="text-[#1b4332] mb-4 opacity-20" />
                <h2 className="text-[#1b4332] font-black uppercase tracking-tight text-center">
                    Session Expired
                </h2>
                <p className="text-gray-500 text-sm mb-6 text-center">Please restart your checkout from the cart.</p>
                <button 
                    onClick={() => navigate('/cart')} 
                    className="px-8 py-3 bg-[#1b4332] text-white rounded-2xl font-bold hover:scale-105 transition-transform"
                >
                    Return to Cart
                </button>
            </div>
        );
    }

    const handlePayment = async () => {
        setLoading(true);
        const loadingToast = toast.loading("Preparing secure gateway...");

        try {
            // 2. CONSTRUCT PAYLOAD
            // We map the items and add a safety check to ensure product IDs exist
            const mappedItems = items.map(item => {
                const productId = item._id || item.id || item.product;
                
                if (!productId) {
                    console.error("Missing ID for item:", item);
                }

                return {
                    product: productId,
                    quantity: item.quantity
                };
            });

            // Pre-flight check: If any item is missing an ID, don't send the request
            if (mappedItems.some(item => !item.product)) {
                throw new Error("One or more items are missing product IDs. Please clear your cart and try again.");
            }

            const orderPayload = {
                items: mappedItems,
                shippingAddress: {
                    phoneNumber: shippingAddress.phoneNumber,
                    addressLine: shippingAddress.addressLine,
                    city: shippingAddress.city || "Pokhara",
                    landmark: shippingAddress.landmark || "",
                    coordinates: shippingAddress.coordinates // Should be {lat, lng} or [lat, lng]
                },
                paymentDetails: {
                    method: 'Khalti',
                    status: 'Pending'
                }
            };

            // 3. CREATE ORDER 
            // URL matched to your app.js (No /api/v1 prefix)
            const orderRes = await axios.post(
                'http://localhost:3000/order/new', 
                orderPayload, 
                { withCredentials: true }
            );

            if (!orderRes.data.success) {
                throw new Error(orderRes.data.message || "Order creation failed.");
            }

            const orderId = orderRes.data.order._id;

            // 4. INITIATE KHALTI
            const { data } = await axios.post(
                'http://localhost:3000/initiate', 
                { orderId }, 
                { withCredentials: true }
            );

            if (data.success && data.payment_url) {
                toast.success("Redirecting to Khalti...", { id: loadingToast });
                window.location.href = data.payment_url;
            } else {
                throw new Error(data.message || "Failed to get Khalti URL.");
            }

        } catch (err) {
            console.error("Payment Flow Error:", err);
            const errorMsg = err.response?.data?.message || err.message || "Internal Server Error";
            toast.error(errorMsg, { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fdfa] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-[#e8f5ec]">
                
                {/* Header Section */}
                <div className="bg-[#1b4332] p-8 text-center relative">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="absolute left-6 top-9 text-white/60 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="bg-[#5C2D91] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg rotate-3">
                        <Wallet className="text-white w-8 h-8" />
                    </div>
                    <h2 className="text-white text-xl font-black uppercase tracking-tight italic">
                        Confirm <span className="text-[#ffb703]">Payment</span>
                    </h2>
                </div>

                <div className="p-8">
                    {/* Amount Card */}
                    <div className="bg-[#f0f9f4] rounded-[2rem] p-6 mb-8 text-center border-2 border-dashed border-[#b7e4c7]">
                        <span className="text-[#40916c] text-[10px] font-black uppercase tracking-widest block mb-1">Total Payable</span>
                        <h1 className="text-[#1b4332] text-4xl font-black tabular-nums">
                            <span className="text-lg mr-1 opacity-50 font-sans">Rs.</span>{amount}
                        </h1>
                    </div>

                    {/* Trust Badges */}
                    <div className="space-y-3 mb-8">
                        <div className="flex items-center gap-3 text-left bg-[#fcfdfd] p-4 rounded-2xl border border-gray-100">
                            <div className="bg-[#b7e4c7] p-2 rounded-xl">
                                <ShieldCheck className="text-[#1b4332]" size={18} />
                            </div>
                            <div>
                                <p className="text-[11px] font-black text-[#1b4332] uppercase tracking-tighter">Secure Transaction</p>
                                <p className="text-[10px] text-gray-400 font-medium">Encrypted by GharDrop security.</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3 text-left bg-[#fcfdfd] p-4 rounded-2xl border border-gray-100">
                            <div className="bg-[#d8f3dc] p-2 rounded-xl">
                                <CreditCard className="text-[#1b4332]" size={18} />
                            </div>
                            <div>
                                <p className="text-[11px] font-black text-[#1b4332] uppercase tracking-tighter">Payment Partner</p>
                                <p className="text-[10px] text-gray-400 font-bold text-[#5C2D91]">Official Khalti SDK Integration</p>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button 
                        onClick={handlePayment}
                        disabled={loading}
                        className="w-full bg-[#5C2D91] hover:bg-[#4a2475] text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.95] disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <>Pay with Khalti</>
                        )}
                    </button>
                    
                    <p className="text-[10px] text-center text-gray-400 mt-6 font-medium leading-relaxed uppercase">
                        GharDrop Nepal &copy; 2026<br />
                        Pokhara, Nepal
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Payment;