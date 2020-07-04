import React from 'react';
import { RecoilRoot } from 'recoil/dist';
import { fireEvent, render, RenderResult, screen } from '@testing-library/react';

import { LayoutDesktop } from '../../../../code/components/layout/LayoutDesktop';


describe('LayoutDesktop component', () => {

    function renderLayoutWithTestElements(): RenderResult {
        return render(
            <RecoilRoot>
                <LayoutDesktop
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

    it('should expand SideNav then collapse SideNav', () => {
        renderLayoutWithTestElements();

        const sideNavDrawer = document.querySelector('.MuiDrawer-root')!;
        expect(sideNavDrawer).toBeInTheDocument();
        expect(sideNavDrawer.className).toContain('Close');

        fireEvent.click(screen.getByRole('button', { name: 't:common.expandSideNav' }));
        expect(sideNavDrawer.className).toContain('Open');

        fireEvent.click(screen.getByRole('button', { name: 't:common.collapseSideNav' }));
        expect(sideNavDrawer.className).toContain('Close');
    });

});
