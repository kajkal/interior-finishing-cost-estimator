/**
 * @jest-environment jsdom-sixteen
 *
 * ^ because of 'Error: Uncaught [TypeError: document.createRange is not a function]'
 */

import React from 'react';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import userEvent from '@testing-library/user-event';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';

import { FormikCategoryField } from '../../../../../code/components/common/form-fields/category/FormikCategoryField';
import { supportedCategories } from '../../../../../code/config/supportedCategories';


jest.mock('../../../../../code/config/supportedCategories', () => ({
    categoryConfigMap: {
        PIPING: { tKey: 'categories.piping' },
        CARPENTRY: { tKey: 'categories.carpentry' },
        DESIGNING: { tKey: 'categories.designing' },
    },
    supportedCategories: [ 'PIPING', 'CARPENTRY', 'DESIGNING' ],
}));

describe('FormikCategoriesField component', () => {

    function renderInFormikContext(mockHandleSubmit = jest.fn()): RenderResult {
        return render(
            <Formik
                initialValues={{
                    category: null,
                }}
                validationSchema={Yup.object({
                    category: Yup.mixed().oneOf([ ...supportedCategories, null ])
                        .nullable()
                        .required('category is required'),
                })}
                onSubmit={mockHandleSubmit}
            >
                <Form>
                    <FormikCategoryField name='category' label='Category' />
                    <button type='submit' data-testid='submit-button' />
                </Form>
            </Formik>,
        );
    }

    class ViewUnderTest {
        static get categorySelect() {
            return screen.getByLabelText('Category', { selector: 'input' }) as HTMLInputElement;
        }
        static get categoryOptions() {
            return screen.findAllByRole('option');
        }
        static get submitButton() {
            return screen.getByTestId('submit-button');
        }
    }

    it('should select category', async () => {
        const handleSubmit = jest.fn();
        renderInFormikContext(handleSubmit);

        userEvent.click(ViewUnderTest.categorySelect);

        // verify if all category options are visible
        const options = await ViewUnderTest.categoryOptions;
        expect(options).toHaveLength(3);
        expect(options.map(o => o.textContent)).toEqual([
            't:categories.piping',
            't:categories.carpentry',
            't:categories.designing',
        ]);

        userEvent.click(options[ 2 ]);

        // verify if input value was changed
        expect(ViewUnderTest.categorySelect).toHaveValue('t:categories.designing');

        userEvent.click(ViewUnderTest.submitButton);

        await waitFor(() => expect(handleSubmit).toHaveBeenCalledTimes(1));
        expect(handleSubmit).toHaveBeenCalledWith({
            category: 'DESIGNING',
        }, expect.any(Object));
    });

    it('should parse and display error in case of failed category validation', async () => {
        renderInFormikContext();

        // verify when category is missing
        userEvent.click(ViewUnderTest.submitButton);

        await waitFor(() => expect(ViewUnderTest.categorySelect).toBeInvalid());
        expect(ViewUnderTest.categorySelect).toHaveDescription('category is required');
    });

});


