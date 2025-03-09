import jwt, { SignOptions } from 'jsonwebtoken';
import { envs } from './envs';


const JWT_SEED = envs.JWT_SEED;


export class JwtAdapter {

    static async generateToken(payload: any, duration: SignOptions['expiresIn'] = '2h') {

        return new Promise((resolve) => {
            jwt.sign(payload, JWT_SEED, { expiresIn: duration }, (err, token) => {

                if (err) return resolve(null);
                return resolve(token);

            });
        });
    }

    static validateToken(token: string) {
        return;
    }

}