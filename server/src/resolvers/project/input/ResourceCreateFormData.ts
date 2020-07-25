import { ArgsType, Field } from 'type-graphql';

import { ResourceFormData } from '../../common/input/ResourceFormData';
import { IsSlug } from '../../../decorators/IsSlug';


@ArgsType()
export class ResourceCreateFormData extends ResourceFormData {

    @Field()
    @IsSlug()
    projectSlug!: string;

}
