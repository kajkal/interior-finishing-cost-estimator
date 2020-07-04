import React from 'react';
import { RecoilRoot } from 'recoil/dist';
import { fireEvent, render, RenderResult, screen } from '@testing-library/react';

import { LayoutMobile } from '../../../../code/components/layout/LayoutMobile';


describe('LayoutMobile component', () => {

    function renderLayoutWithTestElements(): RenderResult {
        return render(
            <RecoilRoot>
                <LayoutMobile
                    content={<div data-testid='content' />}
                    sideNav={<div data-testid='sideNav' />}
                    title={<div data-testid='title' />}
                />
            </RecoilRoot>,
        );
    }

    it('should render layout elements', () => {
        renderLayoutWithTestElements();

        expect(screen.getByTestId('content')).toBeInTheDocument();
        expect(screen.getByTestId('sideNav')).toBeInTheDocument();
        expect(screen.getByTestId('title')).toBeInTheDocument();
    });

    it('should open SideNav', () => {
        renderLayoutWithTestElements();

        const sideNavDrawer = screen.getByRole('presentation', { hidden: true });
        expect(sideNavDrawer).toHaveStyle({ visibility: 'hidden' });

        fireEvent.click(screen.getByRole('button', { name: 't:common.openSideNav' }));
        expect(sideNavDrawer).not.toHaveStyle({ visibility: 'hidden' });
    });

});
