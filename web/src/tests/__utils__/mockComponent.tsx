import React from 'react';


/**
 * Mock component, by default to <div data-testid='mock-ComponentName' />.
 */
export function mockComponent(modulePath: string, componentName = mapPathToComponentName(modulePath)) {
    const componentSpy: jest.SpyInstance<React.ReactElement> = jest.spyOn(require(modulePath), componentName);
    componentSpy.mockName(`mock-${componentName}`);
    componentSpy.mockImplementation(({ children }) => (
        <div data-testid={`mock-${componentName}`}>
            {children}
        </div>
    ));
    return componentSpy;
}

function mapPathToComponentName(moduleName: string): string {
    return moduleName.split('/').splice(-1)[ 0 ];
}
