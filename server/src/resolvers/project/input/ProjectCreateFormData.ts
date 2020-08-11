import { ArgsType, Field } from 'type-graphql';
import { Length, ValidateNested } from 'class-validator';

import { LocationFormData } from '../../common/input/LocationFormData';


@ArgsType()
export class ProjectCreateFormData {

    @Field()
    @Length(3, 64)
    name!: string;

    @Field(() => LocationFormData, { nullable: true })
    @ValidateNested()
    location?: LocationFormData | null;

}
