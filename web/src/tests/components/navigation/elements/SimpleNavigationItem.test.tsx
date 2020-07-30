import React from 'react';
import { render, screen } from '@testing-library/react';

import { MockRouter } from '../../../__utils__/context-providers/MockRouter';

import { SimpleNavigationItem } from '../../../../code/components/navigation/basic/SimpleNavigationItem';


describe('SimpleNavigationItem component', () => {

    it('should render NacLink with tooltip', () => {
        const { rerender } = render(<SimpleNavigationItem
            to='/example'
            label='Sample label'
            ariaLabel='Sample aria label'
            Icon={() => <div data-testid='SampleIcon' />}
            isSideNavOpen={false}
        />, { wrapper: MockRouter });

        // verify anchor data
        const link = screen.getByRole('button', { name: 'Sample aria label' });
        expect(link).toHaveAttribute('href', '/example');
        expect(link).toHaveTextContent('Sample label');
        expect(screen.getByTestId('SampleIcon')).toBeInTheDocument();

        // verify tooltip
        expect(link).toHaveAttribute('title', 'Sample aria label');
        rerender(
            <SimpleNavigationItem
                to='/example'
                label='Sample label'
                ariaLabel='Sample aria label'
                Icon={() => <div data-testid='SampleIcon' />}
                isSideNavOpen={true}
            />,
        );
        expect(link).toHaveAttribute('title', '');
    });

});
