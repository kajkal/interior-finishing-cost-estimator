import React from 'react';
import { Form, Formik } from 'formik';
import { render, screen } from '@testing-library/react';

import { FormikTextField } from '../../../../code/components/common/form-fields/FormikTextField';


describe('FormikTextField component', () => {

    const wrapper: React.ComponentType = ({ children }) => (
        <Formik
            initialValues={{ title: '' }}
            onSubmit={jest.fn()}
        >
            {() => (
                <Form>
                    {children}
                </Form>
            )}
        </Formik>
    );

    it('should render optional field indicator when field is marked as optional', () => {
        const { rerender } = render(<FormikTextField name='title' label='Title' />, { wrapper });

        const input = screen.getByLabelText(/Title/) as HTMLInputElement;
        expect(input.labels).toHaveLength(1);

        // verify if field label does not contain indicator of optional field
        expect(input.labels![ 0 ]).not.toHaveTextContent(/optional/i);

        rerender(<FormikTextField name='title' label='Title' optional />);

        // verify if indicator of optional field is visible
        expect(input.labels![ 0 ]).toHaveTextContent(/optional/i);
    });

});
