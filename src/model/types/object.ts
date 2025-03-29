import {Type} from "./type";
import {define, Definition} from "../property-definition";
import {ModelProperties, ModelPropertiesValues, ModelProperty, ModelShape, SerializedModel} from "../model";

/**
 * Type of a custom object.
 */
export class ObjectType<Shape extends ModelShape<T>, T extends object> extends Type<SerializedModel<T, Shape>, ModelPropertiesValues<T, Shape>>
{
	/**
	 * Defined properties.
	 */
	properties: ModelProperties<T, Shape>;

	/**
	 * Initialize a new object type of a Sharkitek model property.
	 * @param shape
	 */
	constructor(readonly shape: Shape)
	{
		super();
		this.initProperties();
	}

	/**
	 * Initialize properties iterator from the object shape.
	 * @protected
	 */
	protected initProperties(): void
	{
		// Build an array of model properties from the object shape.
		this.properties = [];
		for (const propertyName in this.shape)
		{ // For each property, build a model property object.
			this.properties.push({
				name: propertyName,
				definition: this.shape[propertyName],
				identifier: false,
			} as ModelProperty<T, Shape>);
		}
	}

	deserialize(value: SerializedModel<T, Shape>|null|undefined): ModelPropertiesValues<T, Shape>|null|undefined
	{
		if (value === undefined) return undefined;
		if (value === null) return null;

		// Initialize an empty object.
		const obj: Partial<ModelPropertiesValues<T, Shape>> = {};

		for (const property of this.properties)
		{ // For each defined property, deserialize its value according to its type.
			(obj[property.name as keyof T] as any) = property.definition.type.deserialize(value?.[property.name]);
		}

		return obj as ModelPropertiesValues<T, Shape>; // Returning serialized object.
	}

	serialize(value: ModelPropertiesValues<T, Shape>|null|undefined): SerializedModel<T, Shape>|null|undefined
	{
		if (value === undefined) return undefined;
		if (value === null) return null;

		// Creating an empty serialized object.
		const serializedObject: Partial<SerializedModel<T, Shape>> = {};

		for (const property of this.properties)
		{ // For each property, adding it to the serialized object.
			serializedObject[property.name] = property.definition.type.serialize(
				// keyof Shape is a subset of keyof T.
				value?.[property.name as keyof T],
			);
		}

		return serializedObject as SerializedModel<T, Shape>; // Returning the serialized object.
	}

	serializeDiff(value: ModelPropertiesValues<T, Shape>|null|undefined): Partial<SerializedModel<T, Shape>>|null|undefined
	{
		if (value === undefined) return undefined;
		if (value === null) return null;

		// Creating an empty serialized object.
		const serializedObject: Partial<SerializedModel<T, Shape>> = {};

		for (const property of this.properties)
		{ // For each property, adding it to the serialized object.
			serializedObject[property.name] = property.definition.type.serializeDiff(
				// keyof Shape is a subset of keyof T.
				value?.[property.name as keyof T],
			);
		}

		return serializedObject as SerializedModel<T, Shape>; // Returning the serialized object.
	}

	resetDiff(value: ModelPropertiesValues<T, Shape>|null|undefined)
	{
		// For each property, reset its diff.
		for (const property of this.properties)
			// keyof Shape is a subset of keyof T.
			property.definition.type.resetDiff(value?.[property.name as keyof T]);
	}

	hasChanged(originalValue: ModelPropertiesValues<T, Shape>|null|undefined, currentValue: ModelPropertiesValues<T, Shape>|null|undefined): boolean
	{
		if (originalValue === undefined) return currentValue !== undefined;
		if (originalValue === null) return currentValue !== null;
		if (currentValue === undefined) return true; // Original value is not undefined.
		if (currentValue === null) return true; // Original value is not null.

		// If any property has changed, the value has changed.
		for (const property of this.properties)
			if (property.definition.type.hasChanged(originalValue?.[property.name as keyof T], currentValue?.[property.name as keyof T]))
				return true;

		return false; // No change detected.
	}

	serializedHasChanged(originalValue: SerializedModel<T, Shape>|null|undefined, currentValue: SerializedModel<T, Shape>|null|undefined): boolean
	{
		if (originalValue === undefined) return currentValue !== undefined;
		if (originalValue === null) return currentValue !== null;
		if (currentValue === undefined) return true; // Original value is not undefined.
		if (currentValue === null) return true; // Original value is not null.

		// If any property has changed, the value has changed.
		for (const property of this.properties)
			if (property.definition.type.serializedHasChanged(originalValue?.[property.name], currentValue?.[property.name]))
				return true;

		return false; // No change detected.
	}

	clone<Type extends ModelPropertiesValues<T, Shape>>(value: Type|null|undefined): Type
	{
		// Handle NULL / undefined object.
		if (!value) return super.clone(value);

		// Initialize an empty object.
		const cloned: Partial<ModelPropertiesValues<T, Shape>> = {};

		for (const property of this.properties)
		{ // For each defined property, clone it.
			cloned[property.name as keyof T] = property.definition.type.clone(value?.[property.name]);
		}

		return cloned as Type; // Returning cloned object.
	}
}

/**
 * New object property definition.
 * @param shape Shape of the object.
 */
export function object<Shape extends ModelShape<T>, T extends object>(shape: Shape): Definition<SerializedModel<T, Shape>, ModelPropertiesValues<T, Shape>>
{
	return define(new ObjectType(shape));
}
