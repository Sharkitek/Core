/**
 * Type definition of a class constructor.
 */
export type ConstructorOf<T extends object> = { new(): T; };
