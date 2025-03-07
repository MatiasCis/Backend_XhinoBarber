import { Request, Response } from 'express';



export class AgendamientoController {

constructor (){}

agendar = (req: Request, res: Response) => {

    res.json('agendar');

}


}