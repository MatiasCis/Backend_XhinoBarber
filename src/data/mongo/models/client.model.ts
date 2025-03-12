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
        type: String,
        required: [true, 'El telefono es requerido'],
        minlength: [9, 'El teléfono debe tener exactamente 9 dígitos'],
        maxlength: [9, 'El teléfono no puede tener más de 10 dígitos']

    },
    email: {
        type: String,
        required: [true, 'El correo es requerido'],
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Por favor ingrese un correo electrónico válido']

    },
    dateCita: {
        type: Date,
        required: [true, 'La fecha de la cita es requerida'],
    },
    stateCita: {
        type: String,
        enum: ['Pendiente', 'Confirmado', 'Cancelado'],
        default: 'Pendiente'
    }

});

export const ClientModel = mongoose.model('Client', clientSchema)