import { QueryOrder, wrap } from 'mikro-orm';
import { Inject, Service } from 'typedi';
import { ForbiddenError, UserInputError } from 'apollo-server-express';
import { Args, Authorized, Ctx, FieldResolver, Mutation, Query, Resolver, Root, UseMiddleware } from 'type-graphql';

import { InquirySetBookmarkFormData } from './input/InquirySetBookmarkFormData';
import { InquiryAddQuoteFormData } from './input/InquiryAddQuoteFormData';
import { AuthorizedContext } from '../../types/context/AuthorizedContext';
import { InquiryRepository } from '../../repositories/InquiryRepository';
import { StorageService } from '../../services/storage/StorageService';
import { InquiryCreateFormData } from './input/InquiryCreateFormData';
import { InquiryDeleteFormData } from './input/InquiryDeleteFormData';
import { InquiryUpdateFormData } from './input/InquiryUpdateFormData';
import { UserRepository } from '../../repositories/UserRepository';
import { Inquiry } from '../../entities/inquiry/Inquiry';
import { Quote } from '../../entities/inquiry/Quote';
import { logAccess } from '../../utils/logAccess';
import { PriceQuote } from './output/PriceQuote';
import { Author } from './output/Author';


@Service()
@Resolver(() => Inquiry)
export class InquiryResolver {

    @Inject()
    private readonly inquiryRepository!: InquiryRepository;

    @Inject()
    private readonly userRepository!: UserRepository;

    @Inject()
    private readonly storageService!: StorageService;


    @FieldResolver(() => Date)
    createdAt(@Root() inquiry: Inquiry): Date {
        return inquiry.createdAt;
    }

    @FieldResolver(() => Date, { nullable: true })
    updatedAt(@Root() inquiry: Inquiry): Date | undefined {
        return inquiry.updatedAt;
    }

    @FieldResolver(() => Author)
    async author(@Root() inquiry: Inquiry): Promise<Author> {
        const author = await inquiry.user.load();
        const [ avatar ] = await this.storageService.getResources(author.id, 'public', 'avatar');
        return {
            userSlug: author.slug,
            name: author.name,
            avatar: avatar?.url,
        };
    }

    @FieldResolver(() => [ PriceQuote ], { nullable: true })
    async quotes(@Root() inquiry: Inquiry): Promise<PriceQuote[]> {
        return this.getInquiryPriceQuotes(inquiry.quotes || []);
    }


    @UseMiddleware(logAccess)
    @Query(() => [ Inquiry ])
    async allInquiries(@Ctx() context: AuthorizedContext): Promise<Inquiry[]> {
        return this.inquiryRepository.findAll({
            populate: [ 'user' ],
            orderBy: { createdAt: QueryOrder.DESC },
        });
    }

    @Authorized()
    @UseMiddleware(logAccess)
    @Mutation(() => Inquiry)
    async createInquiry(@Args() data: InquiryCreateFormData, @Ctx() context: AuthorizedContext): Promise<Inquiry> {
        const { sub: userId } = context.jwtPayload;

        const inquiry = this.inquiryRepository.create({ ...data, user: userId });
        await this.inquiryRepository.persistAndFlush(inquiry);

        return inquiry;
    }

    @Authorized()
    @UseMiddleware(logAccess)
    @Mutation(() => Inquiry)
    async updateInquiry(@Args() { inquiryId, ...data }: InquiryUpdateFormData, @Ctx() context: AuthorizedContext): Promise<Inquiry> {
        const inquiryToUpdate = await this.inquiryRepository.findOne({ id: inquiryId });

        if (inquiryToUpdate) {
            if (inquiryToUpdate.user.id === context.jwtPayload.sub) {
                wrap(inquiryToUpdate).assign(data);
                await this.inquiryRepository.persistAndFlush(inquiryToUpdate);
                return inquiryToUpdate;
            }

            throw new ForbiddenError('RESOURCE_OWNER_ROLE_REQUIRED');
        }

        throw new UserInputError('INQUIRY_NOT_FOUND');
    }

    @Authorized()
    @UseMiddleware(logAccess)
    @Mutation(() => Boolean)
    async deleteInquiry(@Args() { inquiryId }: InquiryDeleteFormData, @Ctx() context: AuthorizedContext): Promise<boolean> {
        const inquiryToDelete = await this.inquiryRepository.findOne({ id: inquiryId });

        if (inquiryToDelete) {
            if (inquiryToDelete.user.id === context.jwtPayload.sub) {
                await this.inquiryRepository.removeAndFlush(inquiryToDelete);
                return true;
            }

            throw new ForbiddenError('RESOURCE_OWNER_ROLE_REQUIRED');
        }

        throw new UserInputError('INQUIRY_NOT_FOUND');
    }

    @Authorized()
    @UseMiddleware(logAccess)
    @Mutation(() => [ PriceQuote ])
    async addQuote(@Args() { inquiryId, price }: InquiryAddQuoteFormData, @Ctx() context: AuthorizedContext): Promise<PriceQuote[]> {
        const inquiry = await this.inquiryRepository.findOne({ id: inquiryId });

        if (inquiry) {
            const quotes = inquiry.quotes || [];
            inquiry.quotes = [ ...quotes, {
                author: context.jwtPayload.sub,
                date: new Date(),
                price,
            } ];
            await this.inquiryRepository.persistAndFlush(inquiry);
            return this.getInquiryPriceQuotes(inquiry.quotes);
        }

        throw new UserInputError('INQUIRY_NOT_FOUND');
    }

    @Authorized()
    @UseMiddleware(logAccess)
    @Mutation(() => [ String ])
    async bookmarkInquiry(@Args() { inquiryId, bookmark }: InquirySetBookmarkFormData, @Ctx() context: AuthorizedContext): Promise<string[]> {
        const user = await this.userRepository.findOneOrFail({ id: context.jwtPayload.sub });
        const inquiry = await this.inquiryRepository.findOne({ id: inquiryId });

        if (inquiry) {
            if (inquiry.user.id !== user.id) {
                const bookmarkedInquiries = new Set(user.bookmarkedInquiries);
                if (bookmark) {
                    bookmarkedInquiries.add(inquiry.id);
                } else {
                    bookmarkedInquiries.delete(inquiry.id);
                }
                user.bookmarkedInquiries = [ ...bookmarkedInquiries ];
                await this.userRepository.persistAndFlush(user);
                return user.bookmarkedInquiries;
            }

            throw new UserInputError('CANNOT_BOOKMARK_OWN_INQUIRY');
        }

        throw new UserInputError('INQUIRY_NOT_FOUND');
    }

    private async getInquiryPriceQuotes(quotes: Quote[]): Promise<PriceQuote[]> {
        const authorIds = new Set(quotes.map(({ author }) => author));
        const users = await this.userRepository.find({ id: { $in: [ ...authorIds ] } });
        const userIdAuthorMap = new Map<string, Author>();
        await Promise.all(users.map(async (user) => {
            const [ avatar ] = await this.storageService.getResources(user.id, 'public', 'avatar');
            userIdAuthorMap.set(user.id, {
                userSlug: user.slug,
                name: user.name,
                avatar: avatar?.url,
            });
        }));
        return quotes.map((quote) => ({
            ...quote,
            author: userIdAuthorMap.get(quote.author)!,
        }));
    }

}
