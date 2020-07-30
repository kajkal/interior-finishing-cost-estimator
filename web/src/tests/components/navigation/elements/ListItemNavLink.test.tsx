import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

import { ListItemNavLink } from '../../../../code/components/navigation/basic/ListItemNavLink';


describe('ListItemNavLink component', () => {

    const ListItemNavLinkWrapper: React.ComponentType = ({ children }) => (
        <MemoryRouter initialEntries={[ '/current' ]}>
            {children}
        </MemoryRouter>
    );

    it('should render anchor element', () => {
        render(<ListItemNavLink to='/example'>Link</ListItemNavLink>, { wrapper: ListItemNavLinkWrapper });

        const link = screen.getByRole('button');
        expect(link).toBeInstanceOf(HTMLAnchorElement);
        expect(link).toHaveAttribute('href', '/example');
        expect(link.className).not.toContain('activeRouterLink');
    });

    it('should render anchor element with active class', () => {
        render(<ListItemNavLink to='/current'>Link</ListItemNavLink>, { wrapper: ListItemNavLinkWrapper });

        const link = screen.getByRole('button');
        expect(link.className).toContain('activeRouterLink');
    });

});
