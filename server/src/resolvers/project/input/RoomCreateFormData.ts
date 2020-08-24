import { ArgsType, Field, Float } from 'type-graphql';
import { Length, Max, Min, ValidateNested } from 'class-validator';

import { LinkedInquiryFormData } from './LinkedInquiryFormData';
import { LinkedProductFormData } from './LinkedProductFormData';
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

    @Field(() => [ LinkedProductFormData ], { nullable: true })
    @ValidateNested()
    products?: LinkedProductFormData[] | null;

    @Field(() => [ LinkedInquiryFormData ], { nullable: true })
    @ValidateNested()
    inquiries?: LinkedInquiryFormData[] | null;

}
