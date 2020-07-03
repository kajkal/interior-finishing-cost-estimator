import * as React from 'react';
import { render } from '@testing-library/react';
import { FormikProvider } from 'formik';
import { FormikContextType } from 'formik/dist/types';

import { FormikSubmitButton } from '../../../../../code/components/common/form-fields/FormikSubmitButton';


describe('FormikSubmitButton component', () => {

    it('should render button with label \'Button label\'', () => {
        const { getByRole } = render(
            <FormikProvider value={{ isSubmitting: false } as FormikContextType<unknown>}>
                <FormikSubmitButton>
                    {'Button label'}
                </FormikSubmitButton>
            </FormikProvider>,
        );

        expect(getByRole('button')).toHaveTextContent('Button label');
    });

    it('should render button with hidden label and visible spinner', () => {
        const { getByRole } = render(
            <FormikProvider value={{ isSubmitting: true } as FormikContextType<unknown>}>
                <FormikSubmitButton>
                    {'Button label'}
                </FormikSubmitButton>
            </FormikProvider>,
        );

        expect(getByRole('button')).not.toHaveTextContent('Button label');
        expect(getByRole('progressbar')).toBeInTheDocument();
    });

});
