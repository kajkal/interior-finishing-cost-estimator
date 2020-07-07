import React from 'react';
import { render, screen } from '@testing-library/react';
import { FormikProvider } from 'formik';
import { FormikContextType } from 'formik/dist/types';

import { FormikSubmitButton } from '../../../../../code/components/common/form-fields/FormikSubmitButton';


describe('FormikSubmitButton component', () => {

    it('should render button with label \'Button label\'', () => {
        render(
            <FormikProvider value={{ isSubmitting: false } as FormikContextType<unknown>}>
                <FormikSubmitButton>
                    {'Button label'}
                </FormikSubmitButton>
            </FormikProvider>,
        );

        expect(screen.getByRole('button')).toHaveTextContent('Button label');
    });

    it('should render button with hidden label and visible spinner', () => {
        render(
            <FormikProvider value={{ isSubmitting: true } as FormikContextType<unknown>}>
                <FormikSubmitButton>
                    {'Button label'}
                </FormikSubmitButton>
            </FormikProvider>,
        );

        expect(screen.getByRole('button')).not.toHaveTextContent('Button label');
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

});
