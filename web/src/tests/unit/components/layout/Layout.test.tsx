import React from 'react';
import { render, screen } from '@testing-library/react';

import { Layout } from '../../../../code/components/layout/Layout';


jest.mock('../../../../code/components/layout/LayoutMobile', () => ({
    LayoutMobile: () => <div data-testid='MockLayoutMobile' />,
}));
jest.mock('../../../../code/components/layout/LayoutDesktop', () => ({
    LayoutDesktop: () => <div data-testid='MockLayoutDesktop' />,
}));

describe('Layout component', () => {

    afterEach(() => {
        delete window.matchMedia;
    });

    function setWindowWidth(width: number) {
        window.matchMedia = (mediaQuery) => {
            const match = mediaQuery.match(/min-width:(?<minWidth>\d+)px/);
            return {
                matches: Boolean(match?.groups && parseFloat(match.groups.minWidth) < width),
                addListener: jest.fn(),
                removeListener: jest.fn(),
            } as unknown as MediaQueryList;
        };
    }

    it('should render mobile layout', () => {
        setWindowWidth(414);
        render(<Layout>app content</Layout>);

        expect(screen.getByTestId('MockLayoutMobile')).toBeInTheDocument();
        expect(screen.queryByTestId('MockLayoutDesktop')).toBe(null);
    });

    it('should render desktop layout', () => {
        setWindowWidth(800);
        render(<Layout>app content</Layout>);

        expect(screen.queryByTestId('MockLayoutMobile')).toBe(null);
        expect(screen.getByTestId('MockLayoutDesktop')).toBeInTheDocument();
    });

});
