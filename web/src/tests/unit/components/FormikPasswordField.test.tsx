import * as React from 'react';
import { Form, Formik } from 'formik';
import { fireEvent, render, RenderResult } from '@testing-library/react';

import { FormikPasswordField } from '../../../code/components/common/form-fields/FormikPasswordField';


describe('FormikPasswordField component', () => {

    function renderInFormikContext(): RenderResult {
        return render(
            <Formik
                initialValues={{ password: '' }}
                onSubmit={jest.fn()}
            >
                {() => (
                    <Form>
                        <FormikPasswordField
                            id='component-under-test'
                            name='password'
                            label='Password'
                        />
                    </Form>
                )}
            </Formik>,
        );
    }

    it('should toggle input type on visibility button click', () => {
        const { getByRole, getByLabelText } = renderInFormikContext();

        const passwordInput = getByLabelText('Password', { selector: 'input' });
        expect(passwordInput).toHaveAttribute('type', 'password');

        const toggleButton = getByRole('button', { name: 'toggle password visibility' });
        fireEvent.mouseDown(toggleButton);
        fireEvent.click(toggleButton);

        expect(passwordInput).toHaveAttribute('type', 'text');
    });

});
