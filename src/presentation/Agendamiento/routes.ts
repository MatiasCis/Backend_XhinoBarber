import { Router } from "express";
import { AgendamientoController } from "./controller";
import { EmailService, AgendamientoService } from "../services";
import { envs } from "../../config/plugins/envs";


export class AgendamientoRoutes {


    static get routes(): Router {
        const router = Router();
        const emailService = new EmailService(
            envs.MAILER_SERVICE,
            envs.MAILER_EMAIL,
            envs.MAILER_SECRET_KEY
        );
        const agendamientoService = new AgendamientoService(emailService);
        const controller = new AgendamientoController(agendamientoService);
        
        router.post('/agendamiento', controller.agendar);
        router.get('/agendamiento', controller.getEventos);
        router.get('/confirm-state/:token', controller.confirmState);

        return router;
    }
}
