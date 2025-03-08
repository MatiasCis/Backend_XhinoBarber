import { ClientModel } from "../../data/mongo";
import { ClientDto, CustomError } from "../../domain";



export class AgendamientoService {
    constructor (){}

    public async agendar( clientDto: ClientDto ) {
        const dateExists = await ClientModel.findOne({}).where('date').equals(clientDto.dateCita);

        if (dateExists) throw CustomError.badRequest('La fecha ya está ocupada');

        return 'todo ok!';
    }

}