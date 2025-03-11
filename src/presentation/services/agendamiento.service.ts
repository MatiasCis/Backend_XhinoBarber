import { JwtAdapter } from "../../config/plugins";
import { envs } from "../../config/plugins/envs";
import { ClientModel } from "../../data/mongo";
import { ClientDto, CustomError, UserEntity } from "../../domain";
import { EmailService } from './email.service';
import moment from "moment-timezone";



export class AgendamientoService {
    constructor(
        private readonly emailService: EmailService,
    ) { }

    public async agendar(clientDto: ClientDto) {
        const dateExists = await ClientModel.findOne({ dateCita: clientDto.dateCita });
        if (dateExists) throw CustomError.badRequest('La fecha ya está ocupada');

        try {
            const fechaCitaUTC = moment(clientDto.dateCita).tz("UTC", true).toDate();

            clientDto.dateCita = fechaCitaUTC;

            const client = new ClientModel(clientDto);
            const clientEntity = UserEntity.fromObject(client);

            const token = await JwtAdapter.generateToken({ id: clientEntity._id, state: clientEntity.stateCita });
            if (!token) throw CustomError.internalServer('Error al generar el token');



            await client.save();
            await ClientModel.updateOne({ dateCita: clientDto.dateCita }, { $set: { stateCita: 'Pendiente' } });
            await this.sendEmailConfirmationDate(clientDto.email, clientDto.dateCita, clientDto.name);

            return { clientEntity, token };
        }
        catch (error) {
            throw CustomError.internalServer(`Error al agendar la cita: ${error}`);
        }
    }


    private sendEmailConfirmationDate = async (email: string, date: Date, name: string) => {

        const token = await JwtAdapter.generateToken({ email });
        if (!token) throw CustomError.internalServer(`Error al generar el token`);

        const link = `${envs.WEBSERVICE_URL}/confirm-state/${token}`;

        const formattedDate = moment(date)
        .locale('es')  // Establecer el idioma a español
        .tz("America/Santiago")
        .format("DD [de] MMMM [del] YYYY hh:mm A");

        const html = `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; text-align: center;">
            <div style="background-color: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); width: 100%; max-width: 600px; margin: 0 auto; text-align: left;">
                <h1 style="color: #2a2a2a; font-size: 28px;">Hola ${name}, tu cita está pendiente!</h1>
                <p style="color: #555; font-size: 18px;">¡Gracias por elegir a <strong>XhinoBarber</strong> para tu corte de cabello! Tu cita ha sido agendada, pero está <span style="color: #ff9900; font-weight: bold;">pendiente</span> hasta que confirmes tu asistencia.</p>
        
                <hr style="border: 1px solid #ddd; margin: 20px 0;">
        
                <p style="color: #333; font-size: 18px;"><strong>📍 Lugar:</strong> Covadonga 433, Lo Prado</p>
                <p style="color: #333; font-size: 18px;"><strong>💈 Barbero:</strong> José Moya</p>
                <p style="color: #333; font-size: 18px;"><strong>🗓 Fecha:</strong> ${formattedDate}</p>
        
                <hr style="border: 1px solid #ddd; margin: 20px 0;">
        
                <p style="color: #555; font-size: 16px;">Para confirmar tu asistencia, puedes hacerlo aquí:</p>
                <a href="${link}" style="display: inline-block; padding: 12px 24px; background-color:rgb(42, 163, 28); color: #fff; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 5px;">Confirmar mi cita</a>
        
                <p style="color: #ff4d4d; font-size: 14px; margin-top: 20px; font-weight: bold;">
                    *IMPORTANTE: Si confirmas tu asistencia y no asistes sin cancelar previamente, se aplicará una penalización a la siguiente vez que quieras agendar con <strong>XhinoBarber</strong>.
                </p>
    
                <footer style="color: #aaa; font-size: 12px; margin-top: 40px; text-align: center;">
                    <p>&copy; 2025 XhinoBarber. Todos los derechos reservados.</p>
                </footer>
            </div>
        </div>`;
    
    
    
    
    

        const options = {
            to: email,
            subject: 'Confirmación de cita',
            htmlBody: html,
        }
        const isSet = await this.emailService.sendEmail(options);
        if (!isSet) throw CustomError.internalServer('Error al enviar el correo de confirmación');

    }

    public async obtenerEventos() {
        try {
            const eventos = await ClientModel.find();

            const eventosFormateados = eventos.map(evento => {
                if (!evento.name || !evento.dateCita || !evento.stateCita) {
                    throw new Error("Datos incompletos en el evento");
                }

                return {
                    title: `Cita con ${evento.name}`,
                    start: evento.dateCita.toISOString(),
                    stateCita: evento.stateCita,
                };
            });

            return eventosFormateados;
        } catch (error) {
            throw CustomError.internalServer(`Error al obtener los eventos: ${error}`);
        }
    }


    public confirmState = async (token: string) => {

        const payload = await JwtAdapter.validateToken(token);
        if (!payload) throw CustomError.badRequest('Token invalido');

        const { state } = payload as { state: string };

        const client = await ClientModel.findOne({ state });

        if (!client) throw CustomError.notFound('Cita no encontrada');

        if (client.stateCita === 'Pendiente') {
            client.stateCita = 'Confirmado'
            await client.save();
            await this.sendEmailConfirmedAppointment(client.email, client.dateCita, client.name);
            return { message: 'Cita confirmada exitosamente' };
        } else {
            throw CustomError.badRequest('La cita ya está confirmada o tiene otro estado');
        }
    }


    public async cancelarCita(token: string) {
        const payload = await JwtAdapter.validateToken(token);
        if (!payload) throw CustomError.badRequest('Token invalido');

        const { state } = payload as { state: string };

        const client = await ClientModel.findOne({ state });

        if (!client) throw CustomError.notFound('Cita no encontrada');

        if (client.stateCita === 'Pendiente' || client.stateCita === 'Confirmado') {
            client.stateCita = 'Cancelado';
            await client.save();
            return { message: 'Cita cancelada exitosamente' };
        } else {
            throw CustomError.badRequest('La cita ya está cancelada o en un estado que no se puede cancelar');
        }
    }


    private sendEmailConfirmedAppointment = async (email: string, date: Date, name: string) => {
        const token = await JwtAdapter.generateToken({ email });
        if (!token) throw CustomError.internalServer(`Error al generar el token`);
    
        const linkCancelar = `${envs.WEBSERVICE_URL}/cancelar-cita/${token}`;
    
        const formattedDate = moment(date)
        .locale('es')  // Establecer el idioma a español
        .tz("America/Santiago")
        .format("DD [de] MMMM [del] YYYY hh:mm A");

const html = `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; text-align: center;">
        <div style="background-color: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); width: 100%; max-width: 600px; margin: 0 auto; text-align: left;">
            <h1 style="color: #2a2a2a; font-size: 28px;">Gracias ${name} por confirmar tu asistencia.</h1>
            <p style="color: #555; font-size: 18px;">Tu cita ha sido agendada, ¡te estaremos esperando!</p>

            <hr style="border: 1px solid #ddd; margin: 20px 0;">

            <p style="color: #333; font-size: 18px;"><strong>📍 Lugar:</strong> Covadonga 433, Lo Prado</p>
            <p style="color: #333; font-size: 18px;"><strong>💈 Barbero:</strong> José Moya</p>
            <p style="color: #333; font-size: 18px;"><strong>🗓 Fecha:</strong> ${formattedDate}</p>

            <hr style="border: 1px solid #ddd; margin: 20px 0;">

            <p style="color: #555; font-size: 16px;">Si deseas cancelar tu cita, puedes hacerlo aquí.</p>
            <a href="${linkCancelar}" style="display: inline-block; padding: 12px 24px; background-color: #ff3333; color: #fff; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 5px;">Cancelar mi cita</a>

            <!-- Nueva sección de contacto alineada a la izquierda con los textos centrados respecto al logo -->
            <p style="color: #555; font-size: 14px; margin-top: 20px;">Puedes contactarme a través de:</p>
            <div style="text-align: left; margin-bottom: 20px;">
                <a href="https://www.instagram.com/xhin9._/" style="text-decoration: none; margin-right: 10px; display: inline-flex; align-items: center;">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/800px-Instagram_icon.png" alt="Instagram" style="width: 30px; height: 30px; margin-right: 10px;">
                    <strong style="color: #000; margin-top: 4px;">@xhin9._</strong>
                </a>
                <a href="https://wa.me/56949524205" style="text-decoration: none; margin-left: 15px; display: inline-flex; align-items: center;">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1200px-WhatsApp.svg.png" alt="WhatsApp" style="width: 30px; height: 30px; margin-right: 10px;">
                    <strong style="color: #000; margin-top: 4px;">+56 9 4952 4205</strong>
                </a>
            </div>

            <footer style="color: #aaa; font-size: 12px; margin-top: 40px; text-align: center;">
                <p>&copy; 2025 XhinoBarber. Todos los derechos reservados.</p>
            </footer>
        </div>
    </div>`;

    
    
    
    
    
    
    
    
        const options = {
            to: email,
            subject: 'Tu cita ha sido confirmada',
            htmlBody: html,
        };
    
        const isSet = await this.emailService.sendEmail(options);
        if (!isSet) throw CustomError.internalServer('Error al enviar el correo de confirmación de cita');
    };
    
}