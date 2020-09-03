import { Response } from 'supertest';

import { MockLogger } from '../../../__mocks__/utils/logger';
import { useIntegrationTestsUtils } from '../../../__utils__/integration-utils/useIntegrationTestsUtils';
import { useValidationUtils } from '../../../__utils__/integration-utils/useValidationUtils';
import { StorageServiceSpy } from '../../../__utils__/spies/services/storage/StorageServiceSpy';
import { InquiryRepositorySpy } from '../../../__utils__/spies/repositories/InquiryRepositorySpy';
import { UserRepositorySpy } from '../../../__utils__/spies/repositories/UserRepositorySpy';
import { getAuthHeader } from '../../../__utils__/integration-utils/authUtils';
import { generator } from '../../../__utils__/generator';

import { InquirySetBookmarkFormData } from '../../../../src/resolvers/inquiry/input/InquirySetBookmarkFormData';
import { InquiryRemoveQuoteFormData } from '../../../../src/resolvers/inquiry/input/InquiryRemoveQuoteFormData';
import { InquiryAddQuoteFormData } from '../../../../src/resolvers/inquiry/input/InquiryAddQuoteFormData';
import { InquiryCreateFormData } from '../../../../src/resolvers/inquiry/input/InquiryCreateFormData';
import { InquiryUpdateFormData } from '../../../../src/resolvers/inquiry/input/InquiryUpdateFormData';
import { InquiryDeleteFormData } from '../../../../src/resolvers/inquiry/input/InquiryDeleteFormData';
import { InquiryResolver } from '../../../../src/resolvers/inquiry/InquiryResolver';
import { Category } from '../../../../src/entities/inquiry/Category';
import { User } from '../../../../src/entities/user/User';


describe('InquiryResolver', () => {

    const testUtils = useIntegrationTestsUtils();

    beforeEach(async () => {
        MockLogger.setupMocks();

        // repositories
        InquiryRepositorySpy.setupSpies();
        UserRepositorySpy.setupSpies();

        // services
        StorageServiceSpy.setupSpiesAndMockImplementations();
        StorageServiceSpy.getResources.mockResolvedValue([]);
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

    function expectInquiryNotFoundError(response: Response) {
        // verify if access was logged
        expect(MockLogger.info).toHaveBeenCalledTimes(1);
        expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access-error' }));

        // verify mutation response
        expect(response.body).toEqual({
            data: null,
            errors: [
                expect.objectContaining({
                    message: 'INQUIRY_NOT_FOUND',
                }),
            ],
        });
    }

    describe('all inquiries query', () => {

        const allInquiriesQuery = `
            query Inquiries {
              allInquiries {
                id
                title
                description
                location {
                  placeId
                  main
                  secondary
                  lat
                  lng
                }
                category
                author {
                  userSlug
                  name
                  avatar
                }
                quotes {
                  author {
                    userSlug
                    name
                    avatar
                  }
                  date
                  price {
                    currency
                    amount
                  }
                }
                createdAt
                updatedAt
              }
            }
        `;

        describe('validation', () => {

            const send = useValidationUtils<{}>({
                testUtils,
                resolverSpy: jest.spyOn(InquiryResolver.prototype, 'allInquiries'),
                query: allInquiriesQuery,
                validFormData: {},
            });

            it('should be accessible for unauthenticated users', async () => {
                await send.withoutAuth().expectValidationSuccess();
            });

        });

        it('should return user inquiries data', async () => {
            const userA = await testUtils.db.populateWithUser();
            const inquiryA = await testUtils.db.populateWithInquiry(userA.id);
            const userB = await testUtils.db.populateWithUser();
            const inquiryB = await testUtils.db.populateWithInquiry(userB.id, {
                quotes: [ {
                    author: userA.id,
                    date: new Date('2020-08-16T21:00:00.000Z'),
                    price: { currency: 'PLN', amount: 4.5 },
                } ],
            });

            StorageServiceSpy.getResources.mockImplementation((userId: string, directory: string, prefix?: string) => (
                (userId === userA.id)
                    ? Promise.resolve([ {
                        url: `url:${userId}/${directory}/${prefix}_sample.png`,
                        name: `${prefix}_sample.png`,
                        description: undefined,
                        createdAt: new Date(),
                    } ])
                    : Promise.resolve([])
            ));

            const response = await testUtils.postGraphQL({ query: allInquiriesQuery });

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    allInquiries: [
                        {
                            author: {
                                avatar: null,
                                name: userB.name,
                                userSlug: userB.slug,
                            },
                            id: inquiryB.id,
                            title: inquiryB.title,
                            description: inquiryB.description,
                            location: {
                                lat: inquiryB.location.lat,
                                lng: inquiryB.location.lng,
                                main: inquiryB.location.main,
                                placeId: inquiryB.location.placeId,
                                secondary: inquiryB.location.secondary,
                            },
                            category: inquiryB.category,
                            quotes: [ {
                                author: {
                                    userSlug: userA.slug,
                                    name: userA.name,
                                    avatar: `url:${userA.id}/public/avatar_sample.png`,
                                },
                                date: '2020-08-16T21:00:00.000Z',
                                price: { currency: 'PLN', amount: 4.5 },
                            } ],
                            createdAt: inquiryB.createdAt.toISOString(),
                            updatedAt: null,
                        },
                        {
                            author: {
                                avatar: `url:${userA.id}/public/avatar_sample.png`,
                                name: userA.name,
                                userSlug: userA.slug,
                            },
                            id: inquiryA.id,
                            title: inquiryA.title,
                            description: inquiryA.description,
                            location: {
                                lat: inquiryA.location.lat,
                                lng: inquiryA.location.lng,
                                main: inquiryA.location.main,
                                placeId: inquiryA.location.placeId,
                                secondary: inquiryA.location.secondary,
                            },
                            category: inquiryA.category,
                            quotes: [],
                            createdAt: inquiryA.createdAt.toISOString(),
                            updatedAt: null,
                        },
                    ],
                },
            });
        });

    });

    describe('create inquiry mutation', () => {

        const createInquiryMutation = `
            mutation CreateInquiry(
              $title: String!
              $description: String!
              $location: LocationFormData!
              $category: Category!
            ) {
              createInquiry(
                title: $title
                description: $description
                location: $location
                category: $category
              ) {
                id
                title
                description
                location {
                  placeId
                  main
                  secondary
                  lat
                  lng
                }
                category
                author {
                  userSlug
                  name
                  avatar
                }
              }
            }
        `;

        describe('validation', () => {

            const send = useValidationUtils<InquiryCreateFormData>({
                testUtils,
                resolverSpy: jest.spyOn(InquiryResolver.prototype, 'createInquiry'),
                query: createInquiryMutation,
                validFormData: {
                    title: 'sample title',
                    description: '[{"sample":"rich text description"}]',
                    location: {
                        placeId: 'ChIJ0RhONcBEFkcRv4pHdrW2a7Q',
                        main: 'Kraków',
                        secondary: 'Poland',
                        lat: 50,
                        lng: 19,
                    },
                    category: Category.DESIGNING,
                },
            });

            it('should return error when user is not authenticated', async () => {
                await send.withoutAuth().expectNotAuthorizedError();
            });

            it('should validate inquiry title', async () => {
                // should accept valid
                await send.withAuth({ title: 'a'.repeat(3) }).expectValidationSuccess();
                await send.withAuth({ title: 'a'.repeat(255) }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({ title: 'a'.repeat(2) }).expectValidationError('title');
                await send.withAuth({ title: 'a'.repeat(256) }).expectValidationError('title');
            });

            it('should validate inquiry description', async () => {
                // should accept valid
                await send.withAuth({ description: 'a'.repeat(3) }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({ description: 'a'.repeat(2) }).expectValidationError('description');
            });

            it('should validate inquiry location', async () => {
                // should accept valid
                await send.withAuth({
                    location: {
                        placeId: 'ChIJ0RhONcBEFkcRv4pHdrW2a7Q',
                        main: 'Kraków',
                        secondary: 'Poland',
                        lat: 50,
                        lng: 19,
                    },
                }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({
                    location: {
                        placeId: '',
                        main: '',
                        secondary: '',
                    },
                }).expectValidationError('location');
            });

            it('should validate inquiry category', async () => {
                // should accept valid
                await send.withAuth({ category: Category.DESIGNING }).expectValidationSuccess();
                await send.withAuth({ category: 'DESIGNING' as Category }).expectValidationSuccess();
            });

        });

        it('should create inquiry', async () => {
            const user = await testUtils.db.populateWithUser();
            const formData: InquiryCreateFormData = {
                title: 'sample title',
                description: '[{"sample":"rich text description"}]',
                location: {
                    placeId: 'ChIJ0RhONcBEFkcRv4pHdrW2a7Q',
                    main: 'Kraków',
                    secondary: 'Poland',
                    lat: 50,
                    lng: 19,
                },
                category: Category.DESIGNING,
            };
            const response = await testUtils.postGraphQL({
                query: createInquiryMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));

            // verify if new inquiry object was created and saved in db
            expect(InquiryRepositorySpy.create).toHaveBeenCalledTimes(1);
            expect(InquiryRepositorySpy.persistAndFlush).toHaveBeenCalledTimes(1);

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    createInquiry: {
                        author: {
                            avatar: null,
                            name: user.name,
                            userSlug: user.slug,
                        },
                        id: expect.any(String),
                        title: formData.title,
                        description: formData.description,
                        location: {
                            lat: formData.location.lat,
                            lng: formData.location.lng,
                            main: formData.location.main,
                            placeId: formData.location.placeId,
                            secondary: formData.location.secondary,
                        },
                        category: formData.category,
                    },
                },
            });
        });

    });

    describe('update inquiry mutation', () => {

        const updateInquiryMutation = `
            mutation UpdateInquiry(
              $inquiryId: String!
              $title: String!
              $description: String!
              $location: LocationFormData!
              $category: Category!
            ) {
              updateInquiry(
                inquiryId: $inquiryId
                title: $title
                description: $description
                location: $location
                category: $category
              ) {
                id
                title
                description
                location {
                  placeId
                  main
                  secondary
                  lat
                  lng
                }
                category
                author {
                  userSlug
                  name
                  avatar
                }
              }
            }
        `;

        describe('validation', () => {

            const send = useValidationUtils<InquiryUpdateFormData>({
                testUtils,
                resolverSpy: jest.spyOn(InquiryResolver.prototype, 'updateInquiry'),
                query: updateInquiryMutation,
                validFormData: {
                    inquiryId: '5f09e24646904045d48e5598',
                    title: 'sample title',
                    description: '[{"sample":"rich text description"}]',
                    location: {
                        placeId: 'ChIJ0RhONcBEFkcRv4pHdrW2a7Q',
                        main: 'Kraków',
                        secondary: 'Poland',
                        lat: 50,
                        lng: 19,
                    },
                    category: Category.DESIGNING,
                },
            });

            it('should return error when user is not authenticated', async () => {
                await send.withoutAuth().expectNotAuthorizedError();
            });

            it('should validate inquiry id', async () => {
                // should accept valid
                await send.withAuth({ inquiryId: '5f09e24646904045d48e5598' }).expectValidationSuccess();
                await send.withAuth({ inquiryId: '5f09e24646904045d48e5598' }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({ inquiryId: '' }).expectValidationError('inquiryId');
                await send.withAuth({ inquiryId: 'invalid-id' }).expectValidationError('inquiryId');
            });

            it('should validate inquiry title, description, location and category', async () => {
                await send.withAuth().expectValidationSuccess();
                // verify if ProductUpdateFormData is instance of ProductCreateFormData - and thus inherits its validation
                expect(InquiryResolver.prototype.updateInquiry).toHaveBeenCalledWith(expect.any(InquiryCreateFormData), expect.any(Object));
            });

        });

        it('should update inquiry', async () => {
            const user = await testUtils.db.populateWithUser();
            const inquiryToUpdate = await testUtils.db.populateWithInquiry(user.id);
            const formData: InquiryUpdateFormData = {
                inquiryId: inquiryToUpdate.id,
                title: 'Updated title',
                description: '[{"sample":"Updated description"}]',
                location: {
                    placeId: 'ChIJ0RhONcBEFkcRv4pHdrW2a7Q',
                    main: 'Updated',
                    secondary: 'Location',
                    lat: 50,
                    lng: 19,
                },
                category: Category.CARPENTRY,
            };
            const response = await testUtils.postGraphQL({
                query: updateInquiryMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));

            // verify if inquiry object was updated and saved in db
            expect(InquiryRepositorySpy.persistAndFlush).toHaveBeenCalledTimes(1);

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    updateInquiry: {
                        author: {
                            avatar: null,
                            name: user.name,
                            userSlug: user.slug,
                        },
                        id: inquiryToUpdate.id,
                        title: 'Updated title',
                        description: '[{"sample":"Updated description"}]',
                        location: {
                            placeId: 'ChIJ0RhONcBEFkcRv4pHdrW2a7Q',
                            main: 'Updated',
                            secondary: 'Location',
                            lat: 50,
                            lng: 19,
                        },
                        category: 'CARPENTRY',
                    },
                },
            });
        });

        it('should return error when user is not a inquiry owner', async () => {
            const inquiryOwner = await testUtils.db.populateWithUser();
            const user = await testUtils.db.populateWithUser();
            const inquiryToUpdate = await testUtils.db.populateWithInquiry(inquiryOwner.id);
            const formData: InquiryUpdateFormData = {
                inquiryId: inquiryToUpdate.id,
                title: 'Updated title',
                description: '[{"sample":"Updated description"}]',
                location: generator.location(),
                category: generator.inquiryCategory(),
            };
            const response = await testUtils.postGraphQL({
                query: updateInquiryMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));
            expectUserIsNotProductOwnerError(response);
        });

        it('should return error when inquiry is not found', async () => {
            const user = await testUtils.db.populateWithUser();
            const formData: InquiryUpdateFormData = {
                inquiryId: '5f09e24646904045d48e5598',
                title: 'Updated title',
                description: '[{"sample":"Updated description"}]',
                location: generator.location(),
                category: generator.inquiryCategory(),
            };
            const response = await testUtils.postGraphQL({
                query: updateInquiryMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));
            expectInquiryNotFoundError(response);
        });

    });

    describe('delete inquiry mutation', () => {

        const deleteInquiryMutation = `
            mutation DeleteInquiry($inquiryId: String!) {
              deleteInquiry(inquiryId: $inquiryId)
            }
        `;

        describe('validation', () => {

            const send = useValidationUtils<InquiryDeleteFormData>({
                testUtils,
                resolverSpy: jest.spyOn(InquiryResolver.prototype, 'deleteInquiry'),
                query: deleteInquiryMutation,
                validFormData: {
                    inquiryId: '5f09e24646904045d48e5598',
                },
            });

            it('should return error when user is not authenticated', async () => {
                await send.withoutAuth().expectNotAuthorizedError();
            });

            it('should validate inquiry id', async () => {
                // should accept valid
                await send.withAuth({ inquiryId: '5f09e24646904045d48e5598' }).expectValidationSuccess();
                await send.withAuth({ inquiryId: '5f09e24646904045d48e5598' }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({ inquiryId: '' }).expectValidationError('inquiryId');
                await send.withAuth({ inquiryId: 'invalid-id' }).expectValidationError('inquiryId');
            });

        });

        it('should delete inquiry', async () => {
            const user = await testUtils.db.populateWithUser();
            const inquiryToDelete = await testUtils.db.populateWithInquiry(user.id);
            const formData: InquiryDeleteFormData = {
                inquiryId: inquiryToDelete.id,
            };
            const response = await testUtils.postGraphQL({
                query: deleteInquiryMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    deleteInquiry: true,
                },
            });
        });

        it('should return error when user is not a inquiry owner', async () => {
            const inquiryOwner = await testUtils.db.populateWithUser();
            const user = await testUtils.db.populateWithUser();
            const inquiryToDelete = await testUtils.db.populateWithInquiry(inquiryOwner.id);
            const formData: InquiryDeleteFormData = {
                inquiryId: inquiryToDelete.id,
            };
            const response = await testUtils.postGraphQL({
                query: deleteInquiryMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));
            expectUserIsNotProductOwnerError(response);
        });

        it('should return error when inquiry is not found', async () => {
            const user = await testUtils.db.populateWithUser();
            const formData: InquiryDeleteFormData = {
                inquiryId: '5f09e24646904045d48e5598',
            };
            const response = await testUtils.postGraphQL({
                query: deleteInquiryMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));
            expectInquiryNotFoundError(response);
        });

    });

    describe('add quote mutation', () => {

        const addQuoteMutation = `
            mutation AddQuote($inquiryId: String!, $price: CurrencyAmountFormData!) {
              addQuote(inquiryId: $inquiryId, price: $price) {
                author {
                  userSlug
                  name
                  avatar
                }
                date
                price {
                  currency
                  amount
                }
              }
            }
        `;

        describe('validation', () => {

            const send = useValidationUtils<InquiryAddQuoteFormData>({
                testUtils,
                resolverSpy: jest.spyOn(InquiryResolver.prototype, 'addQuote'),
                query: addQuoteMutation,
                validFormData: {
                    inquiryId: '5f09e24646904045d48e5598',
                    price: { currency: 'PLN', amount: 4.5 },
                },
            });

            it('should return error when user is not authenticated', async () => {
                await send.withoutAuth().expectNotAuthorizedError();
            });

            it('should validate inquiry id', async () => {
                // should accept valid
                await send.withAuth({ inquiryId: '5f09e24646904045d48e5598' }).expectValidationSuccess();
                await send.withAuth({ inquiryId: '5f09e24646904045d48e5598' }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({ inquiryId: '' }).expectValidationError('inquiryId');
                await send.withAuth({ inquiryId: 'invalid-id' }).expectValidationError('inquiryId');
            });

            it('should validate quote price', async () => {
                // should accept valid
                await send.withAuth({ price: { currency: 'EUR', amount: 0 } }).expectValidationSuccess();
                await send.withAuth({ price: { currency: 'PLN', amount: 1e6 } }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({ price: { currency: '$', amount: 0 } }).expectValidationError('price');
                await send.withAuth({ price: { currency: 'EUR', amount: -1 } }).expectValidationError('price');
                await send.withAuth({ price: { currency: 'EUR', amount: 1e6 + 1 } }).expectValidationError('price');
            });

        });

        it('should add quote', async () => {
            const user = await testUtils.db.populateWithUser();
            const inquiry = await testUtils.db.populateWithInquiry(user.id);
            const formData: InquiryAddQuoteFormData = {
                inquiryId: inquiry.id,
                price: { currency: 'PLN', amount: 4.5 },
            };
            const response = await testUtils.postGraphQL({
                query: addQuoteMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));

            // verify if inquiry object was updated and saved in db
            expect(InquiryRepositorySpy.persistAndFlush).toHaveBeenCalledTimes(1);
            expect(InquiryRepositorySpy.persistAndFlush).toHaveBeenCalledWith(expect.objectContaining({
                quotes: [ {
                    author: user.id,
                    date: expect.any(Date),
                    price: { currency: 'PLN', amount: 4.5 },
                } ],
            }));

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    addQuote: [ {
                        author: {
                            userSlug: user.slug,
                            name: user.name,
                            avatar: null,
                        },
                        date: expect.any(String),
                        price: { currency: 'PLN', amount: 4.5 },
                    } ],
                },
            });
        });

        it('should return error when inquiry is not found', async () => {
            const user = await testUtils.db.populateWithUser();
            const formData: InquiryAddQuoteFormData = {
                inquiryId: '5f09e24646904045d48e5598',
                price: { currency: 'PLN', amount: 4.5 },
            };
            const response = await testUtils.postGraphQL({
                query: addQuoteMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));
            expectInquiryNotFoundError(response);
        });

    });

    describe('remove quote mutation', () => {

        const removeQuoteMutation = `
            mutation RemoveQuote($inquiryId: String!, $quoteDate: DateTime!) {
              removeQuote(inquiryId: $inquiryId, quoteDate: $quoteDate) {
                author {
                  userSlug
                  name
                  avatar
                }
                date
                price {
                  currency
                  amount
                }
              }
            }
        `;

        describe('validation', () => {

            const send = useValidationUtils<InquiryRemoveQuoteFormData>({
                testUtils,
                resolverSpy: jest.spyOn(InquiryResolver.prototype, 'removeQuote'),
                query: removeQuoteMutation,
                validFormData: {
                    inquiryId: '5f09e24646904045d48e5598',
                    quoteDate: new Date(),
                },
            });

            it('should return error when user is not authenticated', async () => {
                await send.withoutAuth().expectNotAuthorizedError();
            });

            it('should validate inquiry id', async () => {
                // should accept valid
                await send.withAuth({ inquiryId: '5f09e24646904045d48e5598' }).expectValidationSuccess();
                await send.withAuth({ inquiryId: '5f09e24646904045d48e5598' }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({ inquiryId: '' }).expectValidationError('inquiryId');
                await send.withAuth({ inquiryId: 'invalid-id' }).expectValidationError('inquiryId');
            });

            it('should validate quote date', async () => {
                // should accept valid
                await send.withAuth({ quoteDate: new Date() }).expectValidationSuccess();
                await send.withAuth({ quoteDate: '2020-08-16T21:00:00.000Z' as any }).expectValidationSuccess();
            });

        });

        it('should remove quote', async () => {
            const user = await testUtils.db.populateWithUser();
            const inquiry = await testUtils.db.populateWithInquiry(user.id, {
                quotes: [ {
                    author: user.id,
                    date: new Date('2020-08-16T23:00:00.000Z'),
                    price: { currency: 'PLN', amount: 4.5 },
                } ],
            });
            const formData: InquiryRemoveQuoteFormData = {
                inquiryId: inquiry.id,
                quoteDate: new Date('2020-08-16T23:00:00.000Z'),
            };
            const response = await testUtils.postGraphQL({
                query: removeQuoteMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));

            // verify if inquiry object was updated and saved in db
            expect(InquiryRepositorySpy.persistAndFlush).toHaveBeenCalledTimes(1);
            expect(InquiryRepositorySpy.persistAndFlush).toHaveBeenCalledWith(expect.objectContaining({
                quotes: [],
            }));

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    removeQuote: [],
                },
            });
        });

        it('should return error when inquiry is not found', async () => {
            const user = await testUtils.db.populateWithUser();
            const formData: InquiryRemoveQuoteFormData = {
                inquiryId: '5f09e24646904045d48e5598',
                quoteDate: new Date(),
            };
            const response = await testUtils.postGraphQL({
                query: removeQuoteMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));
            expectInquiryNotFoundError(response);
        });

    });

    describe('bookmark inquiry mutation', () => {

        const bookmarkInquiryMutation = `
            mutation BookmarkInquiry($inquiryId: String!, $bookmark: Boolean!) {
              bookmarkInquiry(inquiryId: $inquiryId, bookmark: $bookmark)
            }
        `;

        describe('validation', () => {

            const send = useValidationUtils<InquirySetBookmarkFormData>({
                testUtils,
                resolverSpy: jest.spyOn(InquiryResolver.prototype, 'bookmarkInquiry'),
                query: bookmarkInquiryMutation,
                validFormData: {
                    inquiryId: '5f09e24646904045d48e5598',
                    bookmark: true,
                },
            });

            it('should return error when user is not authenticated', async () => {
                await send.withoutAuth().expectNotAuthorizedError();
            });

            it('should validate inquiry id', async () => {
                // should accept valid
                await send.withAuth({ inquiryId: '5f09e24646904045d48e5598' }).expectValidationSuccess();
                await send.withAuth({ inquiryId: '5f09e24646904045d48e5598' }).expectValidationSuccess();
                // should reject invalid
                await send.withAuth({ inquiryId: '' }).expectValidationError('inquiryId');
                await send.withAuth({ inquiryId: 'invalid-id' }).expectValidationError('inquiryId');
            });

            it('should validate bookmark flag', async () => {
                // should accept valid
                await send.withAuth({ bookmark: true }).expectValidationSuccess();
                await send.withAuth({ bookmark: false }).expectValidationSuccess();
            });

        });

        it('should bookmark inquiry', async () => {
            const inquiryOwner = await testUtils.db.populateWithUser();
            const inquiry = await testUtils.db.populateWithInquiry(inquiryOwner.id);
            const user = await testUtils.db.populateWithUser({
                bookmarkedInquiries: [],
            });
            const formData: InquirySetBookmarkFormData = {
                inquiryId: inquiry.id,
                bookmark: true,
            };
            const response = await testUtils.postGraphQL({
                query: bookmarkInquiryMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));

            // verify if user was updated and saved in db
            expect(UserRepositorySpy.persistAndFlush).toHaveBeenCalledTimes(1);
            const updatedUserData = UserRepositorySpy.persistAndFlush.mock.calls[ 0 ][ 0 ] as User;
            expect(updatedUserData.bookmarkedInquiries.getIdentifiers()).toEqual([ inquiry.id ]);

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    bookmarkInquiry: [ inquiry.id ],
                },
            });
        });

        it('should remove bookmark', async () => {
            const inquiryOwner = await testUtils.db.populateWithUser();
            const inquiry = await testUtils.db.populateWithInquiry(inquiryOwner.id);
            const user = await testUtils.db.populateWithUser({
                bookmarkedInquiries: [ inquiry.id ],
            });
            const formData: InquirySetBookmarkFormData = {
                inquiryId: inquiry.id,
                bookmark: false,
            };
            const response = await testUtils.postGraphQL({
                query: bookmarkInquiryMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));

            // verify if user was updated and saved in db
            expect(UserRepositorySpy.persistAndFlush).toHaveBeenCalledTimes(1);
            const updatedUserData = UserRepositorySpy.persistAndFlush.mock.calls[ 0 ][ 0 ] as User;
            expect(updatedUserData.bookmarkedInquiries.getIdentifiers()).toEqual([]);

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: {
                    bookmarkInquiry: [],
                },
            });
        });

        it('should return error when try to bookmark own inquiry', async () => {
            const user = await testUtils.db.populateWithUser({
                bookmarkedInquiries: [],
            });
            const inquiry = await testUtils.db.populateWithInquiry(user.id);
            const formData: InquirySetBookmarkFormData = {
                inquiryId: inquiry.id,
                bookmark: true,
            };
            const response = await testUtils.postGraphQL({
                query: bookmarkInquiryMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));

            // verify if user was not updated and saved in db
            expect(UserRepositorySpy.persistAndFlush).toHaveBeenCalledTimes(0);

            // verify if access was logged
            expect(MockLogger.info).toHaveBeenCalledTimes(1);
            expect(MockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'access-error' }));

            // verify mutation response
            expect(response.body).toEqual({
                data: null,
                errors: [
                    expect.objectContaining({
                        message: 'CANNOT_BOOKMARK_OWN_INQUIRY',
                    }),
                ],
            });
        });

        it('should return error when inquiry is not found', async () => {
            const user = await testUtils.db.populateWithUser();
            const formData: InquirySetBookmarkFormData = {
                inquiryId: '5f09e24646904045d48e5598',
                bookmark: true,
            };
            const response = await testUtils.postGraphQL({
                query: bookmarkInquiryMutation,
                variables: formData,
            }).set('Authorization', getAuthHeader(user));
            expectInquiryNotFoundError(response);
        });

    });

});
