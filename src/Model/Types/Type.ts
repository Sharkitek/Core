/**
 * Abstract class of a Sharkitek model property type.
 */
export abstract class Type<SerializedType, SharkitekType>
{
	/**
	 * Serialize the given value of a Sharkitek model property.
	 * @param value - Value to serialize.
	 */
	abstract serialize(value: SharkitekType): SerializedType;

	/**
	 * Deserialize the given value of a serialized Sharkitek model.
	 * @param value - Value to deserialize.
	 */
	abstract deserialize(value: SerializedType): SharkitekType;

	/**
	 * Serialize the given value only if it has changed.
	 * @param value - Value to deserialize.
	 */
	serializeDiff(value: SharkitekType): SerializedType|null
	{
		return this.serialize(value); // By default, nothing changes.
	}

	/**
	 * Reset the difference between the original value and the current one.
	 * @param value - Value for which reset diff data.
	 */
	resetDiff(value: SharkitekType): void
	{
		// By default, nothing to do.
	}

	/**
	 * Determine if the property value has changed.
	 * @param originalValue - Original property value.
	 * @param currentValue - Current property value.
	 */
	propertyHasChanged(originalValue: SharkitekType, currentValue: SharkitekType): boolean
	{
		return originalValue != currentValue;
	}

	/**
	 * Determine if the serialized property value has changed.
	 * @param originalValue - Original serialized property value.
	 * @param currentValue - Current serialized property value.
	 */
	serializedPropertyHasChanged(originalValue: SerializedType, currentValue: SerializedType): boolean
	{
		return originalValue != currentValue;
	}
}
