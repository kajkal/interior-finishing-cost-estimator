import { CurrencyAmount } from '../../graphql/generated-types';


export const supportedCurrenciesInfoMap = new Map([
    [ 'PLN', { decimalPlaces: 2 } ],
    [ 'EUR', { decimalPlaces: 2 } ],
    [ 'GBP', { decimalPlaces: 2 } ],
    // [ 'KRW', { decimalPlaces: 0 } ],
    // [ 'LYD', { decimalPlaces: 3 } ],
]);

export const supportedCurrencies = Array.from(supportedCurrenciesInfoMap.keys());

export function formatAmount(currencyAmount: CurrencyAmount): string {
    const config = supportedCurrenciesInfoMap.get(currencyAmount.currency);
    return (config)
        ? currencyAmount.amount.toFixed(config.decimalPlaces)
        : currencyAmount.amount.toString();
}
