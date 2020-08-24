import { Field, Float, ID, ObjectType } from 'type-graphql';
import { Property } from 'mikro-orm';

import { LinkedProduct } from './LinkedProduct';
import { LinkedInquiry } from './LinkedInquiry';
import { RoomType } from './RoomType';


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

    @Field(() => [ LinkedProduct ], { nullable: true })
    @Property()
    products?: LinkedProduct[] | null;

    @Field(() => [ LinkedInquiry ], { nullable: true })
    @Property()
    inquiries?: LinkedInquiry[] | null;

}
