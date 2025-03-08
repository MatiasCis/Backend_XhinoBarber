import { Router } from "express";
import { AgendamientoController } from "./controller";
import { AgendamientoService } from "../services/agendamiento.service";


export class AgendamientoRoutes {


    static get routes(): Router {
        const router = Router();
        const agendamientoService = new AgendamientoService();
        const controller = new AgendamientoController(agendamientoService);
        

        router.post('/agendamiento', controller.agendar);


        return router;
    }
}
