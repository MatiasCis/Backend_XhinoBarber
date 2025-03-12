"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserEntity = void 0;
const custom_error_1 = require("../errors/custom.error");
class UserEntity {
    constructor(_id, name, lastName, phone, email, dateCita, stateCita) {
        this._id = _id;
        this.name = name;
        this.lastName = lastName;
        this.phone = phone;
        this.email = email;
        this.dateCita = dateCita;
        this.stateCita = stateCita;
    }
    static fromObject(object) {
        const { _id, name, lastName, phone, email, dateCita, stateCita } = object;
        if (!_id) {
            throw custom_error_1.CustomError.badRequest('Missing id');
        }
        if (!name)
            throw custom_error_1.CustomError.badRequest('Missing name');
        if (!lastName)
            throw custom_error_1.CustomError.badRequest('Missing lastName');
        if (!phone)
            throw custom_error_1.CustomError.badRequest('Missing number phone');
        if (!email)
            throw custom_error_1.CustomError.badRequest('Missing email');
        if (!dateCita)
            throw custom_error_1.CustomError.badRequest('Missing dateCita');
        if (!stateCita)
            throw custom_error_1.CustomError.badRequest('Missing stateCita');
        return new UserEntity(_id, name, lastName, phone, email, dateCita, stateCita);
    }
}
exports.UserEntity = UserEntity;
