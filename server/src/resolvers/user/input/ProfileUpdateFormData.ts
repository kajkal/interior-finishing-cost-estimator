import { ArgsType, Field } from 'type-graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { IsNotEmpty, Length, ValidateNested } from 'class-validator';

import { LocationFormData } from '../../common/input/LocationFormData';


@ArgsType()
export class ProfileUpdateFormData {

    @Field(() => GraphQLUpload, {
        nullable: true,
        description: 'New avatar will replace existing one, missing new avatar will leave current avatar as it is. Use {removeCurrentAvatar} flag to remove current avatar.',
    })
    @IsNotEmpty()
    avatar?: FileUpload | null;

    @Field(() => Boolean, {
        nullable: true,
        description: 'By setting this to true current avatar will be removed',
    })
    removeCurrentAvatar?: boolean | null;

    @Field(() => String, { nullable: true })
    @Length(3)
    description?: string | null;

    @Field(() => LocationFormData, { nullable: true })
    @ValidateNested()
    location?: LocationFormData | null;

}
