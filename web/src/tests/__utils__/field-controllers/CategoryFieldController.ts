import { fireEvent, getByTitle, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { mockTFunction } from '../../__mocks__/libraries/react-i18next';

import { categoryConfigMap, supportedCategories } from '../../../code/config/supportedCategories';
import { AbstractFieldController } from './AbstractFieldController';
import { Category } from '../../../graphql/generated-types';
import { flushPromises } from '../extendedUserEvent';


export class CategoryFieldController extends AbstractFieldController {

    static from(inputElement: HTMLElement): CategoryFieldController {
        return this.resolve(inputElement) as CategoryFieldController;
    }

    clearCategory(): CategoryFieldController {
        return this.then(async (inputElement: HTMLElement) => {
            userEvent.click(inputElement);
            userEvent.click(getByTitle(inputElement.parentElement!, 't:form.common.clear'));

            fireEvent.blur(inputElement);
            await flushPromises();
            return inputElement;
        }) as CategoryFieldController;
    }

    selectCategory(category: string) {
        return this.then(async (inputElement: HTMLElement) => {
            if (!supportedCategories.includes(category as Category)) {
                throw new Error(`Invalid category: '${category}' is not one of the supported categories: [${supportedCategories.join(', ')}]`);
            }

            const categoryLabel = mockTFunction(categoryConfigMap[ category as Category ].tKey);
            userEvent.click(inputElement);
            userEvent.click(screen.getByText(categoryLabel));

            fireEvent.blur(inputElement);
            await flushPromises();
            return inputElement;
        }) as CategoryFieldController;
    }

}
