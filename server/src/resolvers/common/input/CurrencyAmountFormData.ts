import { Field, Float, InputType } from 'type-graphql';
import { Matches, Max, Min } from 'class-validator';


@InputType()
export class CurrencyAmountFormData {

    @Field()
    @Matches(/[A-Z]{3}/)
    currency!: string;

    @Field(() => Float)
    @Max(1e6)
    @Min(0)
    amount!: number;

}
