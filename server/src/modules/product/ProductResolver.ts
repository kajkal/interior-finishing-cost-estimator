import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { ApolloError } from 'apollo-server-errors/src/index';
import { Authorized, Ctx, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';

import { ProductRepository } from '../../repositories/ProductRepository';
import { AuthorizedContext } from '../../utils/authChecker';
import { logAccess } from '../../utils/logAccess';
import { Product } from '../../entities/Product';


@Service()
@Resolver()
export class ProductResolver {

    @InjectRepository()
    private readonly productRepository!: ProductRepository;

    @Authorized()
    @UseMiddleware(logAccess)
    @Query(() => [ Product ])
    async products(@Ctx() context: AuthorizedContext): Promise<Product[]> {
        return this.productRepository.find();
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
