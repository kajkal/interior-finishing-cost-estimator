import { registerEnumType } from 'type-graphql';


export enum RoomType {
    BALCONY = 'BALCONY',
    BATHROOM = 'BATHROOM',
    BEDROOM = 'BEDROOM',
    CLOSET = 'CLOSET',
    GARAGE = 'GARAGE',
    KIDS_ROOM = 'KIDS_ROOM',
    KITCHEN = 'KITCHEN',
    LAUNDRY = 'LAUNDRY',
    LIVING_ROOM = 'LIVING_ROOM',
    OFFICE = 'OFFICE',
    OTHER = 'OTHER',
}

registerEnumType(RoomType, {
    name: 'RoomType',
});
