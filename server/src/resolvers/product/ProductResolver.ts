import { wrap } from 'mikro-orm';
import { Inject, Service } from 'typedi';
import { ForbiddenError, UserInputError } from 'apollo-server-express';
import { Args, Authorized, Ctx, Mutation, Resolver, UseMiddleware } from 'type-graphql';

import { ProductRepository } from '../../repositories/ProductRepository';
import { AuthorizedContext } from '../../types/context/AuthorizedContext';
import { ProductCreateFormData } from './input/ProductCreateFormData';
import { ProductUpdateFormData } from './input/ProductUpdateFormData';
import { ProductDeleteFormData } from './input/ProductDeleteFormData';
import { Product } from '../../entities/product/Product';
import { logAccess } from '../../utils/logAccess';


@Service()
@Resolver(() => Product)
export class ProductResolver {

    @Inject()
    private readonly productRepository!: ProductRepository;

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
    async updateProduct(@Args() { productId, ...data }: ProductUpdateFormData, @Ctx() context: AuthorizedContext): Promise<Product> {
        const productToUpdate = await this.productRepository.findOne({ id: productId });

        if (productToUpdate) {
            if (productToUpdate.user.id === context.jwtPayload.sub) {
                wrap(productToUpdate).assign(data);
                await this.productRepository.persistAndFlush(productToUpdate);
                return productToUpdate;
            }

            throw new ForbiddenError('RESOURCE_OWNER_ROLE_REQUIRED');
        }

        throw new UserInputError('PRODUCT_NOT_FOUND');
    }

    @Authorized()
    @UseMiddleware(logAccess)
    @Mutation(() => Boolean)
    async deleteProduct(@Args() { productId }: ProductDeleteFormData, @Ctx() context: AuthorizedContext): Promise<Boolean> {
        const productToDelete = await this.productRepository.findOne({ id: productId });

        if (productToDelete) {
            if (productToDelete.user.id === context.jwtPayload.sub) {
                await this.productRepository.removeAndFlush(productToDelete);
                return true;
            }

            throw new ForbiddenError('RESOURCE_OWNER_ROLE_REQUIRED');
        }

        throw new UserInputError('PRODUCT_NOT_FOUND');
    }

}
