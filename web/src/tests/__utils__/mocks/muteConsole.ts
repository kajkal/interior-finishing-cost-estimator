/**
 * Based on 'shouldBeMuted' predicate some console.log/.error are muted.
 * Used to keep test console clean from expected logs.
 */
export function muteConsole(method: 'log' | 'error', shouldBeMuted: (message: string) => boolean) {
    const originalImplementation = console[ method ];
    const mock = jest.fn().mockImplementation((message?: any, ...optionalParams: any[]) => {
        if (typeof message === 'string' && shouldBeMuted(message)) {
            return;
        }
        originalImplementation(message, ...optionalParams);
    });

    console[ method ] = mock;
    return mock;
}
