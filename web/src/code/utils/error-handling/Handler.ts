export type Handler<T extends Error> = (error: T) => void;
