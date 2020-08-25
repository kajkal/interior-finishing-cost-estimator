import { AbstractFieldController } from './AbstractFieldController';
import { getByPlaceholderText, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { NumberFieldController } from './NumberFieldController';
import { Product } from '../../../graphql/generated-types';
import { flushPromises } from '../extendedUserEvent';


export class ProductSelectorController extends AbstractFieldController {

    static from(inputElement: HTMLElement): ProductSelectorController {
        return this.resolve(inputElement) as ProductSelectorController;
    }

    selectProduct(product: Partial<Product>, amount: number): ProductSelectorController {
        return this.then(async (inputElement: HTMLElement) => {
            await userEvent.type(inputElement, product.name || '');
            const option = screen.getByTestId(`option-${product.id}`);
            userEvent.click(option);

            const productRow = screen.getByTestId(`product-${product.id}`);
            expect(productRow).toBeInTheDocument();

            const amountInput = getByPlaceholderText(productRow, 't:form.roomProductSelector.productAmount.placeholder');
            await NumberFieldController.from(amountInput).pasteAmount(amount.toString());

            await flushPromises();
            return inputElement;
        }) as ProductSelectorController;
    }

}
