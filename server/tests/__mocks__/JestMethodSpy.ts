export type JestMethodSpy<F extends (...args: any) => any> = jest.SpyInstance<ReturnType<F>, Parameters<F>>;
