import React from 'react';
import { Form, Formik } from 'formik';
import userEvent from '@testing-library/user-event';
import { render, RenderResult, screen } from '@testing-library/react';

import { FormikPasswordField } from '../../../../code/components/common/form-fields/FormikPasswordField';


describe('FormikPasswordField component', () => {

    function renderInFormikContext(): RenderResult {
        return render(
            <Formik
                initialValues={{ password: '' }}
                onSubmit={jest.fn()}
            >
                {() => (
                    <Form>
                        <FormikPasswordField name='password' label='Password' />
                    </Form>
                )}
            </Formik>,
        );
    }

    it('should toggle input type on visibility button click', () => {
        renderInFormikContext();

        const passwordInput = screen.getByLabelText('Password', { selector: 'input' });
        expect(passwordInput).toHaveAttribute('type', 'password');

        const toggleButton = screen.getByRole('button', { name: 't:form.password.toggleVisibility' });
        userEvent.click(toggleButton);

        expect(passwordInput).toHaveAttribute('type', 'text');
    });

});
