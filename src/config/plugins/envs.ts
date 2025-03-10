import 'dotenv/config';
import * as env from 'env-var';

export const envs = {

    MONGO_URL: env.get('MONGO_URL').required().asString(),
    MONGO_DB_NAME: env.get('MONGO_DB_NAME').required().asString(),
    MONGO_USER: env.get('MONGO_USER').required().asString(),
    MONGO_PASS: env.get('MONGO_PASS').required().asString(),
    PORT: env.get( 'PORT' ).required().asPortNumber(),

    MAILER_SERVICE: env.get('MAILER_SERVICE').required().asString(),
    MAILER_EMAIL : env.get('MAILER_EMAIL').required().asString(),
    MAILER_SECRET_KEY : env.get('MAILER_SECRET_KEY').required().asString(),

    JWT_SEED : env.get('JWT_SEED').required().asString(),

    WEBSERVICE_URL : env.get('WEBSERVICE_URL').required().asString(),

    CLIENT_URL: env.get('CLIENT_URL').required().asString(),
}