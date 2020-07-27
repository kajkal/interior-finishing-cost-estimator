import React from 'react';
import { render, screen } from '@testing-library/react';

import { setWindowWidth } from '../../../__utils__/setWindowWidth';

import { Layout } from '../../../../code/components/layout/Layout';
import { mockComponent } from '../../../__utils__/mockComponent';


describe('Layout component', () => {

    beforeAll(() => {
        mockComponent('../../code/components/layout/LayoutMobile');
        mockComponent('../../code/components/layout/LayoutDesktop');
    });

    it('should render mobile layout', () => {
        setWindowWidth(414);
        render(<Layout>app content</Layout>);

        expect(screen.getByTestId('mock-LayoutMobile')).toBeInTheDocument();
        expect(screen.queryByTestId('mock-LayoutDesktop')).toBe(null);
    });

    it('should render desktop layout', () => {
        setWindowWidth(800);
        render(<Layout>app content</Layout>);

        expect(screen.queryByTestId('mock-LayoutMobile')).toBe(null);
        expect(screen.getByTestId('mock-LayoutDesktop')).toBeInTheDocument();
    });

});
