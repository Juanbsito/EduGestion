
import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { MercadoPagoConfig, Preference } from 'mercadopago';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Configuración de Mercado Pago
  // NOTA: En producción, estas llaves deben estar en .env
  const client = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-YOUR-ACCESS-TOKEN' 
  });

  // --- SEGURIDAD: Verificación por Email ---
  const verificationCodes = new Map<string, { code: string, expires: number }>();

  app.post('/api/auth/send-verification-code', async (req, res) => {
    const { email } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // En producción, aquí se usaría Resend, SendGrid o Nodemailer
    console.log(`[EMAIL SIMULADO] Enviando código ${code} a ${email}`);
    
    verificationCodes.set(email, { 
      code, 
      expires: Date.now() + 10 * 60 * 1000 // 10 minutos
    });

    res.json({ success: true, message: 'Código enviado' });
  });

  app.post('/api/auth/verify-code', async (req, res) => {
    const { email, code } = req.body;
    const stored = verificationCodes.get(email);

    if (stored && stored.code === code && stored.expires > Date.now()) {
      verificationCodes.delete(email);
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, error: 'Código inválido o expirado' });
    }
  });

  // API: Crear preferencia de Mercado Pago
  app.post('/api/payments/create-preference', async (req, res) => {
    try {
      const { items, studentId, payerEmail } = req.body;

      // --- LÓGICA DE PRODUCCIÓN ---
      // 1. Obtener el school_id del alumno desde la base de datos
      // 2. Consultar la tabla 'school_settings' para obtener el mp_access_token de esa escuela
      // const { data: settings } = await supabase.from('school_settings').select('mp_access_token').eq('school_id', schoolId).single();
      // const accessToken = settings?.mp_access_token || process.env.MP_ACCESS_TOKEN;
      
      const accessToken = process.env.MP_ACCESS_TOKEN || 'TEST-YOUR-ACCESS-TOKEN';
      const client = new MercadoPagoConfig({ accessToken });

      const preference = new Preference(client);
      const result = await preference.create({
        body: {
          items: items.map((item: any) => ({
            id: item.id,
            title: item.concept,
            unit_price: Number(item.amount),
            quantity: 1,
            currency_id: 'ARS'
          })),
          back_urls: {
            success: `${req.headers.origin}/payment-success`,
            failure: `${req.headers.origin}/payment-failure`,
            pending: `${req.headers.origin}/payment-pending`,
          },
          auto_return: 'approved',
          notification_url: `${req.headers.origin}/api/payments/webhook`,
          external_reference: studentId,
          payer: {
            email: payerEmail
          }
        }
      });

      res.json({ init_point: result.init_point });
    } catch (error) {
      console.error('Error MP:', error);
      res.status(500).json({ error: 'Error al crear la preferencia de pago' });
    }
  });

  // API: Webhook para recibir notificaciones de pago
  app.post('/api/payments/webhook', async (req, res) => {
    const { query } = req;
    const topic = query.topic || query.type;

    console.log('Webhook recibido:', topic, query.id);
    
    // Aquí se validaría el pago con Mercado Pago y se actualizaría Supabase
    // if (topic === 'payment') { ... }

    res.sendStatus(200);
  });

  // Configuración de Vite para desarrollo
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor EduManager Pro corriendo en http://localhost:${PORT}`);
  });
}

startServer();
