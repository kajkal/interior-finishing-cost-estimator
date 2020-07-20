import { ArgsType, Field } from 'type-graphql';
import { IsMongoId } from 'class-validator';
import { ResourceFormData } from '../../common/input/ResourceFormData';


@ArgsType()
export class ResourceCreateFormData extends ResourceFormData {

    @Field()
    @IsMongoId()
    projectId!: string;

}
