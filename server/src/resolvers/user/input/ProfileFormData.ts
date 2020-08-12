import { ArgsType, Field } from 'type-graphql';

import { IsSlug } from '../../../decorators/IsSlug';


@ArgsType()
export class ProfileFormData {

    @Field()
    @IsSlug()
    userSlug!: string;

}
