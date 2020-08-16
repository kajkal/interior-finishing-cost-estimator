import { Field, ObjectType } from 'type-graphql';

import { CurrencyAmount } from '../../../entities/common/CurrencyAmount';
import { Author } from './Author';


@ObjectType()
export class PriceQuote {

    @Field(() => Author)
    author!: Author;

    @Field()
    date!: Date;

    @Field()
    price!: CurrencyAmount;

}
