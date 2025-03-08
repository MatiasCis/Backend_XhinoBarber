import mongoose from "mongoose";


const clientSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'El nombre es requerido'],
    },
    lastName: {
        type: String,
        required: [true, 'El apellido es requerido'],
    },
    phone: {
        type: Number,
        required: [true, 'El telefono es requerido'],
    },
    email: {
        type: String,
        required: [true, 'El correo es requerido'],
    },
    dateCita: {
        type: Date,
        required: [true, 'La fecha de la cita es requerida'],
    },
    stateCita: {
        type: String,
        enum: ['Pendiente', 'Correo confirmado', 'Asistio', 'Cancelado'],
        default: 'Pendiente'
    }

});

export const ClientModel = mongoose.model('Client', clientSchema)