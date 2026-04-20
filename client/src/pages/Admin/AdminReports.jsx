import React, { useState, useEffect } from "react";
import axios from "axios";
import { Printer, ArrowLeft, Store, Bike, AlertCircle, FileText } from "lucide-react";
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

  const handlePrint = () => window.print();

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading Reports...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8 lg:p-12 print:bg-white print:p-0">
      <header className="flex justify-between items-center mb-10 print:hidden">
        <button onClick={() => navigate("/admin-dashboard")} className="flex items-center gap-2 font-bold text-slate-500">
          <ArrowLeft size={20} /> Back
        </button>
        <button onClick={handlePrint} className="bg-emerald-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3">
          <Printer size={18} /> PRINT AUDIT
        </button>
      </header>

      <div className="max-w-6xl mx-auto">
        {/* Report Header */}
        <div className="border-b-4 border-emerald-900 pb-8 mb-12">
          <h1 className="text-4xl font-black uppercase">GharDrop Business Report</h1>
          <p className="text-slate-500 font-bold uppercase text-xs">Official Financial Audit: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Vendor Section - 10% Logic */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black uppercase flex items-center gap-2"><Store /> Vendor Performance</h2>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">10% COMM. ON ITEMS</span>
          </div>
          <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-200">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-[10px] uppercase font-black text-slate-400">
                  <th className="p-6">Vendor</th>
                  <th className="p-6 text-center">Orders</th>
                  <th className="p-6">Item Sales</th>
                  <th className="p-6 bg-emerald-50 text-emerald-900">Admin Cut (10%)</th>
                </tr>
              </thead>
              <tbody>
                {data.vendorReport.map((v, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="p-6 font-black">{v.vendorDetails.fullName}</td>
                    <td className="p-6 text-center font-bold">{v.orderCount}</td>
                    <td className="p-6 font-bold text-slate-600">Rs. {v.totalSales.toLocaleString()}</td>
                    <td className="p-6 font-black text-emerald-700 bg-emerald-50/30">Rs. {v.grossRevenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Delivery Section - 5% Logic */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black uppercase flex items-center gap-2"><Bike /> Rider Fleet</h2>
            <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full">5% COMM. ON LOGISTICS</span>
          </div>
          <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-200">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-[10px] uppercase font-black text-slate-400">
                  <th className="p-6">Rider</th>
                  <th className="p-6 text-center">Trips</th>
                  <th className="p-6">Rider Net (95%)</th>
                  <th className="p-6 bg-amber-50 text-amber-900">Admin Profit (5%)</th>
                </tr>
              </thead>
              <tbody>
                {data.deliveryReport.map((r, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="p-6 font-black">{r.riderDetails.fullName}</td>
                    <td className="p-6 text-center font-bold">{r.deliveriesCompleted}</td>
                    <td className="p-6 font-bold text-slate-600">Rs. {r.totalEarned.toLocaleString()}</td>
                    <td className="p-6 font-black text-amber-600 bg-amber-50/30">Rs. {r.platformProfit.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminReports;