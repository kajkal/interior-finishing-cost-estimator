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

import { FormikTagsField } from '../../../../../code/components/common/form-fields/tags/FormikTagsField';
import { TagOption } from '../../../../../code/components/common/form-fields/tags/TagsField';


describe('FormikTagsField component', () => {

    const definedTagOptions = [
        { name: 'One' },
        { name: 'Two' },
        { name: 'Three' },
        { name: 'Four' },
    ];

    function renderInFormikContext(mockHandleSubmit = jest.fn()): RenderResult {
        return render(
            <Formik
                initialValues={{
                    tags: [],
                }}
                validationSchema={Yup.object({
                    tags: Yup.array<TagOption>().of(
                        Yup.object<TagOption>({
                            name: Yup.string().max(12, 'Tag name is too long').required(),
                        }).required(),
                    ).defined(),
                })}
                onSubmit={mockHandleSubmit}
            >
                {() => (
                    <Form>
                        <FormikTagsField name='tags' label='Tags' definedTagOptions={definedTagOptions} />
                        <button type='submit' data-testid='submit-button' />
                    </Form>
                )}
            </Formik>,
        );
    }

    class ViewUnderTest {
        static get tagsSelect() {
            return screen.getByLabelText('Tags', { selector: 'input' }) as HTMLInputElement;
        }
        static get tagOptions() {
            return screen.findAllByRole('option');
        }
        static get submitButton() {
            return screen.getByTestId('submit-button');
        }
    }

    it('should add tag by selecting already defined tag', async () => {
        const handleSubmit = jest.fn();
        renderInFormikContext(handleSubmit);

        userEvent.click(ViewUnderTest.tagsSelect);

        // verify if tag options are visible
        const options = await ViewUnderTest.tagOptions;
        expect(options).toHaveLength(4);
        expect(options.map(o => o.textContent)).toEqual([ 'One', 'Two', 'Three', 'Four' ]);

        // select defined option
        userEvent.click(options[ 2 ]);

        // verify if tag chip is visible
        expect(screen.getByRole('button', { name: 'Three' })).toBeVisible();

        userEvent.click(ViewUnderTest.submitButton);

        await waitFor(() => expect(handleSubmit).toHaveBeenCalledTimes(1));
        expect(handleSubmit).toHaveBeenCalledWith({
            tags: [
                { name: 'Three' },
            ],
        }, expect.any(Object));
    });

    it('should add tag after entering new tag name and clicking new tag option', async () => {
        const handleSubmit = jest.fn();
        renderInFormikContext(handleSubmit);

        // type new tag name
        await userEvent.type(ViewUnderTest.tagsSelect, 'New by click');

        // verify option label
        const options = await ViewUnderTest.tagOptions;
        expect(options).toHaveLength(1);
        expect(options[ 0 ]).toHaveTextContent('t:form.common.tags.addTag:{"tagName":"New by click"}');

        // confirm tag creation
        userEvent.click(options[ 0 ]);

        // verify if tags chips are visible
        expect(screen.getByRole('button', { name: 'New by click' })).toBeVisible();

        userEvent.click(ViewUnderTest.submitButton);

        await waitFor(() => expect(handleSubmit).toHaveBeenCalledTimes(1));
        expect(handleSubmit).toHaveBeenCalledWith({
            tags: [
                { name: 'New by click', label: 't:form.common.tags.addTag:{"tagName":"New by click"}' },
            ],
        }, expect.any(Object));
    });

    it('should add tag after entering new tag name and clicking enter', async () => {
        const handleSubmit = jest.fn();
        renderInFormikContext(handleSubmit);

        // type new tag name
        await userEvent.type(ViewUnderTest.tagsSelect, '  New by enter  {enter}'); // name should be trimmed

        // verify if tags chips are visible
        expect(screen.getByRole('button', { name: 'New by enter' })).toBeVisible();

        userEvent.click(ViewUnderTest.submitButton);

        await waitFor(() => expect(handleSubmit).toHaveBeenCalledTimes(2)); // actually is called once
        expect(handleSubmit).toHaveBeenCalledWith({
            tags: [
                { name: 'New by enter', label: 't:form.common.tags.addTag:{"tagName":"New by enter"}' },
            ],
        }, expect.any(Object));
    });

    it('should ignore empty new tag\' names', async () => {
        const handleSubmit = jest.fn();
        renderInFormikContext(handleSubmit);

        // type new tag name
        await userEvent.type(ViewUnderTest.tagsSelect, '    {enter}');

        userEvent.click(ViewUnderTest.submitButton);

        await waitFor(() => expect(handleSubmit).toHaveBeenCalledTimes(2));
        expect(handleSubmit).toHaveBeenCalledWith({
            tags: [],
        }, expect.any(Object));
    });

    it('should parse and display error in case of failed tag name validation', async () => {
        const handleSubmit = jest.fn();
        renderInFormikContext(handleSubmit);

        // type new tag name
        await userEvent.type(ViewUnderTest.tagsSelect, 'Definitely too long tag name{enter}');

        await waitFor(() => expect(ViewUnderTest.tagsSelect).toBeInvalid());
        expect(ViewUnderTest.tagsSelect).toHaveDescription('Tag name is too long');
    });

});
