import React from 'react';
import { InitialEntry } from 'history';
import { MemoryRouter, useLocation } from 'react-router';


export interface MockRouterProps {
    children?: React.ReactNode;
    initialEntries?: InitialEntry[];
}

export function MockRouter({ children, initialEntries }: MockRouterProps): React.ReactElement {
    return (
        <MemoryRouter initialEntries={initialEntries}>
            {children}
            <LocationDisplay />
        </MemoryRouter>
    );
}

function LocationDisplay() {
    const { pathname } = useLocation();
    return <div data-testid='location'>{pathname}</div>;
}
