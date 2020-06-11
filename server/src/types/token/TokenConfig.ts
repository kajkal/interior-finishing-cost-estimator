import { SignOptions } from 'jsonwebtoken';


export interface TokenConfig<Payload extends object> {
    privateKey: string;
    options: SignOptions;
}
