import { JwtAdapter } from "../../config/plugins";
import { envs } from "../../config/plugins/envs";
import { ClientModel } from "../../data/mongo";
import { ClientDto, CustomError, UserEntity } from "../../domain";
import { EmailService } from './email.service';



export class AgendamientoService {
    constructor(
        private readonly emailService: EmailService,
    ) { }

    public async agendar(clientDto: ClientDto) {
        // Validar que la fecha no esté ocupada
        const dateExists = await ClientModel.findOne({ dateCita: clientDto.dateCita });
        // Si la fecha ya está ocupada, lanzar un error
        if (dateExists) throw CustomError.badRequest('La fecha ya está ocupada');

        try {
            const client = new ClientModel(clientDto);
            const clientEntity = UserEntity.fromObject(client);

            const token = await JwtAdapter.generateToken({ id: clientEntity._id, state: clientEntity.stateCita });
            if (!token) throw CustomError.internalServer('Error al generar el token');



            // Guardar el cliente en la base de datos
            await client.save();
            await this.sendEmailConfirmationDate(clientDto.email);

            return { clientEntity, token };
        }
        catch (error) {
            throw CustomError.internalServer(`Error al agendar la cita: ${error}`);
        }
    }


    private sendEmailConfirmationDate = async (email: string) => {

        const token = await JwtAdapter.generateToken({ email });
        if (!token) throw CustomError.internalServer(`Error al generar el token`);

        const link = `${envs.WEBSERVICE_URL}/confirm-state/${token}`;

        const html = `
        <div style="font-family: Arial, sans-serif; text-align: center; background-color: #f4f4f4; padding: 20px;">
            <div style="background-color: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); width: 100%; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2a2a2a; font-size: 36px;">¡Tu cita ha sido agendada!</h1>
                <p style="color: #555; font-size: 18px; line-height: 1.5;">¡Gracias por elegir a <strong>XhinoBarber</strong>! para tu corte de cabello.</p>
                <p style="color: #555; font-size: 16px;">Para confirmar tu asistencia, por favor haz clic en el siguiente enlace:</p>
                <a href="${link}" style="display: inline-block; padding: 12px 24px; background-color: #ff6600; color: #fff; font-size: 18px; font-weight: bold; text-decoration: none; border-radius: 5px; margin-top: 20px;">Confirmar mi cita</a>
                <p style="color: #777; font-size: 14px; margin-top: 30px;">Si no puedes asistir, por favor ignora este correo.</p>
        
                <p style="color: #555; font-size: 14px; margin-top: 20px;">Puedes contactarme a través de los siguientes medios:</p>
                    <a href="https://www.instagram.com/xhin9._/" style="text-decoration: none;">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/800px-Instagram_icon.png" alt="Instagram" style="width: 40px; height: 40px; filter: grayscale(100%) invert(35%) brightness(0) sepia(100%) contrast(100%);">
                    </a>
                    <a href="https://wa.me/56949524205" style="text-decoration: none;">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1200px-WhatsApp.svg.png" alt="WhatsApp" style="width: 40px; height: 40px; filter: grayscale(100%) invert(35%) brightness(0) sepia(100%) contrast(100%);">
                    </a>
                <p style="color: #555; font-size: 14px; margin-top: 20px;">O si prefieres, puedes llamarnos al número: <strong>+56 9 4952 4205</strong></p>
                
                <footer style="color: #aaa; font-size: 12px; margin-top: 40px;">
                    <p>&copy; 2025 XhinoBarber. Todos los derechos reservados.</p>
                </footer>
            </div>
        </div>
        `;

        const options = {
            to: email,
            subject: 'Confirmación de cita',
            htmlBody: html,
        }

        const isSet = await this.emailService.sendEmail(options);
        if (!isSet) throw CustomError.internalServer('Error al enviar el correo de confirmación');

    }



    public confirmState = async (token: string) => {

        const payload = await JwtAdapter.validateToken(token);
        if (!payload) throw CustomError.badRequest('Token invalido');

        const { state } = payload as { state: string };

        const client = await ClientModel.findOne({ state });

        if (!client) throw CustomError.notFound('Cita no encontrada');

        if (client.stateCita === 'Pendiente') {
            client.stateCita = 'Correo confirmado'
            await client.save(); // Guardar el cambio en la base de datos
            return { message: 'Cita confirmada exitosamente' };
        } else {
            throw CustomError.badRequest('La cita ya está confirmada o tiene otro estado');
        }
    }

}