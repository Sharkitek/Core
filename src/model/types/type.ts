/**
 * Abstract class of a Sharkitek model property type.
 */
export abstract class Type<SerializedType, ModelType> {
	/**
	 * Serialize the given value of a Sharkitek model property.
	 * @param value Value to serialize.
	 */
	abstract serialize(
		value: ModelType | null | undefined,
	): SerializedType | null | undefined;

	/**
	 * Deserialize the given value of a serialized Sharkitek model.
	 * @param value Value to deserialize.
	 */
	abstract deserialize(
		value: SerializedType | null | undefined,
	): ModelType | null | undefined;

	/**
	 * Serialize the given value only if it has changed.
	 * @param value Value to deserialize.
	 */
	serializeDiff(
		value: ModelType | null | undefined,
	): Partial<SerializedType> | null | undefined {
		return this.serialize(value); // By default, nothing changes.
	}

	/**
	 * Reset the difference between the original value and the current one.
	 * @param value Value for which reset diff data.
	 */
	resetDiff(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		value: ModelType | null | undefined,
	): void {
		// By default, nothing to do.
	}

	/**
	 * Determine if the value has changed.
	 * @param originalValue Original value.
	 * @param currentValue Current value.
	 */
	hasChanged(
		originalValue: ModelType | null | undefined,
		currentValue: ModelType | null | undefined,
	): boolean {
		return originalValue !== currentValue;
	}

	/**
	 * Determine if the serialized value has changed.
	 * @param originalValue Original serialized value.
	 * @param currentValue Current serialized value.
	 */
	serializedHasChanged(
		originalValue: SerializedType | null | undefined,
		currentValue: SerializedType | null | undefined,
	): boolean {
		return originalValue !== currentValue;
	}

	/**
	 * Clone the provided value.
	 * @param value The to clone.
	 */
	clone<T extends ModelType>(value: T | null | undefined): T {
		return structuredClone(value);
	}

	/**
	 * Apply the patch value.
	 * @param currentValue The current property value. Its value can be mutated directly.
	 * @param patchValue The serialized patch value.
	 * @param updateOriginals Indicates if the original properties values must be updated or not.
	 */
	applyPatch<T extends ModelType>(
		currentValue: T | null | undefined,
		patchValue: SerializedType | null | undefined,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		updateOriginals: boolean,
	): T | null | undefined {
		return this.deserialize(patchValue) as T;
	}
}
