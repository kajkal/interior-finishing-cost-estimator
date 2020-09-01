import { fireEvent, getByText, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { supportedCurrencies } from '../../../code/config/supportedCurrencies';
import { extendedUserEvent, flushPromises } from '../extendedUserEvent';
import { AbstractFieldController } from './AbstractFieldController';


export class CurrencyAmountFieldController extends AbstractFieldController {

    static from(inputElement: HTMLElement): CurrencyAmountFieldController {
        return this.resolve(inputElement) as CurrencyAmountFieldController;
    }

    pasteAmount(value: string): this {
        return this.then(async (inputElement: HTMLElement) => {
            await extendedUserEvent.paste(inputElement, value);
            fireEvent.blur(inputElement);
            return inputElement;
        }) as this;
    }

    selectCurrency(currency?: typeof supportedCurrencies[number]): this {
        return this.then(async (inputElement: HTMLElement) => {
            if (!currency) {
                return inputElement;
            }

            if (!supportedCurrencies.includes(currency!)) {
                throw new Error(`Invalid currency: '${currency}' is not one of the supported currencies: [${supportedCurrencies.join(', ')}]`);
            }

            userEvent.click(screen.getByLabelText('t:form.common.currencyAmount.currencySelectAriaLabel'));
            const optionList = await screen.findByRole('listbox');
            const option = getByText(optionList, currency);
            expect(option).toBeDefined();

            userEvent.click(option!);

            await waitForElementToBeRemoved(optionList);

            await flushPromises();
            return inputElement;
        }) as this;
    }

}

