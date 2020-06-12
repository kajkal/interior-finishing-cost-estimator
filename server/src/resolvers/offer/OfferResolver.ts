import { Inject, Service } from 'typedi';
import { ApolloError } from 'apollo-server-express';
import { Authorized, Ctx, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';

import { OfferRepository } from '../../repositories/OfferRepository';
import { AuthorizedContext } from '../../types/context/AuthorizedContext';
import { logAccess } from '../../utils/logAccess';
import { Offer } from '../../entities/offer/Offer';


@Service()
@Resolver(() => Offer)
export class OfferResolver {

    @Inject()
    private readonly offerRepository!: OfferRepository;

    @Authorized()
    @UseMiddleware(logAccess)
    @Query(() => [ Offer ])
    async products(@Ctx() context: AuthorizedContext): Promise<Offer[]> {
        return this.offerRepository.findAll();
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
