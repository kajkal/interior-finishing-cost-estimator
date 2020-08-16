import { Chance } from 'chance';
import { Location } from '../../src/entities/common/Location';
import { Category } from '../../src/entities/inquiry/Category';


const chance = Chance();
chance.mixin({
    location: (): Location => ({
        placeId: chance.hash(),
        main: chance.city(),
        secondary: chance.country({ full: true }),
        lat: chance.latitude({ min: 45, max: 55 }),
        lng: chance.longitude({ min: 18, max: 21 }),
    }),
    inquiryCategory: () => (
        generator.pickone(Object.keys(Category))
    ),
});

export interface Generator extends Chance.Chance {
    location: () => Location;
    inquiryCategory: () => Category;
}

export const generator = chance as Generator;
