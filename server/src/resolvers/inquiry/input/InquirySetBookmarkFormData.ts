import { ArgsType, Field } from 'type-graphql';
import { IsMongoId } from 'class-validator';


@ArgsType()
export class InquirySetBookmarkFormData {

    @Field()
    @IsMongoId()
    inquiryId!: string;

    @Field()
    bookmark!: boolean;

}
