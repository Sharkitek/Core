import {Type} from "./Type";
import {Definition} from "../Definition";

/**
 * Type of a simple object.
 */
export class ObjectType<Keys extends symbol|string> extends Type<Record<Keys, any>, Record<Keys, any>>
{
	/**
	 * Constructs a new object type of a Sharkitek model property.
	 * @param fieldsTypes Object fields types.
	 */
	constructor(protected fieldsTypes: Record<Keys, Definition<unknown, unknown>>)
	{
		super();
	}

	deserialize(value: Record<Keys, any>): Record<Keys, any>
	{
		if (value === undefined) return undefined;
		if (value === null) return null;

		return Object.fromEntries(
			// For each defined field, deserialize its value according to its type.
			(Object.entries(this.fieldsTypes) as [Keys, Definition<any, any>][]).map(([fieldName, fieldDefinition]) => (
				// Return an entry with the current field name and the deserialized value.
				[fieldName, fieldDefinition.type.deserialize(value[fieldName])]
			))
		) as Record<Keys, any>;
	}

	serialize(value: Record<Keys, any>): Record<Keys, any>
	{
		if (value === undefined) return undefined;
		if (value === null) return null;

		return Object.fromEntries(
			// For each defined field, serialize its value according to its type.
			(Object.entries(this.fieldsTypes) as [Keys, Definition<any, any>][]).map(([fieldName, fieldDefinition]) => (
				// Return an entry with the current field name and the serialized value.
				[fieldName, fieldDefinition.type.serialize(value[fieldName])]
			))
		) as Record<Keys, any>;
	}

	serializeDiff(value: Record<Keys, any>): Record<Keys, any>
	{
		if (value === undefined) return undefined;
		if (value === null) return null;

		return Object.fromEntries(
			// For each defined field, serialize its diff value according to its type.
			(Object.entries(this.fieldsTypes) as [Keys, Definition<any, any>][]).map(([fieldName, fieldDefinition]) => (
				// Return an entry with the current field name and the serialized diff value.
				[fieldName, fieldDefinition.type.serializeDiff(value[fieldName])]
			))
		) as Record<Keys, any>;
	}

	resetDiff(value: Record<Keys, any>): void
	{
		// For each field, reset its diff.
		(Object.entries(this.fieldsTypes) as [Keys, Definition<any, any>][]).forEach(([fieldName, fieldDefinition]) => {
			// Reset diff of the current field.
			fieldDefinition.type.resetDiff(value[fieldName]);
		});
	}
}

/**
 * Type of a simple object.
 * @param fieldsTypes Object fields types.
 */
export function SObject<Keys extends symbol|string>(fieldsTypes: Record<Keys, Definition<unknown, unknown>>): ObjectType<Keys>
{
	return new ObjectType<Keys>(fieldsTypes);
}
