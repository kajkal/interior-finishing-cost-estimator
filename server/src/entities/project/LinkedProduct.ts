import { Field, Float, ID, ObjectType } from 'type-graphql';
import { Property } from 'mikro-orm';


@ObjectType()
export class LinkedProduct {

    @Field(() => ID)
    @Property()
    productId!: string;

    @Field(() => Float)
    @Property()
    amount!: number;

}
