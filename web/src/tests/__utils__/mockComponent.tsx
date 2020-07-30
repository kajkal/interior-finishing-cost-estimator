import React from 'react';


/**
 * Mocks component, by default to <div data-testid='mock-ComponentName' />.
 *
 * @param modulePath - absolute path to component in code directory (eg: '/code/components/SampleComponent')
 * @param componentName - exported component name
 * @return component spy, could be used to change mock implementation
 */
export function mockComponent(modulePath: string, componentName = mapPathToComponentName(modulePath)) {
    const relativeModulePath = '../..' + modulePath;
    const componentSpy: jest.SpyInstance<React.ReactElement> = jest.spyOn(require(relativeModulePath), componentName);
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
