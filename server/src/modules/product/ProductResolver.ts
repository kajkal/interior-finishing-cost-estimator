import { Inject, Service } from 'typedi';
import { ApolloError } from 'apollo-server-express';
import { Authorized, Ctx, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';

import { ProductRepository } from '../../repositories/ProductRepository';
import { AuthorizedContext } from '../../utils/authChecker';
import { logAccess } from '../../utils/logAccess';
import { Product } from '../../entities/product/Product';


@Service()
@Resolver(() => Product)
export class ProductResolver {

    @Inject()
    private readonly productRepository!: ProductRepository;

    @Authorized()
    @UseMiddleware(logAccess)
    @Query(() => [ Product ])
    async products(@Ctx() context: AuthorizedContext): Promise<Product[]> {
        return this.productRepository.findAll();
    }

    @Authorized()
    @UseMiddleware(logAccess)
    @Mutation(() => Product)
    async createProduct(@Ctx() context: AuthorizedContext): Promise<Product> {
        throw new ApolloError('not yet implemented');
    }

    @Authorized()
    @UseMiddleware(logAccess)
    @Mutation(() => Product)
    async updateProduct(@Ctx() context: AuthorizedContext): Promise<Product> {
        throw new ApolloError('not yet implemented');
    }

    @Authorized()
    @UseMiddleware(logAccess)
    @Mutation(() => Boolean)
    async deleteProduct(@Ctx() context: AuthorizedContext): Promise<Boolean> {
        throw new ApolloError('not yet implemented');
    }

}
