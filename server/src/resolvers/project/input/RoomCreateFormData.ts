import { ArgsType, Field, Float } from 'type-graphql';
import { IsMongoId, Length, Max, Min } from 'class-validator';

import { RoomType } from '../../../entities/project/RoomType';
import { IsSlug } from '../../../decorators/IsSlug';


@ArgsType()
export class RoomCreateFormData {

    @Field()
    @IsSlug()
    projectSlug!: string;

    @Field(() => RoomType)
    type!: RoomType;

    @Field()
    @Length(3, 255)
    name!: string;

    @Field(() => Float, { nullable: true })
    @Max(1e5)
    @Min(0)
    floor?: number | null;

    @Field(() => Float, { nullable: true })
    @Max(1e5)
    @Min(0)
    wall?: number | null;

    @Field(() => Float, { nullable: true })
    @Max(1e5)
    @Min(0)
    ceiling?: number | null;

    @Field(() => [ String ], { nullable: true })
    @IsMongoId({ each: true })
    productIds?: string[] | null;

    @Field(() => [ String ], { nullable: true })
    @IsMongoId({ each: true })
    inquiryIds?: string[] | null;

}
