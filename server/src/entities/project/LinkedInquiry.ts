import { Field, ID, ObjectType } from 'type-graphql';
import { Property } from 'mikro-orm';


@ObjectType()
export class LinkedInquiry {

    @Field(() => ID)
    @Property()
    inquiryId!: string;

}
