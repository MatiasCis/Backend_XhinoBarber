import { CustomError } from "../errors/custom.error";



export class UserEntity{
    constructor(
        public _id: string,
        public name: string,
        public lastName: string,
        public phone: number,
        public email: string,
        public dateCita: Date,
        public stateCita: string[],
    ){}

    static fromObject( object: { [key:string]:any}){
        const { _id, name, lastName, phone, email, dateCita, stateCita} = object;

        if( !_id){
            throw CustomError.badRequest('Missing id')
        }
        
        if( !name ) throw CustomError.badRequest('Missing name');
        if( !lastName ) throw CustomError.badRequest('Missing lastName');
        if( !phone ) throw CustomError.badRequest('Missing number phone');
        if( !email ) throw CustomError.badRequest('Missing email');
        if( !dateCita ) throw CustomError.badRequest('Missing dateCita');
        if( !stateCita ) throw CustomError.badRequest('Missing stateCita');

        return new UserEntity( _id, name, lastName, phone, email, dateCita, stateCita )
    }


}