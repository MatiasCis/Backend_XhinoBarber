// config/cors.ts
import cors from 'cors';
import { envs } from "./plugins/envs";

// Configuración de CORS
export const corsConfig = cors({
  origin: envs.CLIENT_URL, // Origen permitido (puedes usar una variable de entorno)
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
  credentials: true, // Si necesitas enviar cookies o autenticación
  allowedHeaders: ['Content-Type'],  // Encabezados permitidos
});