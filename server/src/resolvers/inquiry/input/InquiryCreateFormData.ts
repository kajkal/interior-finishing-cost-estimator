import { ArgsType, Field } from 'type-graphql';
import { Length, ValidateNested } from 'class-validator';

import { LocationFormData } from '../../common/input/LocationFormData';
import { Category } from '../../../entities/inquiry/Category';


@ArgsType()
export class InquiryCreateFormData {

    @Field()
    @Length(3, 255)
    title!: string;

    @Field()
    @Length(3)
    description!: string;

    @Field(() => LocationFormData)
    @ValidateNested()
    location!: LocationFormData;

    @Field(() => Category)
    category!: Category;

}
