import { Inject, Service } from 'typedi';
import { ApolloError } from 'apollo-server-express';
import { Authorized, Ctx, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';

import { InquiryRepository } from '../../repositories/InquiryRepository';
import { AuthorizedContext } from '../../types/context/AuthorizedContext';
import { Inquiry } from '../../entities/inquiry/Inquiry';
import { logAccess } from '../../utils/logAccess';


@Service()
@Resolver(() => Inquiry)
export class InquiryResolver {

    @Inject()
    private readonly inquiryRepository!: InquiryRepository;

    @Authorized()
    @UseMiddleware(logAccess)
    @Query(() => [ Inquiry ])
    async products(@Ctx() context: AuthorizedContext): Promise<Inquiry[]> {
        return this.inquiryRepository.findAll();
    }

    @Authorized()
    @UseMiddleware(logAccess)
    @Mutation(() => Inquiry)
    async createInquiry(@Ctx() context: AuthorizedContext): Promise<Inquiry> {
        throw new ApolloError('not yet implemented');
    }

    @Authorized()
    @UseMiddleware(logAccess)
    @Mutation(() => Inquiry)
    async updateInquiry(@Ctx() context: AuthorizedContext): Promise<Inquiry> {
        throw new ApolloError('not yet implemented');
    }

    @Authorized()
    @UseMiddleware(logAccess)
    @Mutation(() => Boolean)
    async deleteInquiry(@Ctx() context: AuthorizedContext): Promise<Boolean> {
        throw new ApolloError('not yet implemented');
    }

}
