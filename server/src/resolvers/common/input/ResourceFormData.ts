import { ArgsType, Field } from 'type-graphql';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import { FileUpload, GraphQLUpload } from 'graphql-upload';


@ArgsType()
export class ResourceFormData {

    @Field(() => GraphQLUpload)
    @IsNotEmpty()
    file!: FileUpload;

    @Field({ nullable: true })
    @IsOptional()
    @Length(1, 255)
    description?: string;

}
