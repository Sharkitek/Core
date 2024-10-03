import {Type} from "./Type";
import {define, Definition} from "../PropertyDefinition";
import {ModelShape, PropertiesModel, SerializedModel, UnknownDefinition} from "../Model";

/**
 * Type of a custom object.
 */
export class ObjectType<Shape extends ModelShape> extends Type<SerializedModel<Shape>, PropertiesModel<Shape>>
{
	/**
	 * Initialize a new object type of a Sharkitek model property.
	 * @param shape
	 */
	constructor(protected readonly shape: Shape)
	{
		super();
	}

	deserialize(value: SerializedModel<Shape>|null|undefined): PropertiesModel<Shape>|null|undefined
	{
		if (value === undefined) return undefined;
		if (value === null) return null;

		return Object.fromEntries(
			// For each defined field, deserialize its value according to its type.
			(Object.entries(this.shape) as [keyof Shape, UnknownDefinition][]).map(([fieldName, fieldDefinition]) => (
				// Return an entry with the current field name and the deserialized value.
				[fieldName, fieldDefinition.type.deserialize(value?.[fieldName])]
			))
		) as PropertiesModel<Shape>;
	}

	serialize(value: PropertiesModel<Shape>|null|undefined): SerializedModel<Shape>|null|undefined
	{
		if (value === undefined) return undefined;
		if (value === null) return null;

		return Object.fromEntries(
			// For each defined field, serialize its value according to its type.
			(Object.entries(this.shape) as [keyof Shape, UnknownDefinition][]).map(([fieldName, fieldDefinition]) => (
				// Return an entry with the current field name and the serialized value.
				[fieldName, fieldDefinition.type.serialize(value?.[fieldName])]
			))
		) as PropertiesModel<Shape>;
	}

	serializeDiff(value: PropertiesModel<Shape>|null|undefined): Partial<SerializedModel<Shape>>|null|undefined
	{
		if (value === undefined) return undefined;
		if (value === null) return null;

		return Object.fromEntries(
			// For each defined field, serialize its diff value according to its type.
			(Object.entries(this.shape) as [keyof Shape, UnknownDefinition][]).map(([fieldName, fieldDefinition]) => (
				// Return an entry with the current field name and the serialized diff value.
				[fieldName, fieldDefinition.type.serializeDiff(value?.[fieldName])]
			))
		) as PropertiesModel<Shape>;
	}

	resetDiff(value: PropertiesModel<Shape>|null|undefined)
	{
		// For each field, reset its diff.
		(Object.entries(this.shape) as [keyof Shape, UnknownDefinition][]).forEach(([fieldName, fieldDefinition]) => {
			// Reset diff of the current field.
			fieldDefinition.type.resetDiff(value?.[fieldName]);
		});
	}
}

/**
 * New object property definition.
 * @param shape Shape of the object.
 */
export function object<Shape extends ModelShape>(shape: Shape): Definition<SerializedModel<Shape>, PropertiesModel<Shape>>
{
	return define(new ObjectType(shape));
}
