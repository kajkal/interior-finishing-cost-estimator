import { ArgsType, Field } from 'type-graphql';
import { IsMongoId, Length } from 'class-validator';


@ArgsType()
export class ResourceDeleteFormData {

    @Field()
    @IsMongoId()
    projectId!: string;

    @Field({ description: 'Project resource file name. Eg \'draft.pdf\'' })
    @Length(1, 255)
    resourceName!: string;

}
