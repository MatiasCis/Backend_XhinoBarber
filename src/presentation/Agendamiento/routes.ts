import { Router } from "express";
import { AgendamientoController } from "./controller";


export class AgendamientoRoutes {


    static get routes(): Router {
        const router = Router();

        const controller = new AgendamientoController();

        router.post('/agendamiento', controller.agendar);


        return router;
    }



}