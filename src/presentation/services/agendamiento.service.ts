import { ClientModel } from "../../data/mongo";
import { ClientDto, CustomError, UserEntity } from "../../domain";



export class AgendamientoService {
    constructor (){}

    public async agendar( clientDto: ClientDto ) {
        // Validar que la fecha no esté ocupada
        const dateExists = await ClientModel.findOne({ dateCita: clientDto.dateCita });
        // Si la fecha ya está ocupada, lanzar un error
        if (dateExists) throw CustomError.badRequest('La fecha ya está ocupada');

        try {
            const client = new ClientModel(clientDto);
            const clientEntity = UserEntity.fromObject(client);
            // Guardar el cliente en la base de datos
            await client.save();

            return clientEntity;
        }
        catch (error) {
            throw CustomError.internalServer(`Error al agendar la cita: ${error}`);
        }
    }
}