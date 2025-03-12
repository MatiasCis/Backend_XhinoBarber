"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgendamientoController = void 0;
const client_user_dto_1 = require("../../domain/dtos/agendamiento/client-user.dto");
const domain_1 = require("../../domain");
class AgendamientoController {
    constructor(agendamientoService) {
        this.agendamientoService = agendamientoService;
        this.handlerError = (error, res) => {
            if (error instanceof domain_1.CustomError) {
                res.status(error.statusCode).json({ error: error.message });
                return;
            }
            console.log(`Error: ${error}`);
            return res.status(500).json({ error: 'Internal Server Error' });
        };
        this.agendar = (req, res) => {
            const [error, clientDTO] = client_user_dto_1.ClientDto.create(req.body);
            if (error) {
                res.status(400).json({ error });
                return;
            }
            this.agendamientoService.agendar(clientDTO)
                .then((response) => res.json(response))
                .catch((error) => this.handlerError(error, res));
        };
        this.getEventos = (req, res) => {
            this.agendamientoService.obtenerEventos()
                .then((eventos) => res.json(eventos))
                .catch((error) => this.handlerError(error, res));
        };
        this.confirmState = (req, res) => {
            const { token } = req.params;
            this.agendamientoService.confirmState(token)
                .then(() => res.json(`Cita confirmada`))
                .catch((error) => this.handlerError(error, res));
        };
        this.cancelarCita = (req, res) => {
            const { token } = req.params;
            this.agendamientoService.cancelarCita(token)
                .then((response) => res.json(response))
                .catch((error) => this.handlerError(error, res));
        };
    }
}
exports.AgendamientoController = AgendamientoController;
