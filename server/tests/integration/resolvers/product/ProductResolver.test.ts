import { Response } from 'supertest';
import { MockLogger } from '../../../__mocks__/utils/logger';

import { useIntegrationTestsUtils } from '../../../__utils__/integration-utils/useIntegrationTestsUtils';
import { ProductRepositorySpy } from '../../../__utils__/spies/repositories/ProductRepositorySpy';
import { useValidationUtils } from '../../../__utils__/integration-utils/useValidationUtils';
import { getAuthHeader } from '../../../__utils__/integration-utils/authUtils';
import { generator } from '../../../__utils__/generator';

import { ProductCreateFormData } from '../../../../src/resolvers/product/input/ProductCreateFormData';
import { ProductUpdateFormData } from '../../../../src/resolvers/product/input/ProductUpdateFormData';
import { ProductDeleteFormData } from '../../../../src/resolvers/product/input/ProductDeleteFormData';
import { ProductResolver } from '../../../../src/resolvers/product/ProductResolver';


describe('ProductResolver', () => {

    const testUtils = useIntegrationTestsUtils();

    beforeEach(async () => {
        MockLogger.setupMocks();

        // repositories
        ProductRepositorySpy.setupSpies();
    });

    function expectUserIsNotProductOwnerError(response: Response) {
        // verify if access was logged
        expect(MockLogger.info).toHaveBeenCalledTimes(1);
        expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access-error' }));

        // verify mutation response
        expect(response.body).toEqual({
            data: null,
            errors: [
                expect.objectContaining({
                    message: 'RESOURCE_OWNER_ROLE_REQUIRED',
                }),
            ],
        });
    }

    function expectProductNotFoundError(response: Response) {
        // verify if access was logged
        expect(MockLogger.info).toHaveBeenCalledTimes(1);
        expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access-error' }));

        // verify mutation response
        expect(response.body).toEqual({
            data: null,
            errors: [
                expect.objectContaining({
                    message: 'PRODUCT_NOT_FOUND',
                }),
            ],
        });
    }

    describe('create product mutation', () => {

        const createProductMutation = `
            mutation CreateProduct(
              $name: String!
              $description: String!
              $price: CurrencyAmountFormData
              $tags: [String!]
            ) {
              createProduct(
                name: $name
                description: $description
                price: $price
                tags: $tags
              ) {
                id
                name
                description
                price {
                  currency
                  amount
                }
                tags
              }
            }
        `;

        describe('validation', () => {

            const send = useValidationUtils<ProductCreateFormData>({
                testUtils,
                resolverSpy: jest.spyOn(ProductResolver.prototype, 'createProduct'),
                query: createProductMutation,
                validFormData: {
                    name: 'Sample product name',
                    description: '[{"sample":"rich text description"}]',
                    price: { currency: 'PLN', amount: 4.5 },
                    tags: [ 'Sample tag' ],
                },
            });

            it('should return error when user is not authenticated', async () => {
                await send.withoutAuth().expectNotAuthorizedError();
            });

            it('should validate product name', async () => {
                // should accept valid
                await send.withAuth({ name: 'a'.repeat(3) }).expectValidationSuccess();
                await send.withAuth({ name: 'a'.repeat(255) }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({ name: 'a'.repeat(2) }).expectValidationError('name');
                await send.withAuth({ name: 'a'.repeat(256) }).expectValidationError('name');
            });

            it('should validate product description', async () => {
                // should accept valid
                await send.withAuth({ description: 'a'.repeat(3) }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({ description: 'a'.repeat(2) }).expectValidationError('description');
            });

            it('should validate product price', async () => {
                // should be optional
                await send.withAuth({ price: null }).expectValidationSuccess();
                await send.withAuth({ price: undefined }).expectValidationSuccess();
                // should accept valid
                await send.withAuth({ price: { currency: 'EUR', amount: 0 } }).expectValidationSuccess();
                await send.withAuth({ price: { currency: 'PLN', amount: 1e6 } }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({ price: { currency: '$', amount: 0 } }).expectValidationError('price');
                await send.withAuth({ price: { currency: 'EUR', amount: -1 } }).expectValidationError('price');
                await send.withAuth({ price: { currency: 'EUR', amount: 1e6 + 1 } }).expectValidationError('price');
            });

            it('should validate product tags', async () => {
                // should be optional
                await send.withAuth({ tags: null }).expectValidationSuccess();
                await send.withAuth({ tags: undefined }).expectValidationSuccess();
                // should accept valid
                await send.withAuth({ tags: [] }).expectValidationSuccess();
                await send.withAuth({ tags: [ 'a'.repeat(255) ] }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({ tags: [ '' ] }).expectValidationError('tags');
                await send.withAuth({ tags: [ 'Valid name', '' ] }).expectValidationError('tags');
                await send.withAuth({ tags: [ 'a'.repeat(256) ] }).expectValidationError('tags');
            });

        });

        it('should create product with all available fields', async () => {
            const user = await testUtils.db.populateWithUser();
            const formData: ProductCreateFormData = {
                name: generator.sentence({ words: 5 }).replace(/\./g, ''),
                description: '[{"sample":"rich text description"}]',
                price: { currency: 'PLN', amount: 4.5 },
                tags: [ 'Sample tag' ],
            };
            const response = await testUtils.postGraphQL({
                query: createProductMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));

            // verify if new product was created and saved in db
            expect(ProductRepositorySpy.create).toHaveBeenCalledTimes(1);
            expect(ProductRepositorySpy.persistAndFlush).toHaveBeenCalledTimes(1);

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    createProduct: {
                        id: expect.any(String),
                        name: formData.name,
                        description: formData.description,
                        price: formData.price,
                        tags: formData.tags,
                    },
                },
            });
        });

        it('should create product with only required fields', async () => {
            const user = await testUtils.db.populateWithUser();
            const formData: ProductCreateFormData = {
                name: generator.sentence({ words: 5 }).replace(/\./g, ''),
                description: '[{"sample":"rich text description"}]',
            };
            const response = await testUtils.postGraphQL({
                query: createProductMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));

            // verify if new product was created and saved in db
            expect(ProductRepositorySpy.create).toHaveBeenCalledTimes(1);
            expect(ProductRepositorySpy.persistAndFlush).toHaveBeenCalledTimes(1);

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    createProduct: {
                        id: expect.any(String),
                        name: formData.name,
                        description: formData.description,
                        price: null,
                        tags: null,
                    },
                },
            });
        });

    });

    describe('update product mutation', () => {

        const updateProductMutation = `
            mutation UpdateProduct(
              $productId: String!
              $name: String!
              $description: String!
              $price: CurrencyAmountFormData
              $tags: [String!]
            ) {
              updateProduct(
                productId: $productId
                name: $name
                description: $description
                price: $price
                tags: $tags
              ) {
                id
                name
                description
                price {
                  currency
                  amount
                }
                tags
              }
            }
        `;

        describe('validation', () => {

            const send = useValidationUtils<ProductUpdateFormData>({
                testUtils,
                resolverSpy: jest.spyOn(ProductResolver.prototype, 'updateProduct'),
                query: updateProductMutation,
                validFormData: {
                    productId: '5f09e24646904045d48e5598',
                    name: 'Sample product name',
                    description: '[{"sample":"rich text description"}]',
                    price: { currency: 'PLN', amount: 4.5 },
                    tags: [ 'Sample tag' ],
                },
            });

            it('should return error when user is not authenticated', async () => {
                await send.withoutAuth().expectNotAuthorizedError();
            });

            it('should validate product id', async () => {
                // should accept valid
                await send.withAuth({ productId: '5f09e24646904045d48e5598' }).expectValidationSuccess();
                await send.withAuth({ productId: '5f09e24646904045d48e5598' }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({ productId: '' }).expectValidationError('productId');
                await send.withAuth({ productId: 'invalid-id' }).expectValidationError('productId');
            });

            it('should validate product name, description, price and tags', async () => {
                await send.withAuth().expectValidationSuccess();
                // verify if ProductUpdateFormData is instance of ProductCreateFormData - and thus inherits its validation
                expect(ProductResolver.prototype.updateProduct).toHaveBeenCalledWith(expect.any(ProductCreateFormData), expect.any(Object));
            });

        });

        it('should update product by changing some product fields', async () => {
            const user = await testUtils.db.populateWithUser();
            const productToUpdate = await testUtils.db.populateWithProduct(user.id, {
                name: 'Initial product name',
                description: '[{"sample":"Initial description"}]',
            });
            const formData: ProductUpdateFormData = {
                productId: productToUpdate.id,
                name: 'Updated product name',
                description: '[{"sample":"Updated description"}]',
                price: { currency: 'PLN', amount: 4.5 },
                tags: [ 'Sample tag' ],
            };
            const response = await testUtils.postGraphQL({
                query: updateProductMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));

            // verify if product object was updated and saved in db
            expect(ProductRepositorySpy.persistAndFlush).toHaveBeenCalledTimes(1);

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    updateProduct: {
                        id: productToUpdate.id,
                        name: 'Updated product name',
                        description: '[{"sample":"Updated description"}]',
                        price: { currency: 'PLN', amount: 4.5 },
                        tags: [ 'Sample tag' ],
                    },
                },
            });
        });

        it('should update product by removing some optional fields', async () => {
            const user = await testUtils.db.populateWithUser();
            const productToUpdate = await testUtils.db.populateWithProduct(user.id, {
                name: 'Initial product name',
                description: '[{"sample":"Initial description"}]',
                price: { currency: 'PLN', amount: 4.5 },
                tags: [ 'Sample tag' ],
            });
            const formData: ProductUpdateFormData = {
                productId: productToUpdate.id,
                name: productToUpdate.name,
                description: productToUpdate.description,
                price: null,
                tags: null,
            };
            const response = await testUtils.postGraphQL({
                query: updateProductMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));

            // verify if product object was updated and saved in db
            expect(ProductRepositorySpy.persistAndFlush).toHaveBeenCalledTimes(1);

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    updateProduct: {
                        id: productToUpdate.id,
                        name: productToUpdate.name,
                        description: productToUpdate.description,
                        price: null,
                        tags: null,
                    },
                },
            });
        });

    });

    describe('delete product mutation', () => {

        const deleteProductMutation = `
            mutation DeleteProduct($productId: String!) {
              deleteProduct(productId: $productId)
            }
        `;

        describe('validation', () => {

            const send = useValidationUtils<ProductDeleteFormData>({
                testUtils,
                resolverSpy: jest.spyOn(ProductResolver.prototype, 'deleteProduct'),
                query: deleteProductMutation,
                validFormData: {
                    productId: '5f09e24646904045d48e5598',
                },
            });

            it('should return error when user is not authenticated', async () => {
                await send.withoutAuth().expectNotAuthorizedError();
            });

            it('should validate product id', async () => {
                // should accept valid
                await send.withAuth({ productId: '5f09e24646904045d48e5598' }).expectValidationSuccess();
                await send.withAuth({ productId: '5f09e24646904045d48e5598' }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({ productId: '' }).expectValidationError('productId');
                await send.withAuth({ productId: 'invalid-id' }).expectValidationError('productId');
            });

        });

        it('should delete product', async () => {
            const user = await testUtils.db.populateWithUser();
            const productToDelete = await testUtils.db.populateWithProduct(user.id);
            const formData: ProductDeleteFormData = {
                productId: productToDelete.id,
            };
            const response = await testUtils.postGraphQL({
                query: deleteProductMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    deleteProduct: true,
                },
            });
        });

        it('should return error when user is not a product owner', async () => {
            const productOwner = await testUtils.db.populateWithUser();
            const user = await testUtils.db.populateWithUser();
            const productToDelete = await testUtils.db.populateWithProduct(productOwner.id);
            const formData: ProductDeleteFormData = {
                productId: productToDelete.id,
            };
            const response = await testUtils.postGraphQL({
                query: deleteProductMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));
            expectUserIsNotProductOwnerError(response);
        });

        it('should return error when product is not found', async () => {
            const user = await testUtils.db.populateWithUser();
            const formData: ProductDeleteFormData = {
                productId: '5f09e24646904045d48e5598',
            };
            const response = await testUtils.postGraphQL({
                query: deleteProductMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));
            expectProductNotFoundError(response);
        });

    });

});
