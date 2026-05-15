import React, { useState, useEffect } from 'react';
import { subscribeToInvoices, subscribeToClients, addInvoice, updateInvoice, deleteInvoice } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { 
  Plus, Search, Filter, MoreHorizontal, DollarSign, 
  Clock, CheckCircle2, AlertCircle, TrendingUp, CreditCard,
  Download, Calendar, Wallet, ArrowRight, ChevronRight,
  FileText, X, Printer, ReceiptText, ChevronDown,
  Trash2, Edit2, Sparkles, Activity, ShieldCheck, Box,
  Briefcase, Target
} from 'lucide-react';

const generateInvoiceHTML = (inv, clientName, client, sym, taxPercentage, autoPrint = false) => {
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
      <body onload="${autoPrint ? "setTimeout(() => { window.print(); window.close(); }, 500);" : ''}">
        <div class="header">
          <div class="logo">
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
  const { userRole } = useAuth();
  const isAdmin = userRole === 'Admin';
  const sym = settings?.financial?.currencySymbol || '$';
  const taxRate = settings?.financial?.taxRate || 0;

  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [newInvoice, setNewInvoice] = useState({ 
    clientId: '', amount: 0, status: 'Pending', 
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  useEffect(() => {
    const unsubInv = subscribeToInvoices((data) => {
      setInvoices(data);
      setLoading(false);
    });
    const unsubCli = subscribeToClients((data) => setClients(data));
    return () => { unsubInv(); unsubCli(); };
  }, []);

  const handleAddInvoice = async (e) => {
    e.preventDefault();
    if (!newInvoice.clientId) { setFormError('Please select a client.'); return; }
    if (!newInvoice.amount || newInvoice.amount <= 0) { setFormError('Please enter a valid amount.'); return; }
    setSaving(true);
    setFormError('');
    try {
      await addInvoice(newInvoice);
      setShowModal(false);
      setNewInvoice({ 
        clientId: '', amount: 0, status: 'Pending', 
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    } catch (err) { setFormError('Failed to issue invoice. Try again.'); console.error(err); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (id, status) => {
    try { await updateInvoice(id, { status }); } catch (err) { console.error(err); }
  };

  const handleDeleteInvoice = async () => {
    if (!confirmDelete) return;
    try { await deleteInvoice(confirmDelete.id); } catch (err) { console.error(err); }
    setConfirmDelete(null);
  };

  const getClientName = (id) => clients.find(c => c.id === id)?.name || 'Unknown Client';

  const totalOutstanding = invoices
    .filter(i => i.status === 'Pending' || i.status === 'Overdue')
    .reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
    
  const totalPaid = invoices
    .filter(i => i.status === 'Paid')
    .reduce((acc, i) => acc + (Number(i.amount) || 0), 0);

  const filteredInvoices = invoices.filter(inv => {
    const name = getClientName(inv?.clientId);
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handlePrintInvoice = (inv) => {
    const clientName = getClientName(inv.clientId);
    const client = clients.find(c => c.id === inv.clientId) || {};
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups for this website to print invoices.');
      return;
    }
    const html = generateInvoiceHTML(inv, clientName, client, sym, taxRate, true);
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-10 pb-10 animate-slide-up">
      {/* Institutional Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-50 w-fit px-4 py-2 rounded-xl border border-blue-100 shadow-sm">
            <Wallet size={12} className="animate-pulse" />
            <span>Fiscal Command</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">Revenue <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Architecture</span></h1>
            <p className="text-slate-500 text-sm font-medium italic opacity-75">Institutional audit of receivables and capital disbursements.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm">
            <Download size={14} /> Tax Summary
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10"
          >
            <Plus size={14} /> Issue Invoice
          </button>
        </div>
      </div>

      {/* Financial KPI Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Receivables Card */}
        <div className="premium-card p-10 group relative overflow-hidden transition-all hover:-translate-y-2">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/[0.03] rounded-full -mr-24 -mt-24 transition-transform duration-700 group-hover:scale-110" />
          <div className="flex justify-between items-start mb-12">
            <div className="p-5 rounded-[1.5rem] bg-amber-50 text-amber-600 border border-amber-100 shadow-sm transition-transform group-hover:scale-110">
              <Clock size={28} strokeWidth={2.5} />
            </div>
            <div className="text-right space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Receivable Quantum</p>
              <div className="flex items-center gap-2 text-rose-500 justify-end">
                <AlertCircle size={14} strokeWidth={3} className="animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-tighter">Requires Settlement</span>
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Outstanding</p>
            <h3 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">
              {sym}{totalOutstanding.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Collected Capital Card */}
        <div className="bg-slate-900 rounded-[2.5rem] p-10 group relative overflow-hidden shadow-2xl shadow-slate-900/40 transition-all hover:-translate-y-2">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mr-24 -mt-24 blur-3xl transition-transform duration-1000 group-hover:scale-110" />
          <div className="flex justify-between items-start mb-12 relative z-10">
            <div className="p-5 rounded-[1.5rem] bg-blue-600 text-white shadow-xl shadow-blue-900/20 transition-transform group-hover:scale-110">
              <CheckCircle2 size={28} strokeWidth={2.5} />
            </div>
            <div className="text-right space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Realized Yield</p>
              <div className="flex items-center gap-2 text-emerald-400 justify-end">
                <TrendingUp size={14} strokeWidth={3} />
                <span className="text-[10px] font-black uppercase tracking-tighter">+8.4% MOM Velocity</span>
              </div>
            </div>
          </div>
          <div className="relative z-10 space-y-1">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Total Paid (MTD)</p>
            <h3 className="text-5xl font-black text-white tracking-tighter leading-none">
              {sym}{totalPaid.toLocaleString()}
            </h3>
          </div>
        </div>
      </div>

      {/* Transaction Ledger */}
      <div className="premium-card overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-8 bg-white">
          <div className="space-y-1">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Transactional Registry</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">Auditing disbursement lifecycle states</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative">
              <select 
                className="appearance-none bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 pr-12 text-[10px] font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:ring-8 focus:ring-blue-500/5 transition-all cursor-pointer hover:bg-white hover:border-blue-400"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Tiers</option>
                <option value="Paid">Finalized</option>
                <option value="Pending">Awaiting</option>
                <option value="Overdue">Critical</option>
              </select>
              <ChevronDown size={14} strokeWidth={3} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            
            <div className="relative flex-1 md:w-80">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-6 py-4 text-[10px] font-black uppercase tracking-widest focus:ring-8 focus:ring-blue-500/5 focus:bg-white focus:border-blue-400 outline-none transition-all placeholder:text-slate-400" 
                placeholder="QUERY INVOICES..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deployment ID</th>
                <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Stakeholder Entity</th>
                <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Maturity Matrix</th>
                <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Quantum</th>
                <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">State</th>
                <th className="py-6 px-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredInvoices.map((inv, idx) => {
                const clientName = getClientName(inv.clientId);
                const isOverdue = inv.status === 'Overdue';
                
                return (
                  <tr key={inv.id || idx} className="hover:bg-slate-50/50 transition-all group animate-slide-right" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <td className="py-6 px-10">
                      <span className="text-xs font-black text-blue-600 tracking-tight group-hover:underline cursor-pointer">
                        INV-{new Date(inv.date).getFullYear()}-{String(inv.id || '').slice(-4).toUpperCase()}
                      </span>
                    </td>
                    <td className="py-6 px-10">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-slate-900/10 group-hover:scale-110 transition-transform">
                          {clientName[0]}
                        </div>
                        <span className="text-xs font-black text-slate-900 tracking-tight uppercase">{clientName}</span>
                      </div>
                    </td>
                    <td className="py-6 px-10">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Calendar size={10} className="text-blue-500" /> {inv.date}
                        </span>
                        <span className={`text-[9px] font-black uppercase tracking-tighter ${isOverdue ? 'text-rose-500' : 'text-slate-300'} italic`}>
                          Maturity: {inv.dueDate}
                        </span>
                      </div>
                    </td>
                    <td className="py-6 px-10 text-right">
                      <p className="text-sm font-black text-slate-900 tracking-tight">
                        {sym}{(inv.amount || 0).toLocaleString()}
                      </p>
                    </td>
                    <td className="py-6 px-10">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                        inv.status === 'Paid' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : inv.status === 'Overdue' 
                            ? 'bg-rose-50 text-rose-600 border-rose-100'
                            : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${inv.status === 'Paid' ? 'bg-emerald-500' : 'bg-current animate-pulse'}`} />
                        {inv.status}
                      </div>
                    </td>
                    <td className="py-6 px-10">
                       <div className="flex justify-center items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                           onClick={() => setPreviewInvoice(inv)}
                           className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100 shadow-sm"
                         >
                           <FileText size={16} strokeWidth={2.5} />
                         </button>
                         <button 
                           onClick={() => handlePrintInvoice(inv)}
                           className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100 shadow-sm"
                         >
                           <Printer size={16} strokeWidth={2.5} />
                         </button>
                         {isAdmin && (
                           <>
                             <button
                               onClick={() => setConfirmDelete({ id: inv.id, name: `INV-${String(inv.id).slice(-6).toUpperCase()}` })}
                               className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100 shadow-sm"
                             >
                               <Trash2 size={16} strokeWidth={2.5} />
                             </button>
                           </>
                         )}
                       </div>
                     </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Invoice Preview Overlay */}
      {previewInvoice && (() => {
        const pClient = clients.find(c => c.id === previewInvoice.clientId) || {};
        const pClientName = pClient?.name || 'Unknown Client';
        const previewHtml = generateInvoiceHTML(previewInvoice, pClientName, pClient, sym, taxRate, false);
        return (
          <div className="modal-overlay">
            <div className="modal-box-lg h-[90vh]">
              <div className="flex justify-between items-center p-6 md:p-8 border-b border-slate-50 shrink-0 bg-white/80 backdrop-blur-xl sticky top-0 z-20">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-900/20">
                    <FileText size={24} strokeWidth={2.5} />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none">Invoice Visualizer</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] italic">#INV-{String(previewInvoice.id || '').slice(-6).toUpperCase()} &bull; {pClientName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handlePrintInvoice(previewInvoice)}
                    className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                  >
                    <Printer size={16} strokeWidth={3} /> Execute Print
                  </button>
                  <button 
                    onClick={() => setPreviewInvoice(null)} 
                    className="p-3 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-100"
                  >
                    <X size={20} strokeWidth={3} />
                  </button>
                </div>
              </div>
              <iframe
                srcDoc={previewHtml}
                className="flex-1 w-full border-0 relative z-10 bg-white"
                title="Invoice Preview"
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        );
      })()}

      {/* Institutional Issuance Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="p-6 md:p-8 border-b border-slate-50 bg-white/80 backdrop-blur-xl flex justify-between items-center sticky top-0 z-20 shrink-0">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 w-fit px-3 py-1 rounded-lg border border-blue-100">
                  <Plus size={12} strokeWidth={3} />
                  <span>Issuance Terminal</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">Generate Invoice</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">Authorize financial disbursement protocol.</p>
              </div>
              <button 
                onClick={() => { setShowModal(false); setFormError(''); }}
                className="p-3 hover:bg-slate-50 rounded-xl transition-all text-slate-300 hover:text-slate-900 border border-transparent hover:border-slate-100"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </div>
            
            <div className="modal-body p-6 md:p-8">
              <form onSubmit={handleAddInvoice} className="space-y-6">
              {formError && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-bold flex items-start gap-3">
                  <span className="mt-0.5 shrink-0">⚠</span>
                  <span>{formError}</span>
                </div>
              )}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Counterparty Stakeholder</label>
                <div className="relative">
                  <Target size={16} strokeWidth={3} className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500" />
                  <select 
                    required 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-10 py-4 text-xs font-black uppercase tracking-widest text-slate-900 focus:ring-8 focus:ring-blue-500/5 focus:bg-white focus:border-blue-400 outline-none transition-all appearance-none cursor-pointer"
                    value={newInvoice.clientId} 
                    onChange={e => setNewInvoice({...newInvoice, clientId: e.target.value})}
                  >
                    <option value="">Select Target Entity</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <ChevronDown size={16} strokeWidth={3} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Billing Amount ({sym})</label>
                  <div className="relative">
                    <DollarSign size={16} strokeWidth={3} className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500" />
                    <input 
                      type="number" 
                      required 
                      min="1"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4 text-xs font-black tracking-widest text-slate-900 focus:ring-8 focus:ring-blue-500/5 focus:bg-white focus:border-blue-400 outline-none transition-all" 
                      value={newInvoice.amount} 
                      onChange={e => setNewInvoice({...newInvoice, amount: Number(e.target.value)})} 
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Status</label>
                  <div className="relative">
                    <ChevronDown size={16} strokeWidth={3} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 pr-10 text-xs font-black uppercase tracking-widest text-slate-900 focus:ring-8 focus:ring-blue-500/5 focus:bg-white focus:border-blue-400 outline-none appearance-none cursor-pointer"
                      value={newInvoice.status}
                      onChange={e => setNewInvoice({...newInvoice, status: e.target.value})}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Issue Date</label>
                  <div className="relative">
                    <Calendar size={16} strokeWidth={3} className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500" />
                    <input 
                      type="date" 
                      required 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-900 focus:ring-8 focus:ring-blue-500/5 focus:bg-white focus:border-blue-400 outline-none transition-all" 
                      value={newInvoice.date} 
                      onChange={e => setNewInvoice({...newInvoice, date: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Due Date</label>
                  <div className="relative">
                    <Calendar size={16} strokeWidth={3} className="absolute left-5 top-1/2 -translate-y-1/2 text-amber-500" />
                    <input 
                      type="date" 
                      required 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-900 focus:ring-8 focus:ring-blue-500/5 focus:bg-white focus:border-blue-400 outline-none transition-all" 
                      value={newInvoice.dueDate} 
                      onChange={e => setNewInvoice({...newInvoice, dueDate: e.target.value})} 
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 pt-6 mt-6 border-t border-slate-50 sticky bottom-0 bg-white/80 backdrop-blur-xl -mx-6 md:-mx-8 -mb-6 md:-mb-8 p-6 md:p-8 z-20">
                <button 
                  type="button" 
                  onClick={() => { setShowModal(false); setFormError(''); }} 
                  className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Issuing...
                    </>
                  ) : 'Authorize Issuance'}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* Institutional Termination Modal */}
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal-box-sm p-10 text-center">
            <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-rose-100">
              <Trash2 size={32} className="text-rose-500" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter mb-4">Terminate Invoice?</h2>
            <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed px-4 italic">
              Are you sure you want to delete <strong className="text-slate-900 font-black uppercase tracking-tight">{confirmDelete.name}</strong>? This will remove all institutional records permanently.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setConfirmDelete(null)} 
                className="flex-1 py-3 px-6 rounded-xl bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteInvoice} 
                className="flex-1 py-3 px-6 rounded-xl bg-rose-600 text-white text-xs font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/30 border border-rose-500 active:scale-95"
              >
                Terminate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
