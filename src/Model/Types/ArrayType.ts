import {Type} from "./Type";
import {define, Definition} from "../PropertyDefinition";

/**
 * Type of an array of values.
 */
export class ArrayType<SerializedValueType, SharkitekValueType> extends Type<SerializedValueType[], SharkitekValueType[]>
{
	/**
	 * Initialize a new array type of a Sharkitek model property.
	 * @param valueDefinition Definition the array values.
	 */
	constructor(protected valueDefinition: Definition<SerializedValueType, SharkitekValueType>)
	{
		super();
	}

	serialize(value: SharkitekValueType[]|null|undefined): SerializedValueType[]|null|undefined
	{
		if (value === undefined) return undefined;
		if (value === null) return null;

		return value.map((value) => (
			// Serializing each value of the array.
			this.valueDefinition.type.serialize(value)
		));
	}

	deserialize(value: SerializedValueType[]|null|undefined): SharkitekValueType[]|null|undefined
	{
		if (value === undefined) return undefined;
		if (value === null) return null;

		return value.map((serializedValue) => (
			// Deserializing each value of the array.
			this.valueDefinition.type.deserialize(serializedValue)
		));
	}

	serializeDiff(value: SharkitekValueType[]|null|undefined): SerializedValueType[]|null|undefined
	{
		if (value === undefined) return undefined;
		if (value === null) return null;

		// Serializing diff of all elements.
		return value.map((value) => this.valueDefinition.type.serializeDiff(value) as SerializedValueType);
	}

	resetDiff(value: SharkitekValueType[]|null|undefined): void
	{
		// Do nothing if it is not an array.
		if (!Array.isArray(value)) return;

		// Reset diff of all elements.
		value.forEach((value) => this.valueDefinition.type.resetDiff(value));
	}

	propertyHasChanged(originalValue: SharkitekValueType[]|null|undefined, currentValue: SharkitekValueType[]|null|undefined): boolean
	{
		// If any array length is different, arrays are different.
		if (originalValue?.length != currentValue?.length) return true;
		// If length is undefined, values are probably not arrays.
		if (originalValue?.length == undefined) return false;

		for (const key of originalValue.keys())
		{ // Check for any change for each value in the array.
			if (this.valueDefinition.type.propertyHasChanged(originalValue[key], currentValue[key]))
				// The value has changed, the array is different.
				return true;
		}

		return false; // No change detected.
	}

	serializedPropertyHasChanged(originalValue: SerializedValueType[] | null | undefined, currentValue: SerializedValueType[] | null | undefined): boolean
	{
		// If any array length is different, arrays are different.
		if (originalValue?.length != currentValue?.length) return true;
		// If length is undefined, values are probably not arrays.
		if (originalValue?.length == undefined) return false;

		for (const key of originalValue.keys())
		{ // Check for any change for each value in the array.
			if (this.valueDefinition.type.serializedPropertyHasChanged(originalValue[key], currentValue[key]))
				// The value has changed, the array is different.
				return true;
		}

		return false; // No change detected.
	}
}

/**
 * New array property definition.
 * @param valueDefinition Array values type definition.
 */
export function array<SerializedValueType, SharkitekValueType>(valueDefinition: Definition<SerializedValueType, SharkitekValueType>): Definition<SerializedValueType[], SharkitekValueType[]>
{
	return define(new ArrayType(valueDefinition));
}
