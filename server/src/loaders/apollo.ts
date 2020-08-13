import { Container } from 'typedi';
import { buildSchema } from 'type-graphql';
import { ApolloServer } from 'apollo-server-express';

import { PasswordResetResolver } from '../resolvers/user/PasswordResetResolver';
import { UserResolver } from '../resolvers/user/UserResolver';

import { ProductResolver } from '../resolvers/product/ProductResolver';
import { ProjectResolver } from '../resolvers/project/ProjectResolver';
import { RegisterResolver } from '../resolvers/user/RegisterResolver';
import { OfferResolver } from '../resolvers/offer/OfferResolver';
import { LoginResolver } from '../resolvers/user/LoginResolver';
import { ProfileResolver } from '../resolvers/user/ProfileResolver';
import { SettingsResolver } from '../resolvers/user/SettingsResolver';
import { authChecker } from '../utils/authChecker';


export async function createApolloServer(): Promise<ApolloServer> {
    return new ApolloServer({
        schema: await buildSchema({
            resolvers: [
                UserResolver,
                RegisterResolver,
                LoginResolver,
                PasswordResetResolver,
                ProductResolver,
                ProjectResolver,
                OfferResolver,
                ProfileResolver,
                SettingsResolver,
            ],
            authChecker,
            container: Container,
        }),
        context: (expressContext) => expressContext,
        uploads: {
            maxFiles: 1,
            maxFileSize: 1e+8, // 100mb
        },
    });
}
