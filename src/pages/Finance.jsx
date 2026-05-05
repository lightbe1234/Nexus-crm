import React, { useState, useEffect } from 'react';
import { getInvoices, addInvoice, getClients } from '../services/db';
import { useSettings } from '../contexts/SettingsContext';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  CreditCard,
  Download,
  Calendar,
  Wallet,
  ArrowRight,
  ChevronRight,
  FileText,
  X,
  Printer,
  ReceiptText,
  ChevronDown
} from 'lucide-react';

const generateInvoiceHTML = (inv, clientName, client, sym, taxPercentage) => {
  const safeId = String(inv?.id || '').slice(-6).toUpperCase();
  const safeAmount = Number(inv?.amount) || 0;
  const taxAmount = safeAmount * (taxPercentage / 100);
  const totalAmount = safeAmount + taxAmount;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice - ${safeId}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700;900&display=swap');
          body { font-family: 'Outfit', sans-serif; color: #0f172a; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #f1f5f9; padding-bottom: 30px; margin-bottom: 40px; }
          .header h1 { margin: 0 0 5px 0; color: #0f172a; font-size: 48px; font-weight: 900; letter-spacing: -2px; }
          .header-right { text-align: right; }
          .invoice-meta { color: #64748b; font-size: 14px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
          .logo { font-size: 28px; font-weight: 900; color: #2563eb; letter-spacing: -1px; display: flex; align-items: center; gap: 10px; }
          .details { display: flex; justify-content: space-between; margin-bottom: 50px; background: #f8fafc; padding: 30px; border-radius: 24px; }
          .details div { width: 45%; }
          .details h3 { margin-top: 0; margin-bottom: 15px; color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; }
          .details p { margin: 5px 0; line-height: 1.5; font-size: 15px; font-weight: 500; }
          .details strong { font-weight: 900; color: #0f172a; font-size: 18px; display: block; margin-bottom: 8px; }
          table { border-collapse: collapse; margin-bottom: 40px; width: 100%; }
          th { border-bottom: 2px solid #e2e8f0; padding: 16px 10px; text-align: left; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; }
          td { padding: 24px 10px; border-bottom: 1px solid #f1f5f9; font-size: 16px; font-weight: 500; }
          .text-right { text-align: right; }
          .total-section { display: flex; justify-content: flex-end; margin-top: 20px; }
          .total-box { width: 350px; background: #0f172a; color: white; padding: 30px; border-radius: 32px; }
          .total-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
          .total-row.grand-total { border-top: 1px solid #334155; color: white; font-size: 28px; font-weight: 900; margin-top: 15px; padding-top: 25px; letter-spacing: -1px; }
          .footer { margin-top: 80px; text-align: center; color: #94a3b8; font-size: 13px; font-weight: 500; border-top: 2px solid #f1f5f9; padding-top: 30px; }
          .badge { display: inline-block; padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; border: 1px solid; }
          .badge.paid { background: #ecfdf5; color: #059669; border-color: #a7f3d0; }
          .badge.pending { background: #fffbeb; color: #d97706; border-color: #fde68a; }
          .badge.overdue { background: #fff1f2; color: #e11d48; border-color: #fecdd3; }
        </style>
      </head>
      <body onload="setTimeout(() => { window.print(); window.close(); }, 500);">
        <div class="header">
          <div class="logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hexagon"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            AgencyOS
          </div>
          <div class="header-right">
            <h1>INVOICE</h1>
            <p class="invoice-meta">#INV-${safeId}</p>
            <p class="invoice-meta" style="margin-top: 8px;">Issued: ${inv.date || 'N/A'}</p>
            <div style="margin-top: 15px;">
              <span class="badge ${(inv.status || 'pending').toLowerCase()}">${inv.status || 'Pending'}</span>
            </div>
          </div>
        </div>
        
        <div class="details">
          <div>
            <h3>Billed To</h3>
            <p><strong>${clientName}</strong></p>
            <p>${client.email || 'Client Email Not Provided'}</p>
            <p>${client.phone || 'Client Phone Not Provided'}</p>
            <p>${client.company || ''}</p>
          </div>
          <div>
            <h3>From</h3>
            <p><strong>AgencyOS Inc.</strong></p>
            <p>hello@agencyos.com</p>
            <p>+1 (555) 123-4567</p>
            <p>123 Agency Blvd, Suite 400<br>Creative District, CA 90210</p>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Description of Services</th>
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Professional Services Rendered</strong><br><span style="color: #64748b; font-size: 13px; font-weight: 400; margin-top: 5px; display: inline-block;">Consulting, strategy, and execution per agreement.</span></td>
              <td class="text-right">${sym}${safeAmount.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="total-section">
          <div class="total-box">
            <div class="total-row">
              <span>Subtotal</span>
              <span>${sym}${safeAmount.toLocaleString()}</span>
            </div>
            <div class="total-row">
              <span>Tax (${taxPercentage}%)</span>
              <span>${sym}${taxAmount.toLocaleString()}</span>
            </div>
            <div class="total-row grand-total">
              <span>Total Due</span>
              <span>${sym}${totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for your business. Please remit payment within 30 days of the issuance date.</p>
        </div>
      </body>
    </html>
  `;
};

export default function Finance() {
  const { settings } = useSettings();

  if (!settings) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Initializing Hub...</p>
      </div>
    </div>
  );

  const sym = settings?.financial?.currencySymbol || '$';
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [newInvoice, setNewInvoice] = useState({ 
    clientId: '', 
    amount: 0, 
    status: 'Pending', 
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [invoicesData, clientsData] = await Promise.all([getInvoices(), getClients()]);
      setInvoices(invoicesData);
      setClients(clientsData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleAddInvoice = async (e) => {
    e.preventDefault();
    try {
      await addInvoice(newInvoice);
      setShowModal(false);
      setNewInvoice({ 
        clientId: '', 
        amount: 0, 
        status: 'Pending', 
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const getClientName = (id) => clients.find(c => c.id === id)?.name || 'Unknown Client';

  const totalOutstanding = invoices
    .filter(i => i.status === 'Pending' || i.status === 'Overdue')
    .reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
    
  const totalPaid = invoices
    .filter(i => i.status === 'Paid')
    .reduce((acc, i) => acc + (Number(i.amount) || 0), 0);

  const filteredInvoices = (invoices || []).filter(inv => {
    const name = getClientName(inv?.clientId) || 'Unknown';
    const matchesSearch = name.toLowerCase().includes((searchQuery || '').toLowerCase());
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'overdue': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'pending': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const handlePrintInvoice = (inv) => {
    const clientName = getClientName(inv.clientId);
    const client = clients.find(c => c.id === inv.clientId) || {};
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert("Please allow popups for this website to print invoices.");
      return;
    }
    
    const html = generateInvoiceHTML(inv, clientName, client, sym, settings.financial.taxPercentage);
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="h-screen flex flex-col space-y-10 overflow-hidden pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2 bg-blue-50 w-fit px-3 py-1 rounded-full border border-blue-100">
            <Wallet size={12} strokeWidth={3} />
            <span>Financial Control</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Revenue Hub</h1>
          <p className="text-slate-500 text-sm mt-3 font-medium">Monitoring receivables, liquid capital, and institutional billing.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 rounded-[20px] hover:border-blue-400 hover:text-blue-600 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm active:scale-95 group">
            <Download size={16} className="group-hover:-translate-y-0.5 transition-transform" />
            Tax Report
          </button>
          
          <button 
            onClick={() => setShowModal(true)} 
            className="flex items-center gap-2 px-7 py-3.5 bg-slate-900 text-white rounded-[20px] hover:bg-blue-600 transition-all font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/10 active:scale-95 whitespace-nowrap"
          >
            <Plus size={18} strokeWidth={3} />
            Issue Invoice
          </button>
        </div>
      </div>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200/60 p-10 rounded-[40px] relative overflow-hidden group hover:border-orange-300 hover:shadow-2xl hover:shadow-orange-500/5 transition-all duration-500 active:scale-[0.98]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start mb-10">
            <div className="p-5 rounded-3xl bg-orange-50 text-orange-600 shadow-sm border border-orange-100 group-hover:scale-110 transition-transform duration-500">
              <Clock size={32} strokeWidth={2.5} />
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Aging Balance</span>
              <div className="flex items-center gap-1.5 text-rose-500 mt-1">
                <AlertCircle size={14} strokeWidth={3} />
                <span className="text-xs font-black tracking-tight">Requires Attention</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] mb-2">Total Receivables</p>
            <h3 className="text-5xl font-black text-slate-900 tracking-tighter">
              {sym}{totalOutstanding.toLocaleString()}
            </h3>
          </div>
        </div>
        
        <div className="bg-slate-900 p-10 rounded-[40px] relative overflow-hidden group hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 active:scale-[0.98]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start mb-10 relative z-10">
            <div className="p-5 rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-600/20 group-hover:scale-110 transition-transform duration-500">
              <CheckCircle2 size={32} strokeWidth={2.5} />
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Collected Capital</span>
              <div className="flex items-center gap-1.5 text-emerald-400 mt-1">
                <TrendingUp size={14} strokeWidth={3} />
                <span className="text-xs font-black tracking-tight">+8.4% This Month</span>
              </div>
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] mb-2">Total Paid (MTD)</p>
            <h3 className="text-5xl font-black text-white tracking-tighter">
              {sym}{totalPaid.toLocaleString()}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="flex-1 bg-white border border-slate-200/60 rounded-[32px] shadow-sm overflow-hidden flex flex-col group/table">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Recent Invoices</h2>
          </div>
          <div className="flex gap-4 w-full md:w-auto items-center">
            <div className="relative">
              <select 
                className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer hover:bg-slate-50"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            
            <div className="relative flex-1 md:flex-none">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                className="bg-slate-50 text-sm font-medium border border-transparent rounded-xl pl-12 pr-6 py-2.5 w-full md:w-64 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all" 
                placeholder="Search invoices..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="py-4 px-8 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Invoice ID</th>
                <th className="py-4 px-8 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Client</th>
                <th className="py-4 px-8 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Issue Date</th>
                <th className="py-4 px-8 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Due Date</th>
                <th className="py-4 px-8 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="py-4 px-8 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="py-4 px-8 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredInvoices.map(inv => {
                const client = clients.find(c => c.id === inv.clientId);
                const clientName = client?.name || 'Unknown Client';
                const initials = clientName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                
                return (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-all group/row">
                    <td className="py-5 px-8">
                      <span className="text-sm font-bold text-blue-600 cursor-pointer hover:underline">
                        INV-{new Date(inv.date).getFullYear()}-{String(inv.id || '').slice(-3).toUpperCase()}
                      </span>
                    </td>
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm ${
                          ['bg-blue-600', 'bg-indigo-600', 'bg-emerald-600', 'bg-orange-600', 'bg-rose-600'][Math.abs(inv.clientId?.length || 0) % 5]
                        }`}>
                          {initials}
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{clientName}</span>
                      </div>
                    </td>
                    <td className="py-5 px-8">
                      <span className="text-sm font-medium text-slate-500">
                        {inv.date ? new Date(inv.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'N/A'}
                      </span>
                    </td>
                    <td className="py-5 px-8">
                      <span className={`text-sm font-bold ${inv.status === 'Overdue' ? 'text-rose-500' : 'text-slate-500'}`}>
                        {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'N/A'}
                      </span>
                    </td>
                    <td className="py-5 px-8">
                      <span className="text-base font-bold text-slate-900">
                        {sym}{(inv.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-5 px-8">
                      <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(inv.status)}`}>
                        {inv.status || 'Pending'}
                      </span>
                    </td>
                    <td className="py-5 px-8 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handlePrintInvoice(inv)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Print Invoice"
                        >
                          <Printer size={16} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center opacity-40">
                      <FileText size={48} strokeWidth={1.5} className="mb-4 text-slate-300" />
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No invoices found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="p-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/30">
          <p className="text-sm font-medium text-slate-400">
            Showing <span className="text-slate-900 font-bold">1</span> to <span className="text-slate-900 font-bold">{filteredInvoices.length}</span> of <span className="text-slate-900 font-bold">{filteredInvoices.length}</span> entries
          </p>
          <div className="flex items-center gap-1">
            <button className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-600 disabled:opacity-50" disabled>Prev</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-600/20">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 text-sm font-bold">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 text-sm font-bold">3</button>
            <button className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-600">Next</button>
          </div>
        </div>
      </div>

      {/* Modal Section */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col border border-white/20 animate-in zoom-in duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
            
            <div className="flex justify-between items-center p-10 border-b border-slate-50 shrink-0">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">Generate Invoice</h2>
                <p className="text-slate-500 text-sm font-medium mt-3">Authorize a new financial disbursement for client settlement.</p>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 shrink-0">
                <X size={28} strokeWidth={3} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
              <form onSubmit={handleAddInvoice} className="space-y-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Counterparty Stakeholder</label>
                <div className="relative group">
                  <ReceiptText size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                  <select 
                    required 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-10 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                    value={newInvoice.clientId} 
                    onChange={e => setNewInvoice({...newInvoice, clientId: e.target.value})}
                  >
                    <option value="">Select Target Client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <ChevronRight size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
                </div>
              </div>
              
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Billing Quantum ({sym})</label>
                    <div className="relative group">
                      <DollarSign size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                      <input 
                        type="number" 
                        required 
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" 
                        value={newInvoice.amount} 
                        onChange={e => setNewInvoice({...newInvoice, amount: Number(e.target.value)})} 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Issue Date</label>
                    <div className="relative group">
                      <Calendar size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                      <input 
                        type="date" 
                        required 
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all appearance-none" 
                        value={newInvoice.date} 
                        onChange={e => setNewInvoice({...newInvoice, date: e.target.value})} 
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Due Date</label>
                  <div className="relative group">
                    <Calendar size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                      type="date" 
                      required 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all appearance-none" 
                      value={newInvoice.dueDate} 
                      onChange={e => setNewInvoice({...newInvoice, dueDate: e.target.value})} 
                    />
                  </div>
                </div>
              
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Transaction Settlement State</label>
                <div className="relative group">
                  <CreditCard size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                  <select 
                    required 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-10 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                    value={newInvoice.status} 
                    onChange={e => setNewInvoice({...newInvoice, status: e.target.value})}
                  >
                    <option value="Pending">Awaiting Settlement</option>
                    <option value="Paid">Disbursement Finalized</option>
                    <option value="Overdue">Past Maturity Date</option>
                  </select>
                  <ChevronRight size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 px-8 py-4 bg-slate-50 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 shadow-xl shadow-slate-900/10 transition-all active:scale-95"
                >
                  Authorize Invoice
                </button>
              </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
