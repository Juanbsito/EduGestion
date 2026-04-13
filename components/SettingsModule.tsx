
import React, { useState, useEffect } from 'react';
import { Save, Shield, CreditCard, Key, Loader2, CheckCircle2, AlertCircle, Building, Lock } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { SchoolSettings } from '../types';
import { useAuth } from '../authContext';

interface SettingsModuleProps {
  schoolId: string;
}

const SettingsModule: React.FC<SettingsModuleProps> = ({ schoolId }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [settings, setSettings] = useState<Partial<SchoolSettings>>({
    mp_access_token: '',
    macro_site_id: '',
    macro_secret_key: ''
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, [schoolId]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('school_settings')
        .select('*')
        .eq('school_id', schoolId)
        .single();

      if (data) {
        setSettings(data);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const initiateSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      // Enviar código de verificación al mail del superadmin
      const response = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email })
      });

      if (response.ok) {
        setShowVerifyModal(true);
      } else {
        throw new Error('No se pudo enviar el código de verificación.');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyAndSave = async () => {
    setSaving(true);
    try {
      const verifyRes = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email, code: verificationCode })
      });

      if (!verifyRes.ok) {
        throw new Error('Código de verificación incorrecto o expirado.');
      }

      const payload = {
        ...settings,
        school_id: schoolId,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('school_settings')
        .update(payload)
        .eq('school_id', schoolId);

      if (error) {
        await supabase.from('school_settings').insert(payload);
      }

      setMessage({ type: 'success', text: 'Configuración guardada correctamente.' });
      setShowVerifyModal(false);
      setVerificationCode('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Modal de Verificación */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
            <div className="bg-indigo-600 p-8 text-center text-white">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield size={32} />
              </div>
              <h3 className="text-xl font-black">Verifica tu Identidad</h3>
              <p className="text-indigo-100 text-xs font-bold mt-2 uppercase tracking-widest opacity-80">Seguridad Superadmin</p>
            </div>
            <div className="p-8 space-y-6">
              <div className="text-center">
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Hemos enviado un código de 6 dígitos a <br/>
                  <span className="font-bold text-slate-900">{user?.email}</span>
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text"
                    maxLength={6}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-2xl font-black tracking-[0.5em] outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value)}
                  />
                </div>
                
                <button 
                  onClick={handleVerifyAndSave}
                  disabled={saving || verificationCode.length < 6}
                  className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
                >
                  {saving ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                  Confirmar y Guardar
                </button>
                
                <button 
                  onClick={() => setShowVerifyModal(false)}
                  className="w-full text-slate-400 text-xs font-bold hover:text-slate-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Configuración de la Institución</h2>
        <p className="text-sm text-slate-400 font-medium">Gestiona las llaves de API y pasarelas de pago</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      <form onSubmit={initiateSave} className="space-y-6">
        <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <CreditCard size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Pasarelas de Pago</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <img src="https://www.mercadopago.com/org-img/MP3/home/logomp3.gif" alt="MP" className="h-4" />
                <label className="text-sm font-bold text-slate-800">Mercado Pago - Access Token</label>
              </div>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="APP_USR-..."
                  value={settings.mp_access_token || ''}
                  onChange={e => setSettings({...settings, mp_access_token: e.target.value})}
                />
              </div>
              <p className="text-[10px] text-slate-400 font-medium ml-1 italic">
                * Solo el Superadmin puede ver y editar esta clave. Se utiliza para generar links de pago reales.
              </p>
            </div>

            <div className="pt-6 border-t border-slate-50">
              <div className="flex items-center gap-2 mb-4">
                <Building size={18} className="text-slate-400" />
                <label className="text-sm font-bold text-slate-800">Banco Macro (Macro Click)</label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Site ID</label>
                  <input 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="ID de Comercio"
                    value={settings.macro_site_id || ''}
                    onChange={e => setSettings({...settings, macro_site_id: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Secret Key</label>
                  <input 
                    type="password"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="••••••••••••"
                    value={settings.macro_secret_key || ''}
                    onChange={e => setSettings({...settings, macro_secret_key: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button 
            disabled={saving}
            className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Guardar Cambios
          </button>
        </div>
      </form>

      <div className="mt-12 p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-4">
        <div className="p-2 bg-amber-100 text-amber-600 h-fit rounded-xl">
          <Shield size={20} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-amber-900">Seguridad de las Claves</h4>
          <p className="text-xs text-amber-700 mt-1 leading-relaxed">
            Las llaves de API se almacenan de forma segura y solo se utilizan en el servidor para procesar transacciones. 
            Nunca compartas tu Access Token con nadie. Si sospechas que ha sido comprometido, revócalo desde el panel de Mercado Pago Developers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsModule;
