import { Router } from "express";
import { AgendamientoRoutes } from "./Agendamiento/routes";


export class AppRoutes {


    static get routes(): Router {
        const router = Router();

        router.use('/api', AgendamientoRoutes.routes);

        return router;
    }



}