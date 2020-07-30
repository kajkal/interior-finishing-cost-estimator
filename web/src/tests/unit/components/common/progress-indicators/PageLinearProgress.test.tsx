import React from 'react';
import { RecoilRoot } from 'recoil/dist';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PageLinearProgress } from '../../../../../code/components/common/progress-indicators/PageLinearProgress';
import { usePageLinearProgressRevealer } from '../../../../../code/components/common/progress-indicators/usePageLinearProgressRevealer';


describe('PageLinearProgress component', () => {

    const wrapper: React.ComponentType = ({ children }) => (
        <RecoilRoot>
            <PageLinearProgress />
            {children}
        </RecoilRoot>
    );

    it('should toggle linear progress visibility', () => {
        const SampleComponent = () => {
            const [ checked, setChecked ] = React.useState(false);
            usePageLinearProgressRevealer(checked);
            return <input type='checkbox' onChange={({ target: { checked } }) => setChecked(checked)} />;
        };
        render(<SampleComponent />, { wrapper });

        // verify if progress is not visible
        expect(screen.getByRole('progressbar', { hidden: true })).not.toBeVisible();

        userEvent.click(screen.getByRole('checkbox'));

        // verify if progress is visible
        expect(screen.getByRole('progressbar')).toBeVisible();
    });

});
