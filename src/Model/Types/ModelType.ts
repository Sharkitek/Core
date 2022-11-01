import {Type} from "./Type";
import {Model} from "../Model";

/**
 * Type definition of the constructor of a specific type.
 */
export type ConstructorOf<T> = { new(): T; }

/**
 * Type of a Sharkitek model value.
 */
export class ModelType<M extends Model<M>> extends Type<any, M>
{
	/**
	 * Constructs a new model type of a Sharkitek model property.
	 * @param modelConstructor - Constructor of the model.
	 */
	constructor(protected modelConstructor: ConstructorOf<M>)
	{
		super();
	}

	serialize(value: M|null): any
	{
		// Serializing the given model.
		return value ? value.serialize() : null;
	}

	deserialize(value: any): M|null
	{
		// Deserializing the given object in the new model.
		return value ? (new this.modelConstructor()).deserialize(value) : null;
	}

	serializeDiff(value: M): any
	{
		// Serializing the given model.
		return value ? value.serializeDiff() : null;
	}

	resetDiff(value: M): void
	{
		// Reset diff of the given model.
		value?.resetDiff();
	}
}

/**
 * Type of a Sharkitek model value.
 * @param modelConstructor - Constructor of the model.
 */
export function SModel<M extends Model<M>>(modelConstructor: ConstructorOf<M>)
{
	return new ModelType(modelConstructor);
}
