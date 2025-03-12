// config/cors.ts
import cors from 'cors';

// Configuración de CORS
export const corsConfig = cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
   allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authentication, Access-Control-Allow-Credentials, Authorization',
  credentials: true,
});
