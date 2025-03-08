import { Request, Response } from 'express';
import { ClientDto } from '../../domain/dtos/agendamiento/client-user.dto';
import { AgendamientoService } from '../services/agendamiento.service';



export class AgendamientoController {

constructor (public readonly agendamientoService: AgendamientoService){}

 agendar = (req: Request, res: Response): void => {

    const [error, clientDTO] = ClientDto.create(req.body);

    if (error) {
         res.status(400).json({error});
         return;
    }

    
    this.agendamientoService.agendar(clientDTO!)
    .then((response) => res.json(response))
 }


}