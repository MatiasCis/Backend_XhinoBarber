"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsConfig = void 0;
// config/cors.ts
const cors_1 = __importDefault(require("cors"));
const envs_1 = require("./plugins/envs");
// Configuración de CORS
exports.corsConfig = (0, cors_1.default)({
    origin: envs_1.envs.CLIENT_URL, // Origen permitido (puedes usar una variable de entorno)
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
    credentials: true, // Si necesitas enviar cookies o autenticación
});
