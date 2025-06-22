/**
 * Type definition of a class constructor.
 */
export type ConstructorOf<T extends object> = { new(): T; };

/**
 * Type definition of an original object overridden by another.
 */
export type Modify<Original, Override> = Omit<Original, keyof Override> & Override;
