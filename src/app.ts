import { envs } from "./config/plugins/envs";
import { ClientModel } from "./data/mongo";
import { MongoDatabase } from "./data/mongo/init";
import { Server } from "./presentation/server";



(async()=> {
    main();
})();


async function main(){

    await MongoDatabase.connect({
        mongoUrl: envs.MONGO_URL,
        dbName: envs.MONGO_DB_NAME,
    });

    const newClient = await ClientModel.create({
        name: 'John',
        lastName: 'Doe',
        phone: '123456789',
        mail: 'johndoe@gmail.com',
        dateCita: new Date('2025-03-05T11:00:00'),
        stateCita: 'Correo confirmado',
    })

    await newClient.save()

    console.log(newClient)
    // server.start();
}