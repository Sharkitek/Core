import {Type} from "./types/type";

/**
 * Property definition class.
 */
export class Definition<SerializedType, ModelType> {
	readonly _sharkitek: ModelType;
	readonly _serialized: SerializedType;

	/**
	 * Create a property definer instance.
	 * @param type Property type.
	 */
	constructor(public readonly type: Type<SerializedType, ModelType>) {}
}

/**
 * Unknown property definition.
 */
export type UnknownDefinition = Definition<unknown, unknown>;

/**
 * Any property definition.
 */
export type AnyDefinition = Definition<any, any>;

/**
 * New definition of a property of the given type.
 * @param type Type of the property to define.
 */
export function define<SerializedType, ModelType>(
	type: Type<SerializedType, ModelType>,
): Definition<SerializedType, ModelType> {
	return new Definition(type);
}
