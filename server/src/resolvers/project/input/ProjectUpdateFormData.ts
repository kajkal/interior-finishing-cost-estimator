import { ArgsType, Field } from 'type-graphql';

import { ProjectCreateFormData } from './ProjectCreateFormData';
import { IsSlug } from '../../../decorators/IsSlug';


@ArgsType()
export class ProjectUpdateFormData extends ProjectCreateFormData {

    @Field()
    @IsSlug()
    projectSlug!: string;

}
