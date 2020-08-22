import { Field, Float, ID, ObjectType } from 'type-graphql';
import { Property } from 'mikro-orm';

import { RoomType } from './RoomType';


/**
 * Estimated price of a job/service - response to a inquiry.
 */
@ObjectType()
export class Room {

    @Field(() => ID)
    @Property()
    id!: string;

    @Field(() => RoomType)
    @Property()
    type!: RoomType;

    @Field({ description: 'Custom room name' })
    @Property()
    name!: string;

    @Field(() => Float, { nullable: true, description: 'Floor area in square metres' })
    @Property()
    floor?: number | null;

    @Field(() => Float, { nullable: true, description: 'Wall area in square metres' })
    @Property()
    wall?: number | null;

    @Field(() => Float, { nullable: true, description: 'Ceiling area in square metres' })
    @Property()
    ceiling?: number | null;

    @Field(() => [ String ], { nullable: true })
    @Property()
    productIds?: string[] | null;

    @Field(() => [ String ], { nullable: true })
    @Property()
    inquiryIds?: string[] | null;

}
