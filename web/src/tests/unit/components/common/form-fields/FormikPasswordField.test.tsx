import React from 'react';
import { Form, Formik } from 'formik';
import userEvent from '@testing-library/user-event';
import { render, RenderResult } from '@testing-library/react';

import { FormikPasswordField } from '../../../../../code/components/common/form-fields/FormikPasswordField';


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

        const toggleButton = getByRole('button', { name: 't:form.password.toggleVisibility' });
        userEvent.click(toggleButton);

        expect(passwordInput).toHaveAttribute('type', 'text');
    });

});
