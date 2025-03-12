"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgendamientoService = void 0;
const plugins_1 = require("../../config/plugins");
const envs_1 = require("../../config/plugins/envs");
const mongo_1 = require("../../data/mongo");
const domain_1 = require("../../domain");
const moment_timezone_1 = __importDefault(require("moment-timezone"));
class AgendamientoService {
    constructor(emailService) {
        this.emailService = emailService;
        this.sendEmailConfirmationDate = (email, date, name, id) => __awaiter(this, void 0, void 0, function* () {
            const token = yield plugins_1.JwtAdapter.generateToken({ email, id });
            if (!token)
                throw domain_1.CustomError.internalServer(`Error al generar el token`);
            const link = `${envs_1.envs.WEBSERVICE_URL}/confirm-state/${token}`;
            const formattedDate = (0, moment_timezone_1.default)(date)
                .locale('es') // Establecer el idioma a español
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
            };
            const isSet = yield this.emailService.sendEmail(options);
            if (!isSet)
                throw domain_1.CustomError.internalServer('Error al enviar el correo de confirmación');
        });
        this.confirmState = (token) => __awaiter(this, void 0, void 0, function* () {
            const payload = yield plugins_1.JwtAdapter.validateToken(token);
            console.log("Payload del token:", payload); // Inspecciona el payload decodificado
            if (!payload)
                throw domain_1.CustomError.badRequest('Token invalido');
            const { id } = payload; // Asegúrate de que el token contenga el ID de la cita
            const client = yield mongo_1.ClientModel.findById(id);
            if (!client)
                throw domain_1.CustomError.notFound('Cita no encontrada');
            if (client.stateCita === 'Pendiente') {
                client.stateCita = 'Confirmado';
                yield client.save();
                yield this.sendEmailConfirmedAppointment(client.email, client.dateCita, client.name);
                yield this.sendEmailToOwner(client.name, client.dateCita);
                return { message: 'Cita confirmada exitosamente' };
            }
            else {
                throw domain_1.CustomError.badRequest('La cita ya está confirmada o tiene otro estado');
            }
        });
        this.sendEmailConfirmedAppointment = (email, date, name) => __awaiter(this, void 0, void 0, function* () {
            const token = yield plugins_1.JwtAdapter.generateToken({ email });
            if (!token)
                throw domain_1.CustomError.internalServer(`Error al generar el token`);
            const linkCancelar = `${envs_1.envs.WEBSERVICE_URL}/cancelar-cita/${token}`;
            const formattedDate = (0, moment_timezone_1.default)(date)
                .locale('es') // Establecer el idioma a español
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
            const isSet = yield this.emailService.sendEmail(options);
            if (!isSet)
                throw domain_1.CustomError.internalServer('Error al enviar el correo de confirmación de cita');
        });
        this.sendEmailToOwner = (clientName, date) => __awaiter(this, void 0, void 0, function* () {
            const ownerEmail = "XhinoBarber@gmail.com"; // Cambia esto por el correo real del dueño
            const formattedDate = (0, moment_timezone_1.default)(date)
                .locale('es')
                .tz("America/Santiago")
                .format("DD [de] MMMM [del] YYYY hh:mm A");
            const html = `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; text-align: center;">
            <div style="background-color: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); width: 100%; max-width: 600px; margin: 0 auto; text-align: left;">
                <h1 style="color: #2a2a2a; font-size: 28px;">Nueva Cita Confirmada</h1>
                <p style="color: #555; font-size: 18px;">Un cliente ha confirmado su cita en XhinoBarber.</p>
    
                <hr style="border: 1px solid #ddd; margin: 20px 0;">
    
                <p style="color: #333; font-size: 18px;"><strong>👤 Cliente:</strong> ${clientName}</p>
                <p style="color: #333; font-size: 18px;"><strong>🗓 Fecha:</strong> ${formattedDate}</p>
    
                <hr style="border: 1px solid #ddd; margin: 20px 0;">
                    
                <p style="color: #555; font-size: 16px; text-align: center;">
                    Para ver los detalles de la cita agendada, accede a tu calendario en  
                    <a href="https://xhinobarber.com" style="color: #2a7ae2; text-decoration: none; font-weight: bold;">
                        xhinobarber.com
                    </a>.
                </p>
                    <footer style="color: #aaa; font-size: 12px; margin-top: 40px; text-align: center;">
                    <p>&copy; 2025 XhinoBarber. Todos los derechos reservados.</p>
                </footer>
            </div>
        </div>`;
            const options = {
                to: ownerEmail,
                subject: 'Nueva Cita Confirmada',
                htmlBody: html,
            };
            const isSet = yield this.emailService.sendEmail(options);
            if (!isSet)
                throw domain_1.CustomError.internalServer('Error al enviar la notificación al dueño');
        });
    }
    agendar(clientDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const fechaCita = (0, moment_timezone_1.default)(clientDto.dateCita).tz("America/Santiago", true).startOf('minute'); // Usamos startOf('minute') para eliminar cualquier posible diferencia en segundos
            const horaCita = fechaCita.format("HH:mm:ss");
            const dateExists = yield mongo_1.ClientModel.find({
                // Compara solo la hora, minutos y segundos
                $expr: {
                    $eq: [
                        { $dateToString: { format: "%H:%M:%S", date: "$dateCita" } }, // Formateamos la fecha guardada a hora:minutos:segundos
                        horaCita
                    ]
                },
                stateCita: { $in: ['Pendiente', 'Confirmado'] } // Filtra solo los estados que bloquean la cita
            });
            if (dateExists.length > 0) {
                throw domain_1.CustomError.badRequest('La fecha ya está ocupada con una cita Pendiente o Confirmada');
            }
            try {
                const fechaCitaUTC = (0, moment_timezone_1.default)(clientDto.dateCita).tz("UTC", true).toDate();
                clientDto.dateCita = fechaCitaUTC;
                const client = new mongo_1.ClientModel(clientDto);
                const clientEntity = domain_1.UserEntity.fromObject(client);
                const token = yield plugins_1.JwtAdapter.generateToken({ id: clientEntity._id, state: clientEntity.stateCita });
                if (!token)
                    throw domain_1.CustomError.internalServer('Error al generar el token');
                yield client.save();
                yield this.sendEmailConfirmationDate(clientDto.email, clientDto.dateCita, clientDto.name, clientEntity._id);
                return { clientEntity, token };
            }
            catch (error) {
                throw domain_1.CustomError.internalServer(`Error al agendar la cita: ${error}`);
            }
        });
    }
    obtenerEventos() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const eventos = yield mongo_1.ClientModel.find();
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
            }
            catch (error) {
                throw domain_1.CustomError.internalServer(`Error al obtener los eventos: ${error}`);
            }
        });
    }
    cancelarCita(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = yield plugins_1.JwtAdapter.validateToken(token);
            if (!payload)
                throw domain_1.CustomError.badRequest('Token invalido');
            const { state } = payload;
            const client = yield mongo_1.ClientModel.findOne({ state });
            if (!client)
                throw domain_1.CustomError.notFound('Cita no encontrada');
            if (client.stateCita === 'Pendiente' || client.stateCita === 'Confirmado') {
                client.stateCita = 'Cancelado';
                yield client.save();
                return { message: 'Cita cancelada exitosamente' };
            }
            else {
                throw domain_1.CustomError.badRequest('La cita ya está cancelada o en un estado que no se puede cancelar');
            }
        });
    }
}
exports.AgendamientoService = AgendamientoService;
