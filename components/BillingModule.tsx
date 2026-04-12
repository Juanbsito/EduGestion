
import React, { useState, useMemo, useEffect } from 'react';
import { 
  CreditCard, Plus, Search, FileText, CheckCircle2, 
  Clock, AlertCircle, X, Loader2, Save, Printer, 
  Download, Send, Settings, Calendar, DollarSign, ChevronRight,
  MessageCircle, Mail, UserPlus, ChevronDown, CreditCard as CardIcon,
  Wallet, Landmark, Share2, GraduationCap
} from 'lucide-react';
import { Payment, AcademicLevel, Student } from '../types';
import { INITIAL_STUDENTS, LEVEL_FEES as INITIAL_LEVEL_FEES } from '../constants';
import { supabase } from '../supabaseClient';

const BillingModule: React.FC<{ view: 'fees' | 'config' }> = ({ view }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [levelFees, setLevelFees] = useState(INITIAL_LEVEL_FEES);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showReceipt, setShowReceipt] = useState<Payment | null>(null);
  const [showManualFeeModal, setShowManualFeeModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showMassGenModal, setShowMassGenModal] = useState(false);
  const [showSendOptions, setShowSendOptions] = useState<Payment | null>(null);
  
  // Filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  // Loading states
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [paymentData, setPaymentData] = useState({
    method: 'Efectivo' as 'Efectivo' | 'Tarjeta' | 'Transferencia',
    receipt: ''
  });

  const [manualFee, setManualFee] = useState({
    studentId: '',
    concept: 'Cuota Mensual',
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0]
  });

  const [configData, setConfigData] = useState({
    level: '' as any,
    year: '2026',
    monthlyFee: 50000,
    annualEnrollment: 100000,
    dueDay: 10
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: payData } = await supabase.from('payments').select('*');
    const { data: stData } = await supabase.from('students').select('*');
    setPayments(payData || []);
    setStudents(stData || []);
    setLoading(false);
  };

  // Filter logic
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const student = students.find(s => s.id === p.studentId);
      const studentName = `${student?.firstName} ${student?.lastName}`.toLowerCase();
      const matchesSearch = studentName.includes(searchTerm.toLowerCase()) || 
                           student?.dni.includes(searchTerm) || 
                           p.concept.toLowerCase().includes(searchTerm.toLowerCase());
      
      const isVencida = !p.isPaid && new Date(p.dueDate) < new Date();
      let matchesStatus = true;
      if (statusFilter === 'Pagadas') matchesStatus = p.isPaid;
      if (statusFilter === 'Pendientes') matchesStatus = !p.isPaid && !isVencida;
      if (statusFilter === 'Vencidas') matchesStatus = isVencida;

      return matchesSearch && matchesStatus;
    });
  }, [payments, searchTerm, statusFilter, students]);

  const handleOpenPay = (p: Payment) => {
    setSelectedPayment(p);
    setPaymentData({ 
      method: 'Efectivo', 
      receipt: `REC-${Math.floor(Math.random() * 900000) + 100000}` 
    });
  };

  const processPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;
    setActionLoading(true);
    
    const updatedPayment: Payment = { 
      ...selectedPayment, 
      isPaid: true, 
      status: 'Pagada' as const, 
      paymentMethod: paymentData.method, 
      receiptNumber: paymentData.receipt, 
      paidAt: new Date().toISOString() 
    };
    
    await supabase.from('payments').update(updatedPayment).eq('id', selectedPayment.id);
    
    await fetchData();
    setActionLoading(false);
    setSelectedPayment(null);
    setShowReceipt(updatedPayment);
  };

  const createManualFee = async () => {
    if (!manualFee.studentId || manualFee.amount <= 0) return;
    setActionLoading(true);
    
    const newFee: any = {
      studentId: manualFee.studentId,
      concept: manualFee.concept,
      amount: manualFee.amount,
      dueDate: manualFee.dueDate,
      status: 'Pendiente',
      isPaid: false,
      school_id: 'school-1'
    };
    
    await supabase.from('payments').insert(newFee);
    await fetchData();
    
    setActionLoading(false);
    setShowManualFeeModal(false);
  };

  const runMassGeneration = async () => {
    setActionLoading(true);
    const activeStudents = students.filter(s => s.status === 'ACTIVE');
    
    const newFees: any[] = activeStudents.map(s => ({
      studentId: s.id,
      concept: 'Cuota Marzo 2026',
      amount: levelFees[s.level] || 0,
      dueDate: '2026-03-10',
      status: 'Pendiente',
      isPaid: false,
      school_id: 'school-1'
    }));

    await supabase.from('payments').insert(newFees);
    await fetchData();

    setActionLoading(false);
    setShowMassGenModal(false);
  };

  const handleEditArancel = (level: AcademicLevel) => {
    setConfigData({
      level,
      year: '2026',
      monthlyFee: levelFees[level],
      annualEnrollment: 100000,
      dueDay: 10
    });
    setShowConfigModal(true);
  };

  const saveConfig = () => {
    if (!configData.level) return;
    setLevelFees({
      ...levelFees,
      [configData.level]: configData.monthlyFee
    });
    setShowConfigModal(false);
  };

  const handleDownload = (p: Payment) => {
    alert(`Iniciando descarga de comprobante ${p.receiptNumber}...`);
  };

  const handleSendAction = (type: 'whatsapp' | 'email') => {
    const method = type === 'whatsapp' ? 'WhatsApp' : 'Email';
    alert(`Comprobante enviado vía ${method} al tutor responsable.`);
    setShowSendOptions(null);
  };

  const ReceiptView = ({ payment, onClose }: { payment: Payment, onClose: () => void }) => {
    const student = students.find(s => s.id === payment.studentId);
    const generationDate = new Date().toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const paymentDateFormatted = payment.paidAt 
      ? new Date(payment.paidAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
      : '-';

    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-modal relative">
          <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
          
          <h2 className="text-xl font-bold text-slate-900 mb-6">Comprobante de Pago</h2>

          <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-8 space-y-8">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                  <GraduationCap size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">GestiónEscolar</h3>
                  <p className="text-xs font-medium text-slate-400">Recibo de Pago</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">N° Recibo</p>
                <p className="text-sm font-bold text-indigo-600">{payment.receiptNumber || '-'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alumno</p>
                <p className="text-sm font-bold text-slate-800">{student?.firstName} {student?.lastName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">DNI</p>
                <p className="text-sm font-bold text-slate-800">{student?.dni}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nivel</p>
                <p className="text-sm font-bold text-slate-800">{student?.level}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grado/Año</p>
                <p className="text-sm font-bold text-slate-800">{student?.grade} {student?.division ? ` - ${student.division}` : ''}</p>
              </div>
            </div>

            <div className="bg-[#F8FAFC] rounded-[2rem] p-8 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Concepto:</span>
                <span className="text-slate-800 font-bold">{payment.concept}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Fecha de Pago:</span>
                <span className="text-slate-800 font-bold">{paymentDateFormatted}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Método de Pago:</span>
                <span className="text-slate-800 font-bold">{payment.paymentMethod || '-'}</span>
              </div>
              
              <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-base font-bold text-slate-900">Total Pagado:</span>
                <span className="text-2xl font-black text-emerald-600">$ {payment.amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="text-center space-y-1">
              <p className="text-[10px] font-medium text-slate-400">Comprobante generado el {generationDate}</p>
              <p className="text-[10px] font-medium text-slate-400 italic">Este recibo es válido como comprobante de pago</p>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button 
              onClick={() => setShowSendOptions(payment)}
              className="flex-1 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
            >
              <Share2 size={18} /> Compartir
            </button>
            <button 
              onClick={() => window.print()}
              className="flex-1 py-4 bg-[#1e293b] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl hover:bg-slate-800 transition-all"
            >
              <Printer size={18} /> Imprimir
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-slate-900" size={32} />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {showReceipt && <ReceiptView payment={showReceipt} onClose={() => setShowReceipt(null)} />}
      
      {/* Modal Proceso de Cobro - Ajustado a max-w-sm */}
      {selectedPayment && !showReceipt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-8 animate-modal space-y-6 relative">
            <button onClick={() => setSelectedPayment(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Registrar Cobro</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Concepto: {selectedPayment.concept}</p>
            </div>

            <form onSubmit={processPayment} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medio de Pago</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Efectivo', icon: Wallet },
                    { id: 'Tarjeta', icon: CardIcon },
                    { id: 'Transferencia', icon: Landmark }
                  ].map(method => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentData({...paymentData, method: method.id as any})}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                        paymentData.method === method.id 
                          ? 'border-[#1e293b] bg-slate-50 text-[#1e293b] font-bold ring-1 ring-[#1e293b]' 
                          : 'border-slate-100 text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      <method.icon size={20} className="mb-1" />
                      <span className="text-[10px] uppercase tracking-tighter">{method.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">N° Comprobante / Ref.</label>
                <input 
                  required
                  type="text"
                  value={paymentData.receipt}
                  onChange={e => setPaymentData({...paymentData, receipt: e.target.value})}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1e293b] transition-all font-bold" 
                  placeholder="Referencia"
                />
              </div>

              <div className="p-4 bg-slate-900 rounded-2xl text-white flex justify-between items-center shadow-lg">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Monto</span>
                <span className="text-xl font-black">$ {selectedPayment.amount.toLocaleString()}</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setSelectedPayment(null)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-widest">Cancelar</button>
                <button 
                  type="submit" 
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-[#1e293b] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Enviar (Share) - Ajustado a un tamaño más compacto */}
      {showSendOptions && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-[320px] w-full p-8 animate-modal text-center relative">
            <button onClick={() => setShowSendOptions(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Compartir Recibo</h3>
            <p className="text-[11px] text-slate-500 mb-6 font-medium leading-relaxed">Seleccione el medio de envío para el tutor del alumno.</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => handleSendAction('whatsapp')} className="flex flex-col items-center gap-3 p-5 bg-emerald-50 border border-emerald-100 rounded-2xl group hover:bg-emerald-600 transition-all">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors shadow-sm">
                  <MessageCircle size={24} />
                </div>
                <span className="text-[10px] font-black uppercase text-emerald-700 group-hover:text-white">WhatsApp</span>
              </button>
              <button onClick={() => handleSendAction('email')} className="flex flex-col items-center gap-3 p-5 bg-blue-50 border border-blue-100 rounded-2xl group hover:bg-blue-600 transition-all">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors shadow-sm">
                  <Mail size={24} />
                </div>
                <span className="text-[10px] font-black uppercase text-blue-700 group-hover:text-white">Email</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nueva Configuración - Ajustado a max-w-sm */}
      {showConfigModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-8 animate-modal space-y-6 relative">
            <button onClick={() => setShowConfigModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-slate-900">Aranceles</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nivel</label>
                <div className="relative">
                  <select 
                    value={configData.level}
                    onChange={e => setConfigData({...configData, level: e.target.value as AcademicLevel})}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs appearance-none outline-none focus:border-[#1e293b] transition-all pr-8 font-bold"
                  >
                    <option value="">Nivel</option>
                    {Object.values(AcademicLevel).map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Año</label>
                <div className="relative">
                  <select 
                    value={configData.year}
                    onChange={e => setConfigData({...configData, year: e.target.value})}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs appearance-none outline-none focus:border-[#1e293b] transition-all pr-8 font-bold"
                  >
                    <option>2026</option>
                    <option>2027</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cuota Mensual</label>
              <input 
                type="number"
                value={configData.monthlyFee}
                onChange={e => setConfigData({...configData, monthlyFee: parseInt(e.target.value)})}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1e293b] transition-all font-bold" 
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Matrícula Anual</label>
              <input 
                type="number"
                value={configData.annualEnrollment}
                onChange={e => setConfigData({...configData, annualEnrollment: parseInt(e.target.value)})}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1e293b] transition-all font-bold" 
                placeholder="0"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowConfigModal(false)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-widest">Cancelar</button>
              <button onClick={saveConfig} className="flex-1 py-3 bg-[#1e293b] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cuota Manual - Ajustado a max-w-sm */}
      {showManualFeeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-8 animate-modal space-y-6 relative">
             <button onClick={() => setShowManualFeeModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-slate-900">Nueva Cuota</h3>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alumno</label>
              <div className="relative">
                <select 
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs appearance-none outline-none focus:border-[#1e293b] pr-8 font-bold"
                  value={manualFee.studentId}
                  onChange={e => setManualFee({...manualFee, studentId: e.target.value})}
                >
                  <option value="">Seleccione alumno...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.lastName}, {s.firstName}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Concepto</label>
              <input 
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1e293b] font-bold" 
                value={manualFee.concept}
                onChange={e => setManualFee({...manualFee, concept: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monto</label>
                <input 
                  type="number"
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1e293b] font-bold" 
                  value={manualFee.amount}
                  onChange={e => setManualFee({...manualFee, amount: parseInt(e.target.value)})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vencimiento</label>
                <input 
                  type="date"
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-[#1e293b] font-bold" 
                  value={manualFee.dueDate}
                  onChange={e => setManualFee({...manualFee, dueDate: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowManualFeeModal(false)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-widest">Cancelar</button>
              <button onClick={createManualFee} className="flex-1 py-3 bg-[#1e293b] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg">Crear</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Generación Masiva - Ajustado a max-w-[340px] */}
      {showMassGenModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-[340px] w-full p-8 animate-modal text-center space-y-6">
            <div className="w-16 h-16 bg-slate-50 text-slate-900 rounded-full flex items-center justify-center mx-auto border border-slate-100">
               <Calendar size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Generar Cuotas</h3>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Se generarán cuotas para los <strong>{students.filter(s => s.status === 'ACTIVE').length} alumnos activos</strong> del ciclo Marzo 2026.</p>
            </div>
            <div className="flex gap-3">
               <button onClick={() => setShowMassGenModal(false)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-widest">Cancelar</button>
               <button onClick={runMassGeneration} disabled={actionLoading} className="flex-1 py-3 bg-[#1e293b] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2">
                  {actionLoading ? <Loader2 className="animate-spin" size={16} /> : 'Confirmar'}
               </button>
            </div>
          </div>
        </div>
      )}

      {view === 'fees' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="text-slate-900 bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
                <CreditCard size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Gestión de Cuotas</h2>
                <p className="text-sm text-slate-500 font-medium">Control de ingresos y cuentas corrientes por alumno</p>
              </div>
            </div>
            <button 
              onClick={() => setShowManualFeeModal(true)} 
              className="bg-[#1e293b] text-white px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg hover:bg-slate-800 transition-all"
            >
              <UserPlus size={18} /> Crear Cuota Manual
            </button>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar alumno, DNI o concepto..." 
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#1e293b] transition-all font-medium" 
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative">
                <select 
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-5 py-3 text-sm appearance-none pr-10 outline-none focus:border-[#1e293b] font-bold"
                >
                  <option>Todos</option>
                  <option>Pagadas</option>
                  <option>Pendientes</option>
                  <option>Vencidas</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Alumno</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Concepto</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Monto</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredPayments.map(p => {
                    const student = students.find(s => s.id === p.studentId);
                    const isVencida = !p.isPaid && new Date(p.dueDate) < new Date();
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{student?.lastName}, {student?.firstName}</p>
                          <p className="text-[11px] text-slate-400 font-bold">{student?.dni}</p>
                        </td>
                        <td className="px-6 py-4 text-center text-slate-600 font-bold">{p.concept}</td>
                        <td className="px-6 py-4 text-center font-black text-slate-900">$ {p.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                            p.isPaid ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                            isVencida ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                            {p.isPaid ? 'Pagada' : isVencida ? 'Vencida' : 'Pendiente'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {p.isPaid ? (
                            <button 
                              onClick={() => setShowReceipt(p)}
                              className="text-slate-900 font-bold text-[11px] flex items-center gap-1.5 ml-auto hover:underline transition-all"
                            >
                              <Printer size={14} /> VER RECIBO
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleOpenPay(p)}
                              className="bg-[#1e293b] text-white px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md"
                            >
                              Cobrar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredPayments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-20 text-center text-slate-400 font-bold italic">No se encontraron cuotas registradas.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="text-slate-900 bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
                <Settings size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Aranceles</h2>
                <p className="text-sm text-slate-500 font-medium">Definición de costos educativos por nivel y ciclo lectivo</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setConfigData({ level: AcademicLevel.INITIAL, year: '2026', monthlyFee: levelFees[AcademicLevel.INITIAL], annualEnrollment: 100000, dueDay: 10 });
                setShowConfigModal(true);
              }}
              className="bg-[#1e293b] text-white px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg hover:bg-slate-800 transition-all"
            >
              <Plus size={18} /> Nueva Configuración
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(levelFees).map(([level, amount]) => (
              <div key={level} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm relative group">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{level}</p>
                <h4 className="text-2xl font-black text-slate-900 mb-6">$ {amount.toLocaleString()}</h4>
                <button 
                  onClick={() => handleEditArancel(level as AcademicLevel)}
                  className="text-[10px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-1.5 hover:gap-2.5 transition-all"
                >
                  Editar Arancel <ChevronRight size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="bg-[#1e293b] text-white rounded-[2rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Calendar size={120} />
            </div>
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm border border-white/10">
                <Calendar size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight">Generar Facturación Mensual</h3>
                <p className="text-slate-400 text-sm mt-1 font-medium">Procesar automáticamente la cuota de Marzo 2026 para todos los alumnos.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowMassGenModal(true)}
              className="px-10 py-5 bg-white text-slate-900 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all shadow-xl relative z-10 whitespace-nowrap"
            >
              Iniciar Proceso Masivo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingModule;
