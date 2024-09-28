import {Type} from "./Types/Type";

/**
 * Options of a definition.
 */
export interface DefinitionOptions<SerializedType, SharkitekType>
{ //TODO implement some options, like `mandatory`.
}

/**
 * A Sharkitek model property definition.
 */
export class Definition<SerializedType, SharkitekType>
{
	/**
	 * Initialize a property definition with the given type and options.
	 * @param type - The model property type.
	 * @param options - Property definition options.
	 */
	constructor(
		public type: Type<SerializedType, SharkitekType>,
		public options: DefinitionOptions<SerializedType, SharkitekType> = {},
	) {}
}

/**
 * Initialize a property definition with the given type and options.
 * @param type - The model property type.
 * @param options - Property definition options.
 */
export function SDefine<SerializedType, SharkitekType>(type: Type<SerializedType, SharkitekType>, options: DefinitionOptions<SerializedType, SharkitekType> = {}): Definition<SerializedType, SharkitekType>
{
	return new Definition<SerializedType, SharkitekType>(type, options);
}
