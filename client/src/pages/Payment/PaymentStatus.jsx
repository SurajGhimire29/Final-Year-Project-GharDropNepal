import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, CheckCircle2, XCircle, ShoppingBag } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PaymentStatus = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // loading, success, error
    
    // Khalti attaches ?pidx=... to the return_url
    const pidx = searchParams.get("pidx");

    useEffect(() => {
        const verifyPayment = async () => {
            if (!pidx) {
                setStatus('error');
                return;
            }

            try {
                // Ensure this matches your backend route prefix (e.g., /api/v1)
                const { data } = await axios.post(
                    'http://localhost:3000/verify', 
                    { pidx }, 
                    { withCredentials: true }
                );

                // Checking the response from your backend controller
                if (data.success || data.status === "Completed") {
                    setStatus('success');
                    toast.success("Payment Verified Successfully!");
                } else {
                    setStatus('error');
                    toast.error("Payment verification failed.");
                }
            } catch (err) {
                console.error("Verification Error:", err);
                setStatus('error');
                toast.error(err.response?.data?.message || "Server Error during verification");
            }
        };

        verifyPayment();
    }, [pidx]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f9f4] p-6">
            <div className="bg-white p-10 md:p-16 rounded-[3.5rem] shadow-2xl text-center border border-[#d8f3dc] max-w-md w-full">
                
                {status === 'loading' && (
                    <div className="flex flex-col items-center gap-6">
                        <div className="relative">
                            <Loader2 className="w-20 h-20 text-[#5C2D91] animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-10 h-10 bg-[#5C2D91]/10 rounded-full animate-ping"></div>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-[#1b4332] uppercase italic">Verifying...</h2>
                            <p className="text-gray-400 text-sm mt-2 font-medium">Please wait while we confirm your transaction with Khalti.</p>
                        </div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6">
                        <div className="bg-[#d8f3dc] w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-inner">
                            <CheckCircle2 className="w-12 h-12 text-[#1b4332]" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-[#1b4332] uppercase italic tracking-tight">Success!</h2>
                            <p className="text-gray-500 font-medium mt-2">Your order for <span className="text-[#1b4332] font-bold">GharDrop Nepal</span> has been confirmed.</p>
                        </div>
                        <div className="pt-4 flex flex-col gap-3">
                            <button 
                                onClick={() => navigate('/order-success')} 
                                className="w-full bg-[#1b4332] text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-lg shadow-[#1b4332]/20"
                            >
                                View Order Status
                            </button>
                            <button 
                                onClick={() => navigate('/')} 
                                className="w-full bg-transparent text-gray-400 py-2 text-xs font-bold uppercase tracking-widest hover:text-[#1b4332]"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-6">
                        <div className="bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-inner">
                            <XCircle className="w-12 h-12 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-red-600 uppercase italic tracking-tight">Failed</h2>
                            <p className="text-gray-500 font-medium mt-2">We couldn't verify your payment. If money was deducted, please contact support.</p>
                        </div>
                        <div className="pt-4">
                            <button 
                                onClick={() => navigate('/cart')} 
                                className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                            >
                                <ShoppingBag size={18} />
                                Back to Cart
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentStatus;