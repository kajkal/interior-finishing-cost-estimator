import { Inject, Service } from 'typedi';
import { ApolloError } from 'apollo-server-express';
import { Args, Authorized, Ctx, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';

import { ProductRepository } from '../../repositories/ProductRepository';
import { AuthorizedContext } from '../../types/context/AuthorizedContext';
import { ProductCreateFormData } from './input/ProductCreateFormData';
import { Product } from '../../entities/product/Product';
import { logAccess } from '../../utils/logAccess';


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
    async createProduct(@Args() data: ProductCreateFormData, @Ctx() context: AuthorizedContext): Promise<Product> {
        const { sub: userId } = context.jwtPayload;

        const product = this.productRepository.create({ ...data, user: userId });
        await this.productRepository.persistAndFlush(product);

        return product;
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
