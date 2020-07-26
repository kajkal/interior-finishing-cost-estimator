import React from 'react';
import { RecoilRoot } from 'recoil/dist';
import { render, screen } from '@testing-library/react';

import { PageLinearProgressRevealer } from '../../../../../code/components/common/progress-indicators/PageLinearProgressRevealer';
import { PageLinearProgress } from '../../../../../code/components/common/progress-indicators/PageLinearProgress';


describe('PageLinearProgress component', () => {

    const wrapper: React.ComponentType = ({ children }) => (
        <RecoilRoot>
            <PageLinearProgress />
            {children}
        </RecoilRoot>
    );

    it('should toggle linear progress visibility', () => {
        const { rerender } = render(<PageLinearProgressRevealer visible={false} />, { wrapper });
        expect(screen.getByRole('progressbar', { hidden: true })).not.toBeVisible();
        rerender(<PageLinearProgressRevealer visible={true} />);
        expect(screen.getByRole('progressbar')).toBeVisible();
    });

});
