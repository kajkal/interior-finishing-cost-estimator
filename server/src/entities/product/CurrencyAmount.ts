import { Field, Float, ObjectType } from 'type-graphql';
import { Property } from 'mikro-orm';


@ObjectType()
export class CurrencyAmount {

    @Field()
    @Property()
    currency!: string;

    @Field(() => Float)
    @Property()
    amount!: number;

}
