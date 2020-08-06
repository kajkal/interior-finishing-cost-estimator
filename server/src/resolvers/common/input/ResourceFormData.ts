import { ArgsType, Field } from 'type-graphql';
import { IsNotEmpty, Length } from 'class-validator';
import { FileUpload, GraphQLUpload } from 'graphql-upload';


@ArgsType()
export class ResourceFormData {

    @Field(() => GraphQLUpload)
    @IsNotEmpty()
    file!: FileUpload;

    @Field(() => String, { nullable: true })
    @Length(1, 255)
    description?: string | null;

}
