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

import { FormikRoomTypeField } from '../../../../../code/components/common/form-fields/room-type/FormikRoomTypeField';
import { supportedRoomTypes } from '../../../../../code/config/supportedRoomTypes';


jest.mock('../../../../../code/config/supportedRoomTypes', () => ({
    roomTypeConfigMap: {
        BATHROOM: { tKey: 'project.roomType.bathroom', Icon: () => null },
        BEDROOM: { tKey: 'project.roomType.bedroom', Icon: () => null },
        KITCHEN: { tKey: 'project.roomType.kitchen', Icon: () => null },
    },
    supportedRoomTypes: [ 'BATHROOM', 'BEDROOM', 'KITCHEN' ],
}));

describe('FormikRoomTypeField component', () => {

    function renderInFormikContext(mockHandleSubmit = jest.fn()): RenderResult {
        return render(
            <Formik
                initialValues={{
                    type: null,
                }}
                validationSchema={Yup.object({
                    type: Yup.mixed().oneOf([ ...supportedRoomTypes, null ])
                        .nullable()
                        .required('type is required'),
                })}
                onSubmit={mockHandleSubmit}
            >
                <Form>
                    <FormikRoomTypeField name='type' label='Type' />
                    <button type='submit' data-testid='submit-button' />
                </Form>
            </Formik>,
        );
    }

    class ViewUnderTest {
        static get roomTypeSelect() {
            return screen.getByLabelText('Type', { selector: 'input' }) as HTMLInputElement;
        }
        static get roomTypeOptions() {
            return screen.findAllByRole('option');
        }
        static get submitButton() {
            return screen.getByTestId('submit-button');
        }
    }

    it('should select room type', async () => {
        const handleSubmit = jest.fn();
        renderInFormikContext(handleSubmit);

        userEvent.click(ViewUnderTest.roomTypeSelect);

        // verify if all category options are visible
        const options = await ViewUnderTest.roomTypeOptions;
        expect(options).toHaveLength(3);
        expect(options.map(o => o.textContent)).toEqual([
            't:project.roomType.bathroom',
            't:project.roomType.bedroom',
            't:project.roomType.kitchen',
        ]);

        userEvent.click(options[ 2 ]);

        // verify if input value was changed
        expect(ViewUnderTest.roomTypeSelect).toHaveValue('t:project.roomType.kitchen');

        userEvent.click(ViewUnderTest.submitButton);

        await waitFor(() => expect(handleSubmit).toHaveBeenCalledTimes(1));
        expect(handleSubmit).toHaveBeenCalledWith({
            type: 'KITCHEN',
        }, expect.any(Object));
    });

    it('should display error in case of failed room type validation', async () => {
        renderInFormikContext();

        // verify when category is missing
        userEvent.click(ViewUnderTest.submitButton);

        await waitFor(() => expect(ViewUnderTest.roomTypeSelect).toBeInvalid());
        expect(ViewUnderTest.roomTypeSelect).toHaveDescription('type is required');
    });

});
