import { ArgsType, Field } from 'type-graphql';
import { Length } from 'class-validator';

import { IsSlug } from '../../../decorators/IsSlug';


@ArgsType()
export class ResourceDeleteFormData {

    @Field()
    @IsSlug()
    projectSlug!: string;

    @Field({ description: 'Project resource file name. Eg \'draft.pdf\'' })
    @Length(1, 255)
    resourceName!: string;

}
