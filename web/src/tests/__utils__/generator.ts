import { Chance } from 'chance';

import { Author, CurrencyAmount, Inquiry, Location, PriceQuote, Product, Project, ResourceData, Room, User } from '../../graphql/generated-types';
import { supportedCurrencies, supportedCurrenciesInfoMap } from '../../code/config/supportedCurrencies';
import { supportedCategories } from '../../code/config/supportedCategories';
import { supportedRoomTypes } from '../../code/config/supportedRoomTypes';


const chance = Chance();

let roomCounter = 0;
let locationCounter = 0;
let productCounter = 0;
let inquiryCounter = 0;
let projectCounter = 0;

function createSampleCurrencyAmount(data?: Partial<CurrencyAmount> | null): CurrencyAmount {
    const currency = generator.pickone(supportedCurrencies);
    const currencyDecimalPlaces = supportedCurrenciesInfoMap.get(currency)!.decimalPlaces;
    return {
        __typename: 'CurrencyAmount',
        currency,
        amount: generator.floating({ min: 0, max: 100, fixed: currencyDecimalPlaces }),
        ...data,
    };
}

function createSampleLocation(data?: Partial<Location> | null): Location {
    return {
        __typename: 'Location',
        placeId: data?.placeId || `location-${++locationCounter}`,
        main: chance.address(),
        secondary: chance.country({ full: true }),
        lat: chance.latitude(),
        lng: chance.longitude(),
        ...data,
    };
}

function createSampleResourceData(data?: Partial<ResourceData> | null): ResourceData {
    const { name, ...rest } = data || {};
    const _name = name || chance.word({ length: 5 }) + chance.pickone([ '.jpg', '.png' ]);
    return {
        __typename: 'ResourceData',
        url: `${chance.url({ protocol: 'https' })}/${_name}`,
        name: _name,
        description: null,
        createdAt: new Date().toISOString(),
        ...rest,
    };
}

function createSampleAuthor(data?: Partial<Author> | null): Author {
    const { name, ...rest } = data || {};
    const _name = name || chance.name();
    return {
        __typename: 'Author',
        name: _name,
        userSlug: _name.toLowerCase().replace(/\s/g, '-'),
        avatar: null,
        ...rest,
    };
}

function createSampleProduct(data?: Partial<Product> | null): Product {
    const { id, name, description, price, ...rest } = data || {};
    const _id = id || `product-${++productCounter}`;
    const _name = name || `${_id} name`;
    const _description = description || `${_id} description`;
    return {
        __typename: 'Product',
        id: _id,
        name: _name,
        description: `[{"children":[{"type":"p","children":[{"text":"${_description}"}]}]}]`,
        price: createSampleCurrencyAmount(price),
        tags: null,
        createdAt: new Date().toISOString(),
        updatedAt: null,
        ...rest,
    };
}

function createSampleQuote(data?: Partial<PriceQuote> | null): PriceQuote {
    const { author, price, ...rest } = data || {};
    return {
        __typename: 'PriceQuote',
        author: createSampleAuthor(author),
        price: createSampleCurrencyAmount(price),
        date: new Date().toISOString(),
        ...rest,
    };
}

function createSampleInquiry(data?: Partial<Inquiry> | null): Inquiry {
    const { id, title, description, location, author, ...rest } = data || {};
    const _id = id || `inquiry-${++inquiryCounter}`;
    const _title = title || `${_id} title`;
    const _description = description || `${_id} description`;
    return {
        __typename: 'Inquiry',
        id: _id,
        title: _title,
        description: `[{"children":[{"type":"p","children":[{"text":"${_description}"}]}]}]`,
        location: createSampleLocation(location),
        category: chance.pickone(supportedCategories),
        author: createSampleAuthor(author),
        quotes: null,
        createdAt: new Date().toISOString(),
        updatedAt: null,
        ...rest,
    };
}

function createSampleProject(data?: Partial<Project> | null): Project {
    const { name, slug, location, ...rest } = data || {};
    const _name = name || (slug?.replace(/-/g, ' ')) || `Project ${++projectCounter}`;
    const _slug = slug || _name.toLowerCase().replace(/\s/g, '-');
    return {
        __typename: 'Project',
        slug: _slug,
        name: _name,
        location: createSampleLocation(location),
        rooms: [],
        files: [],
        ...rest,
    };
}

function createSampleRoom(data?: Partial<Room> | null): Room {
    const { id, type, name, ...rest } = data || {};
    const _type = type || chance.pickone(supportedRoomTypes);
    const _id = id || `${_type.toLowerCase()}-${++roomCounter}`;
    const _name = name || _type.toLowerCase().replace(/-/g, ' ');
    return {
        __typename: 'Room',
        id: _id,
        type: _type,
        name: _name,
        floor: null,
        wall: null,
        ceiling: null,
        products: [],
        inquiries: [],
        ...rest,
    };
}

function createSampleUser(data?: Partial<User> | null): User {
    const { name, email, slug, ...rest } = data || {};
    const _name = name || chance.name();
    const _email = email || chance.email();
    const _slug = slug || _name.toLowerCase().replace(/\s/g, '-');
    return {
        __typename: 'User',
        email: _email,
        isEmailAddressConfirmed: null,
        hidden: null,
        name: _name,
        slug: _slug,
        products: [],
        avatar: null,
        projects: [],
        inquiries: [],
        bookmarkedInquiries: [],
        ...rest,
    };
}

chance.mixin({
    currencyAmount: createSampleCurrencyAmount,
    location: createSampleLocation,
    file: createSampleResourceData,
    product: createSampleProduct,
    author: createSampleAuthor,
    quote: createSampleQuote,
    inquiry: createSampleInquiry,
    user: createSampleUser,
    project: createSampleProject,
    room: createSampleRoom,
});

export interface Generator extends Chance.Chance {

    /**
     * @see createSampleCurrencyAmount
     */
    currencyAmount: (data?: Partial<CurrencyAmount> | null) => CurrencyAmount;

    /**
     * @see createSampleLocation
     */
    location: (data?: Partial<Location> | null) => Location;

    /**
     * @see createSampleResourceData
     */
    file: (data?: Partial<ResourceData> | null) => ResourceData;

    /**
     * @see createSampleProduct
     */
    product: (data?: Partial<Product> | null) => Product;

    /**
     * @see createSampleAuthor
     */
    author: (data?: Partial<Author> | null) => Author;

    /**
     * @see createSampleQuote
     */
    quote: (data?: Partial<PriceQuote> | null) => PriceQuote;

    /**
     * @see createSampleInquiry
     */
    inquiry: (data?: Partial<Inquiry> | null) => Inquiry;

    /**
     * @see createSampleUser
     */
    user: (data?: Partial<User> | null) => User;

    /**
     * @see createSampleProject
     */
    project: (data?: Partial<Project> | null) => Project;

    /**
     * @see createSampleRoom
     */
    room: (data?: Partial<Room> | null) => Room;

}

export const generator = chance as Generator;
