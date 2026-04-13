
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

  // API: Crear preferencia de Mercado Pago
  app.post('/api/payments/create-preference', async (req, res) => {
    try {
      const { items, studentId, payerEmail } = req.body;

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
