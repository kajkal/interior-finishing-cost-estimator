import { Property } from 'mikro-orm';
import { CurrencyAmount } from '../common/CurrencyAmount';


/**
 * Estimated price of a job/service - response to a inquiry.
 */
export class Quote {

    @Property()
    author!: string;

    @Property()
    date!: Date;

    @Property()
    price!: CurrencyAmount;

}
