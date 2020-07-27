afterEach(() => {
    delete window.matchMedia;
});

export function setWindowWidth(windowWidth: number) {
    window.matchMedia = (mediaQuery) => {
        return {
            matches: matches(mediaQuery, windowWidth),
            addListener: jest.fn(),
            removeListener: jest.fn(),
        } as unknown as MediaQueryList;
    };
}

function matches(mediaQuery: string, windowWidth: number) {
    const match = mediaQuery.match(/\((?:min-width:(?<minWidth>[0-9.]+)px)|(?:max-width:(?<maxWidth>[0-9.]+)px)\)/);
    if (match?.groups?.minWidth) {
        return parseFloat(match.groups.minWidth) < windowWidth;
    }
    if (match?.groups?.maxWidth) {
        return parseFloat(match.groups.maxWidth) > windowWidth;
    }
    fail(`Unhandled query: '${mediaQuery}'`);
}
