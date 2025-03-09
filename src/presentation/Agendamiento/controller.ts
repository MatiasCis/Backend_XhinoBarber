import { Request, Response } from 'express';
import { ClientDto } from '../../domain/dtos/agendamiento/client-user.dto';
import { AgendamientoService } from '../services/agendamiento.service';
import { CustomError } from '../../domain';



export class AgendamientoController {

   constructor(public readonly agendamientoService: AgendamientoService) { }

   private handlerError = (error: unknown, res: Response) => {

      if(error instanceof CustomError){
         res.status(error.statusCode).json({ error: error.message });
         return;
      }
      console.log(`Error: ${error}`);
      return res.status(500).json({ error: 'Internal Server Error' });
   }


   agendar = (req: Request, res: Response): void => {
      const [error, clientDTO] = ClientDto.create(req.body);

      if (error) {
         res.status(400).json({ error });
         return;
      }


      this.agendamientoService.agendar(clientDTO!)
         .then((response) => res.json(response))
         .catch((error) => this.handlerError(error, res));
   }

   confirmState = (req: Request, res: Response): void => {
      const {token} = req.params;
      res.json (token);
      //this.agendamientoService.confirmState(token)
      //.then(()=>res.json(`Cita confirmada`))
      //.catch((error) => this.handlerError(error, res));

   }


}