import {Type} from "./Type";
import {Model} from "../Model";

/**
 * Type definition of the constructor of a specific type.
 */
export type ConstructorOf<T> = { new(): T; }

/**
 * Type of a Sharkitek model value.
 */
export class ModelType<M extends Model> extends Type<any, M>
{
	/**
	 * Constructs a new model type of a Sharkitek model property.
	 * @param modelConstructor - Constructor of the model.
	 */
	constructor(protected modelConstructor: ConstructorOf<M>)
	{
		super();
	}

	serialize(value: M): any
	{
		// Serializing the given model.
		return value.serialize();
	}

	deserialize(value: any): M
	{
		// Deserializing the given object in the new model.
		return (new this.modelConstructor()).deserialize(value);
	}

	serializeDiff(value: M): any
	{
		// Serializing the given model.
		return value.serializeDiff();
	}

	resetDiff(value: M): void
	{
		// Reset diff of the given model.
		value.resetDiff();
	}
}

/**
 * Type of a Sharkitek model value.
 * @param modelConstructor - Constructor of the model.
 */
export function SModel<M extends Model>(modelConstructor: ConstructorOf<M>)
{
	return new ModelType(modelConstructor);
}
