import {Type} from "./Type";
import {define, Definition} from "../PropertyDefinition";
import {ConstructorOf, Model, ModelShape, SerializedModel} from "../Model";

/**
 * Type of a Sharkitek model value.
 */
export class ModelType<Shape extends ModelShape> extends Type<SerializedModel<Shape>, Model<Shape>>
{
	/**
	 * Initialize a new model type of a Sharkitek model property.
	 * @param modelConstructor Model constructor.
	 */
	constructor(protected modelConstructor: ConstructorOf<Model<Shape>>)
	{
		super();
	}

	serialize(value: Model<Shape>|null|undefined): SerializedModel<Shape>|null|undefined
	{
		if (value === undefined) return undefined;
		if (value === null) return null;

		// Serializing the given model.
		return value?.serialize();
	}

	deserialize(value: SerializedModel<Shape>|null|undefined): Model<Shape>|null|undefined
	{
		if (value === undefined) return undefined;
		if (value === null) return null;

		// Deserializing the given object in the new model.
		return (new this.modelConstructor()).deserialize(value) as Model<Shape>;
	}

	serializeDiff(value: Model<Shape>|null|undefined): Partial<SerializedModel<Shape>>|null|undefined
	{
		if (value === undefined) return undefined;
		if (value === null) return null;

		// Serializing the given model.
		return value?.serializeDiff();
	}

	resetDiff(value: Model<Shape>|null|undefined): void
	{
		// Reset diff of the given model.
		value?.resetDiff();
	}
}

/**
 * New model property definition.
 * @param modelConstructor Model constructor.
 */
export function model<Shape extends ModelShape>(modelConstructor: ConstructorOf<Model<Shape>>): Definition<SerializedModel<Shape>, Model<Shape>>
{
	return define(new ModelType(modelConstructor));
}
