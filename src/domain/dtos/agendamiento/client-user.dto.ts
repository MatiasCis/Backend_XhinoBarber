

export class ClientDto {
  constructor(
    public name: string, 
    public lastName: string, 
    public phone: string, 
    public email: string, 
    public dateCita: Date) {}


    static create(object: { [key:string]:any}) : [string?, ClientDto?]{
        const { name, lastName, phone, email, dateCita } = object;

        if( !name ) return ['Missing name'];
        if( !lastName ) return ['Missing lastName'];
        if( !phone ) return ['Missing number phone'];
        if( !email ) return ['Missing email'];
        if( !dateCita ) return ['Missing dateCita'];

        return [undefined, new ClientDto(name, lastName, phone, email, dateCita)]
    }



}