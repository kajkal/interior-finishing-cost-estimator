import React from 'react';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import userEvent from '@testing-library/user-event';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { extendedUserEvent, flushPromises } from '../../../../__utils__/extendedUserEvent';

import { FormikCurrencyAmountField } from '../../../../../code/components/common/form-fields/currency-amount/FormikCurrencyAmountField';
import { CurrencyAmount } from '../../../../../code/components/common/form-fields/currency-amount/CurrencyAmountField';


jest.mock('../../../../../code/config/supportedCurrencies', () => ({
    supportedCurrenciesInfoMap: new Map([
        [ 'PLN', { decimalPlaces: 2 } ],
        [ 'KRW', { decimalPlaces: 0 } ],
        [ 'LYD', { decimalPlaces: 3 } ],
        [ '---', { decimalPlaces: 2 } ],
    ]),
    supportedCurrencies: [ 'PLN', 'KRW', 'LYD', '---' ],
}));

describe('FormikCurrencyAmountField component', () => {

    function createWrapper(mockHandleSubmit = jest.fn()): React.ComponentType {
        return ({ children }) => (
            <Formik
                initialValues={{
                    price: {
                        amount: undefined,
                        currency: 'PLN',
                    },
                }}
                validationSchema={Yup.object({
                    price: Yup.object<CurrencyAmount>({
                        currency: Yup.string()
                            .oneOf([ 'PLN', 'KRW', 'LYD' ], 'Currency not supported')
                            .required('Currency is required'),
                        amount: Yup.number()
                            .max(100, 'Price too large')
                            .required('Price is required'),
                    }).defined(),
                })}
                onSubmit={mockHandleSubmit}
            >
                {() => (
                    <Form>
                        {children}
                        <button type='submit' data-testid='submit-button' />
                    </Form>
                )}
            </Formik>
        );
    }

    class ViewUnderTest {
        static get amountInput() {
            return screen.getByLabelText('Price', { selector: 'input' }) as HTMLInputElement;
        }
        static get currencySelect() {
            return screen.getByLabelText('t:form.common.currencyAmount.currencySelectAriaLabel');
        }
        static get currencyOptions() {
            return screen.findAllByRole('option');
        }
        static get submitButton() {
            return screen.getByTestId('submit-button');
        }
        static async selectCurrency(currency: 'PLN' | '---' | 'KRW' | 'LYD') {
            userEvent.click(ViewUnderTest.currencySelect);
            const options = await ViewUnderTest.currencyOptions;
            const option = options.find(o => o.dataset.value === currency);
            expect(option).toBeDefined();
            userEvent.click(option!);
            await flushPromises();
        }
    }

    it('should pass CurrencyAmount object to submit handler', async () => {
        const handleSubmit = jest.fn();
        render(<FormikCurrencyAmountField name='price' label='Price' />, { wrapper: createWrapper(handleSubmit) });

        await extendedUserEvent.typeNumber(ViewUnderTest.amountInput, '21.50');
        userEvent.click(ViewUnderTest.submitButton);

        await waitFor(() => expect(handleSubmit).toHaveBeenCalledTimes(1));
        expect(handleSubmit).toHaveBeenCalledWith({
            price: {
                amount: 21.5,
                currency: 'PLN',
            },
        }, expect.any(Object));
    });

    it('should display error in case of failed currency validation', async () => {
        render(<FormikCurrencyAmountField name='price' label='Price' />, { wrapper: createWrapper() });

        userEvent.click(ViewUnderTest.currencySelect);

        // verify if currency options are visible
        const options = await ViewUnderTest.currencyOptions;
        expect(options).toHaveLength(4);
        expect(options.map(o => o.dataset.value)).toEqual([ 'PLN', 'KRW', 'LYD', '---' ]);
        expect(options.map(o => o.textContent)).toEqual([ 'PLN', 'KRW', 'LYD', '---' ]);

        // verify if error is visible
        userEvent.click(options[ 3 ]); // '---'
        fireEvent.blur(ViewUnderTest.amountInput);
        await waitFor(() => expect(ViewUnderTest.amountInput).toBeInvalid());
        expect(ViewUnderTest.amountInput).toHaveDescription('Currency not supported');
    });

    it('should display error in case of failed amount validation', async () => {
        render(<FormikCurrencyAmountField name='price' label='Price' />, { wrapper: createWrapper() });

        fireEvent.blur(ViewUnderTest.amountInput);

        // verify if error is visible
        await waitFor(() => expect(ViewUnderTest.amountInput).toBeInvalid());
        expect(ViewUnderTest.amountInput).toHaveDescription('Price is required');

        await extendedUserEvent.typeNumber(ViewUnderTest.amountInput, '100.4');

        // verify if error is visible
        await waitFor(() => expect(ViewUnderTest.amountInput).toBeInvalid());
        expect(ViewUnderTest.amountInput).toHaveDescription('Price too large');
    });

    it('should format amount with correct number of decimal places corresponding to currency', async () => {
        render(<FormikCurrencyAmountField name='price' label='Price' />, { wrapper: createWrapper() });

        // currency with 2 decimal places
        await ViewUnderTest.selectCurrency('PLN');
        await extendedUserEvent.typeNumber(ViewUnderTest.amountInput, '1.1111');
        expect(ViewUnderTest.amountInput).toHaveValue('1.11');

        // currency with 0 decimal places
        await ViewUnderTest.selectCurrency('KRW');
        await extendedUserEvent.typeNumber(ViewUnderTest.amountInput, '1.1111');
        expect(ViewUnderTest.amountInput).toHaveValue('1');

        // currency with 3 decimal places
        await ViewUnderTest.selectCurrency('LYD');
        await extendedUserEvent.typeNumber(ViewUnderTest.amountInput, '1.1111');
        expect(ViewUnderTest.amountInput).toHaveValue('1.111');
    });

});
