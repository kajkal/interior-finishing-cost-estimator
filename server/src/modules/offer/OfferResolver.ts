import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { ApolloError } from 'apollo-server-errors/src/index';
import { Authorized, Ctx, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';

import { OfferRepository } from '../../repositories/OfferRepository';
import { AuthorizedContext } from '../../utils/authChecker';
import { logAccess } from '../../utils/logAccess';
import { Offer } from '../../entities/Offer';


@Service()
@Resolver()
export class OfferResolver {

    @InjectRepository()
    private readonly offerRepository!: OfferRepository;

    @Authorized()
    @UseMiddleware(logAccess)
    @Query(() => [ Offer ])
    async products(@Ctx() context: AuthorizedContext): Promise<Offer[]> {
        return this.offerRepository.find();
    }

    @Authorized()
    @UseMiddleware(logAccess)
    @Mutation(() => Offer)
    async createOffer(@Ctx() context: AuthorizedContext): Promise<Offer> {
        throw new ApolloError('not yet implemented');
    }

    @Authorized()
    @UseMiddleware(logAccess)
    @Mutation(() => Offer)
    async updateOffer(@Ctx() context: AuthorizedContext): Promise<Offer> {
        throw new ApolloError('not yet implemented');
    }

    @Authorized()
    @UseMiddleware(logAccess)
    @Mutation(() => Boolean)
    async deleteOffer(@Ctx() context: AuthorizedContext): Promise<Boolean> {
        throw new ApolloError('not yet implemented');
    }

}
