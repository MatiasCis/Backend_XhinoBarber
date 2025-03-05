import mongoose from "mongoose";


const clientSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
        required: true,
    },
    mail: {
        type: String,
        required: true,
    },
    dateCita: {
        type: Date,
        required: true,
    },
    stateCita: {
        type: String,
        enum: ['Pendiente', 'Correo confirmado', 'Asistio', 'Cancelado'],
        default: 'Pendiente'
    }

});

export const ClientModel = mongoose.model('Client', clientSchema)