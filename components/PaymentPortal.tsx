
import React, { useState } from 'react';
import { Search, CreditCard, QrCode, AlertCircle, CheckCircle2, Loader2, ArrowRight, User } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Student, Payment } from '../types';

const PaymentPortal = () => {
  const [step, setStep] = useState<'search' | 'verify' | 'pay'>('search');
  const [studentDni, setStudentDni] = useState('');
  const [payerDni, setPayerDni] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('dni', studentDni)
        .single();

      if (studentError || !studentData) {
        throw new Error('No se encontró ningún alumno con ese DNI.');
      }

      // Verify Payer DNI matches tutor or additional tutors
      const isMainTutor = studentData.tutorDni === payerDni;
      const isAdditionalTutor = studentData.additionalTutors?.some((t: any) => t.dni === payerDni);

      if (!isMainTutor && !isAdditionalTutor) {
        throw new Error('El DNI del pagador no coincide con los tutores registrados para este alumno.');
      }

      setStudent(studentData);
      
      const { data: paymentData } = await supabase
        .from('payments')
        .select('*')
        .eq('studentId', studentData.id)
        .eq('isPaid', false);

      setPayments(paymentData || []);
      setStep('verify');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    if (selectedPayments.length === 0) return;
    setStep('pay');
  };

  const confirmPayment = async () => {
    setLoading(true);
    // Simulate payment processing and QR generation
    setTimeout(async () => {
      try {
        // In a real app, we would update the payments in Supabase
        // await Promise.all(selectedPayments.map(id => 
        //   supabase.from('payments').update({ isPaid: true, status: 'Pagada', paidAt: new Date().toISOString() }).eq('id', id)
        // ));
        setPaymentSuccess(true);
      } catch (err) {
        setError('Error al procesar el pago.');
      } finally {
        setLoading(false);
      }
    }, 2000);
  };

  if (paymentSuccess) {
    return (
      <div className="max-w-md mx-auto bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-50">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">¡Pago Exitoso!</h2>
        <p className="text-slate-500 mt-2 font-medium">Se ha generado el comprobante y se ha enviado por correo electrónico.</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-8 w-full bg-slate-900 text-white p-4 rounded-2xl font-bold hover:bg-slate-800 transition-all"
        >
          Realizar otro pago
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Portal de Pagos</h1>
        <p className="text-slate-500 font-medium mt-2">Gestiona las cuotas de tu hijo/a de forma segura</p>
      </div>

      {step === 'search' && (
        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 animate-in slide-in-from-bottom-4 duration-500">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">DNI del Alumno</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    required
                    type="text"
                    placeholder="Ej: 45678912"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={studentDni}
                    onChange={e => setStudentDni(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">DNI del Tutor (Pagador)</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    required
                    type="text"
                    placeholder="Ej: 12345678"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={payerDni}
                    onChange={e => setPayerDni(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold border border-rose-100">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Consultar Deuda'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>
      )}

      {step === 'verify' && student && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl">
              {student.firstName[0]}{student.lastName[0]}
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{student.firstName} {student.lastName}</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{student.level} - {student.grade}</p>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 bg-slate-50/50">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Cuotas Pendientes</h3>
            </div>
            <div className="p-2">
              {payments.length === 0 ? (
                <div className="p-12 text-center">
                  <CheckCircle2 className="mx-auto text-emerald-500 mb-4" size={48} />
                  <p className="font-bold text-slate-800">¡No hay deudas pendientes!</p>
                  <p className="text-sm text-slate-400 mt-1">El alumno se encuentra al día con sus pagos.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {payments.map(payment => (
                    <label 
                      key={payment.id}
                      className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${
                        selectedPayments.includes(payment.id) ? 'bg-indigo-50 border-indigo-100' : 'hover:bg-slate-50 border-transparent'
                      } border`}
                    >
                      <div className="flex items-center gap-4">
                        <input 
                          type="checkbox"
                          className="w-5 h-5 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          checked={selectedPayments.includes(payment.id)}
                          onChange={() => {
                            if (selectedPayments.includes(payment.id)) {
                              setSelectedPayments(selectedPayments.filter(id => id !== payment.id));
                            } else {
                              setSelectedPayments([...selectedPayments, payment.id]);
                            }
                          }}
                        />
                        <div>
                          <p className="font-bold text-slate-800">{payment.concept}</p>
                          <p className="text-xs text-slate-400 font-medium">Vence: {new Date(payment.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-900">${payment.amount.toLocaleString()}</p>
                        {new Date(payment.dueDate) < new Date() && (
                          <span className="text-[10px] font-black text-rose-500 uppercase tracking-tighter">Vencida</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {payments.length > 0 && (
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Total a pagar</p>
                  <p className="text-2xl font-black">
                    ${payments
                      .filter(p => selectedPayments.includes(p.id))
                      .reduce((sum, p) => sum + p.amount, 0)
                      .toLocaleString()}
                  </p>
                </div>
                <button 
                  onClick={handlePayment}
                  disabled={selectedPayments.length === 0}
                  className="bg-white text-slate-900 px-8 py-3 rounded-xl font-black text-sm hover:bg-indigo-50 transition-all disabled:opacity-50"
                >
                  Pagar Ahora
                </button>
              </div>
            )}
          </div>
          <button onClick={() => setStep('search')} className="text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors">
            ← Volver a buscar
          </button>
        </div>
      )}

      {step === 'pay' && (
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-500">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-8">Selecciona Medio de Pago</h2>
          
          <div className="grid grid-cols-1 gap-4 mb-10">
            <button className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border-2 border-transparent hover:border-indigo-500 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-indigo-600">
                  <QrCode size={24} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900">QR / Transferencia</p>
                  <p className="text-xs text-slate-400 font-medium">Acreditación inmediata</p>
                </div>
              </div>
              <ArrowRight className="text-slate-300 group-hover:text-indigo-500 transition-colors" size={20} />
            </button>

            <button className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border-2 border-transparent hover:border-indigo-500 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-indigo-600">
                  <CreditCard size={24} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900">Tarjeta de Débito/Crédito</p>
                  <p className="text-xs text-slate-400 font-medium">Link de pago seguro</p>
                </div>
              </div>
              <ArrowRight className="text-slate-300 group-hover:text-indigo-500 transition-colors" size={20} />
            </button>
          </div>

          <div className="bg-indigo-50 p-6 rounded-3xl mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-white rounded-2xl shadow-sm">
                <QrCode size={120} className="text-slate-900" />
              </div>
            </div>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Escanea para pagar</p>
          </div>

          <div className="space-y-3">
            <button 
              onClick={confirmPayment}
              disabled={loading}
              className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Confirmar Pago'}
            </button>
            <button 
              onClick={() => setStep('verify')}
              className="w-full text-slate-400 font-bold text-sm p-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPortal;
