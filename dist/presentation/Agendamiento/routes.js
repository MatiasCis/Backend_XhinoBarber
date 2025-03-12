"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgendamientoRoutes = void 0;
const express_1 = require("express");
const controller_1 = require("./controller");
const services_1 = require("../services");
const envs_1 = require("../../config/plugins/envs");
class AgendamientoRoutes {
    static get routes() {
        const router = (0, express_1.Router)();
        const emailService = new services_1.EmailService(envs_1.envs.MAILER_SERVICE, envs_1.envs.MAILER_EMAIL, envs_1.envs.MAILER_SECRET_KEY);
        const agendamientoService = new services_1.AgendamientoService(emailService);
        const controller = new controller_1.AgendamientoController(agendamientoService);
        router.post('/agendamiento', controller.agendar);
        router.get('/agendamiento', controller.getEventos);
        router.get('/confirm-state/:token', controller.confirmState);
        router.get('/cancelar-cita/:token', controller.cancelarCita);
        return router;
    }
}
exports.AgendamientoRoutes = AgendamientoRoutes;
