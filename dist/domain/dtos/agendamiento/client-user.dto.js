"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientDto = void 0;
class ClientDto {
    constructor(name, lastName, phone, email, dateCita) {
        this.name = name;
        this.lastName = lastName;
        this.phone = phone;
        this.email = email;
        this.dateCita = dateCita;
    }
    static create(object) {
        const { name, lastName, phone, email, dateCita } = object;
        if (!name)
            return ['Missing name'];
        if (!lastName)
            return ['Missing lastName'];
        if (!phone)
            return ['Missing number phone'];
        if (!email)
            return ['Missing email'];
        if (!dateCita)
            return ['Missing dateCita'];
        return [undefined, new ClientDto(name, lastName, phone, email, dateCita)];
    }
}
exports.ClientDto = ClientDto;
