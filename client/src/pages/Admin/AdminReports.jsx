import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Printer, 
  ArrowLeft, 
  Store, 
  Bike, 
  FileText, 
  Download 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminReports = () => {
  const [data, setData] = useState({ vendorReport: [], deliveryReport: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:3000/admin/reports", { withCredentials: true });
        if (res.data.success) {
          setData(res.data);
        } else {
          setError("Failed to fetch report data.");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Server Error.");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Functions for printing
  const printFullAudit = () => window.print();

  const printSection = (sectionId) => {
    // Add a temporary class to body to hide other elements during print
    const originalClassName = document.body.className;
    document.body.classList.add(`print-only-${sectionId}`);
    window.print();
    document.body.className = originalClassName;
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 font-bold text-emerald-900">
      <div className="animate-pulse">Loading GharDrop Reports...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8 lg:p-12 print:bg-white print:p-0">
      
      {/* Dynamic Print Styles */}
      <style>
        {`
          @media print {
            .print-only-vendor #delivery-section { display: none !important; }
            .print-only-delivery #vendor-section { display: none !important; }
            .no-print { display: none !important; }
          }
        `}
      </style>

      <header className="flex justify-between items-center mb-10 no-print">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 font-black text-slate-500 uppercase text-xs hover:text-emerald-900 transition-colors"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
        <button 
          onClick={printFullAudit} 
          className="bg-emerald-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-black transition-all shadow-lg"
        >
          <Printer size={18} /> PRINT FULL AUDIT
        </button>
      </header>

      <div className="max-w-6xl mx-auto">
        {/* Report Header */}
        <div className="border-b-4 border-emerald-900 pb-8 mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-emerald-950">GharDrop Business Report</h1>
            <p className="text-slate-500 font-bold uppercase text-xs mt-2">Official Financial Audit: {new Date().toLocaleDateString()}</p>
          </div>
          <div className="text-right no-print">
             <span className="text-[10px] font-black bg-white border border-slate-200 px-3 py-1 rounded-full text-slate-400">ADMIN SECURE PORTAL</span>
          </div>
        </div>

        {/* Vendor Section */}
        <section id="vendor-section" className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
               <div className="p-3 bg-emerald-900 text-white rounded-xl"><Store size={20}/></div>
               <div>
                  <h2 className="text-xl font-black uppercase">Vendor Performance</h2>
                  <span className="text-[10px] font-black text-emerald-600 uppercase">10% Commission on item sales</span>
               </div>
            </div>
            <button 
              onClick={() => printSection('vendor')}
              className="no-print flex items-center gap-2 bg-white border-2 border-emerald-900/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase text-emerald-900 hover:bg-emerald-50 transition-all"
            >
              <FileText size={14} /> Generate Vendor Report
            </button>
          </div>
          <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-[10px] uppercase font-black text-slate-400">
                  <th className="p-6">Vendor Name</th>
                  <th className="p-6 text-center">Orders</th>
                  <th className="p-6">Sales (10% Cut)</th>
                  <th className="p-6">Banner Charge</th>
                  <th className="p-6 bg-emerald-50 text-emerald-900">Total Profit</th>
                </tr>
              </thead>
              <tbody>
                {data.vendorReport.length > 0 ? (
                  data.vendorReport.map((v, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors text-sm">
                      <td className="p-6 font-black text-emerald-950">{v.vendorDetails?.fullName || "General Vendor"}</td>
                      <td className="p-6 text-center font-bold">{v.orderCount}</td>
                      <td className="p-6 font-bold text-slate-600">Rs. {v.commissionRevenue.toLocaleString()}</td>
                      <td className="p-6 font-bold text-amber-600">Rs. {v.bannerFees.toLocaleString()}</td>
                      <td className="p-6 font-black text-emerald-700 bg-emerald-50/30 text-lg">Rs. {v.totalPlatformRevenue.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4" className="p-10 text-center font-bold text-slate-400">No vendor data available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Delivery Section */}
        <section id="delivery-section" className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
               <div className="p-3 bg-amber-500 text-white rounded-xl"><Bike size={20}/></div>
               <div>
                  <h2 className="text-xl font-black uppercase">Rider Fleet</h2>
                  <span className="text-[10px] font-black text-amber-600 uppercase">5% Commission on logistics</span>
               </div>
            </div>
            <button 
              onClick={() => printSection('delivery')}
              className="no-print flex items-center gap-2 bg-white border-2 border-amber-500/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase text-amber-600 hover:bg-amber-50 transition-all"
            >
              <FileText size={14} /> Generate Rider Report
            </button>
          </div>
          <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-[10px] uppercase font-black text-slate-400">
                  <th className="p-6">Rider Name</th>
                  <th className="p-6 text-center">Trips</th>
                  <th className="p-6">Rider Net (95%)</th>
                  <th className="p-6 bg-amber-50 text-amber-900">Admin Profit (5%)</th>
                </tr>
              </thead>
              <tbody>
                {data.deliveryReport.length > 0 ? (
                  data.deliveryReport.map((r, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="p-6 font-black text-slate-900">{r.riderDetails?.fullName || "Freelance Rider"}</td>
                      <td className="p-6 text-center font-bold">{r.deliveriesCompleted}</td>
                      <td className="p-6 font-bold text-slate-600">Rs. {r.totalEarned.toLocaleString()}</td>
                      <td className="p-6 font-black text-amber-600 bg-amber-50/30">Rs. {r.platformProfit.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4" className="p-10 text-center font-bold text-slate-400">No rider data available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Footer for Print Only */}
        <div className="hidden print:block mt-20 border-t pt-8 text-center">
          <p className="text-xs font-bold uppercase text-slate-400">GharDrop Nepal - System Generated Audit Document</p>
          <p className="text-[8px] text-slate-300 mt-1">End of Report</p>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;