import {Type} from "./type";
import {define, Definition} from "../property-definition";
import {InvalidTypeValueError} from "../../errors";
import {type} from "node:os";
import {string} from "./string";

/**
 * Type of a key-value map.
 */
export class MapType<KeyType, ValueType, SerializedValueType, SerializedMapType extends Record<string, SerializedValueType> = Record<string, SerializedValueType>> extends Type<SerializedMapType, Map<KeyType, ValueType>>
{
	/**
	 * Initialize a new map type of a Sharkitek model property.
	 * @param keyDefinition Definition of the map keys.
	 * @param valueDefinition Definition of the map values.
	 */
	constructor(
		protected keyDefinition: Definition<string, KeyType>,
		protected valueDefinition: Definition<SerializedValueType, ValueType>,
	)
	{
		super();
	}

	serialize(value: Map<KeyType, ValueType>|null|undefined): SerializedMapType|null|undefined
	{
		if (value === undefined) return undefined;
		if (value === null) return null;

		if (!(value instanceof Map)) throw new InvalidTypeValueError(this, value, "value must be an instance of map");

		return Object.fromEntries(
			// Serializing each key-value pair of the map.
			value.entries().map(([key, value]) =>
				([this.keyDefinition.type.serialize(key), this.valueDefinition.type.serialize(value)]))
		) as SerializedMapType;
	}

	deserialize(value: SerializedMapType|null|undefined): Map<KeyType, ValueType>|null|undefined
	{
		if (value === undefined) return undefined;
		if (value === null) return null;

		if (typeof value !== "object" || Array.isArray(value)) throw new InvalidTypeValueError(this, value, "value must be an object");

		const map = new Map<KeyType, ValueType>;
		for (const [serializedKey, serializedValue] of Object.entries(value))
		{ // Deserializing each key-value pair of the map.
			map.set(this.keyDefinition.type.deserialize(serializedKey), this.valueDefinition.type.deserialize(serializedValue));
		}

		return map;
	}

	serializeDiff(value: Map<KeyType, ValueType>|null|undefined): SerializedMapType|null|undefined
	{
		if (value === undefined) return undefined;
		if (value === null) return null;

		if (!(value instanceof Map)) throw new InvalidTypeValueError(this, value, "value must be an instance of map");

		return Object.fromEntries(
			// Serializing the diff of each key-value pair of the map.
			value.entries().map(([key, value]) =>
				([this.keyDefinition.type.serializeDiff(key), this.valueDefinition.type.serializeDiff(value)]))
		) as SerializedMapType;
	}

	resetDiff(value: Map<KeyType, ValueType>|null|undefined): void
	{
		// Do nothing if it is not a map.
		if (!(value instanceof Map)) return;

		// Reset diff of all key-value pairs.
		value.forEach((value, key) => {
			this.keyDefinition.type.resetDiff(key);
			this.valueDefinition.type.resetDiff(value);
		});
	}

	hasChanged(originalValue: Map<KeyType, ValueType>|null|undefined, currentValue: Map<KeyType, ValueType>|null|undefined): boolean
	{
		// If any map size is different, maps are different.
		if (originalValue?.size != currentValue?.size) return true;
		// If size is undefined, values are probably not maps.
		if (originalValue?.size == undefined) return super.hasChanged(originalValue, currentValue);

		for (const [key, value] of originalValue.entries())
		{ // Check for any change for each key-value in the map.
			if (this.valueDefinition.type.hasChanged(value, currentValue.get(key)))
				// The value has changed, the map is different.
				return true;
		}

		return false; // No change detected.
	}

	serializedHasChanged(originalValue: SerializedMapType | null | undefined, currentValue: SerializedMapType | null | undefined): boolean
	{
		// If any value is not a defined object, use the default comparison function.
		if (!originalValue || !currentValue || typeof originalValue !== "object" || typeof currentValue !== "object") return super.serializedHasChanged(originalValue, currentValue);

		// If any object size is different, objects are different.
		if (Object.keys(originalValue)?.length != Object.keys(currentValue)?.length) return true;

		for (const [key, value] of Object.entries(originalValue))
		{ // Check for any change for each key-value pair in the object.
			if (this.valueDefinition.type.serializedHasChanged(value, currentValue[key]))
				// The value has changed, the object is different.
				return true;
		}

		return false; // No change detected.
	}

	clone<T extends Map<KeyType, ValueType>>(map: T|null|undefined): T
	{
		// Handle NULL / undefined map.
		if (!map) return super.clone(map);

		if (!(map instanceof Map)) throw new InvalidTypeValueError(this, map, "value must be an instance of map");

		// Initialize an empty map.
		const cloned = new Map<KeyType, ValueType>() as T;

		for (const [key, value] of map.entries())
		{ // Clone each value of the map.
			cloned.set(this.keyDefinition.type.clone(key), this.valueDefinition.type.clone(value));
		}

		return cloned; // Returning cloned map.
	}

	applyPatch<T extends Map<KeyType, ValueType>>(currentValue: T|null|undefined, patchValue: SerializedMapType|null|undefined, updateOriginals: boolean): T|null|undefined
	{
		if (patchValue === undefined) return undefined;
		if (patchValue === null) return null;

		if (typeof patchValue !== "object")
			throw new InvalidTypeValueError(this, patchValue, "value must be an object");

		currentValue = currentValue instanceof Map ? currentValue : new Map<KeyType, ValueType>() as T;

		for (const [key, value] of Object.entries(patchValue))
		{ // Apply the patch to all values of the map.
			const patchedKey = this.keyDefinition.type.deserialize(key);
			const patchedElement = this.valueDefinition.type.applyPatch(currentValue.get(patchedKey), value, updateOriginals);
			currentValue.set(patchedKey, patchedElement);
		}

		return currentValue;
	}
}

/**
 * New map property definition.
 * @param keyDefinition Definition of the map keys.
 * @param valueDefinition Definition of the map values.
 */
export function map<KeyType, ValueType, SerializedValueType, SerializedMapType extends Record<string, SerializedValueType> = Record<string, SerializedValueType>>(
	keyDefinition: Definition<string, KeyType>,
	valueDefinition: Definition<SerializedValueType, ValueType>,
): Definition<SerializedMapType, Map<KeyType, ValueType>>
{
	return define(new MapType<KeyType, ValueType, SerializedValueType, SerializedMapType>(keyDefinition, valueDefinition));
}

/**
 * New map property definition, with string as index.
 * @param valueDefinition Definition of the map values.
 */
export function stringMap<ValueType, SerializedValueType, SerializedMapType extends Record<string, SerializedValueType> = Record<string, SerializedValueType>>(
	valueDefinition: Definition<SerializedValueType, ValueType>,
): Definition<SerializedMapType, Map<string, ValueType>>
{
	return define(new MapType<string, ValueType, SerializedValueType, SerializedMapType>(string(), valueDefinition));
}
