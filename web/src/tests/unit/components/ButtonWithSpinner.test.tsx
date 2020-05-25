import * as React from 'react';
import { render } from '@testing-library/react';

import { ButtonWithSpinner } from '../../../code/components/common/progress-indicators/ButtonWithSpinner';


describe('ButtonWithSpinner component', () => {

    it('should render button with label \'Button label\'', () => {
        const { getByRole } = render(
            <ButtonWithSpinner>
                {'Button label'}
            </ButtonWithSpinner>,
        );

        expect(getByRole('button')).toHaveTextContent('Button label');
    });

    it('should render button with hidden label and visible spinner', () => {
        const { getByRole } = render(
            <ButtonWithSpinner isSpinning>
                {'Button label'}
            </ButtonWithSpinner>,
        );

        expect(getByRole('button')).not.toHaveTextContent('Button label');
        expect(getByRole('progressbar')).toBeInTheDocument();
    });

});
