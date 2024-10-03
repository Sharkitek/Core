import {Type} from "./Types/Type";

/**
 * Property definition class.
 */
export class Definition<SerializedType, ModelType>
{
	readonly _sharkitek: ModelType;
	readonly _serialized: SerializedType;

	/**
	 * Create a property definer instance.
	 * @param type Property type.
	 */
	constructor(public readonly type: Type<SerializedType, ModelType>)
	{}
}

/**
 * New definition of a property of the given type.
 * @param type Type of the property to define.
 */
export function define<SerializedType, ModelType>(type: Type<SerializedType, ModelType>): Definition<SerializedType, ModelType>
{
	return new Definition(type);
}
