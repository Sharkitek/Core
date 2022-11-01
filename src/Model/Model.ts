import {Definition} from "./Definition";

/**
 * Model properties definition type.
 */
export type ModelDefinition<T> = Partial<Record<keyof T, Definition<unknown, unknown>>>;
/**
 * Model identifier type.
 */
export type ModelIdentifier<T> = keyof T;

/**
 * A Sharkitek model.
 */
export abstract class Model<THIS>
{
	/**
	 * Model properties definition function.
	 */
	protected abstract SDefinition(): ModelDefinition<THIS>;

	/**
	 * Return the name of the model identifier property.
	 */
	protected SIdentifier(): ModelIdentifier<THIS>
	{
		return undefined;
	}

	/**
	 * Get given property definition.
	 * @protected
	 */
	protected getPropertyDefinition(propertyName: string): Definition<unknown, unknown>
	{
		return (this.SDefinition() as any)?.[propertyName];
	}

	/**
	 * Get the list of the model properties.
	 * @protected
	 */
	protected getProperties(): string[]
	{
		return Object.keys(this.SDefinition());
	}

	/**
	 * Calling a function for a defined property.
	 * @param propertyName - The property for which to check definition.
	 * @param callback - The function called when the property is defined.
	 * @param notProperty - The function called when the property is not defined.
	 * @protected
	 */
	protected propertyWithDefinition(propertyName: string, callback: (propertyDefinition: Definition<unknown, unknown>) => void, notProperty: () => void = () => {}): unknown
	{
		// Getting the current property definition.
		const propertyDefinition = this.getPropertyDefinition(propertyName);
		if (propertyDefinition)
			// There is a definition for the current property, calling the right callback.
			return callback(propertyDefinition);
		else
			// No definition for the given property, calling the right callback.
			return notProperty();
	}
	/**
	 * Calling a function for each defined property.
	 * @param callback - The function to call.
	 * @protected
	 */
	protected forEachModelProperty(callback: (propertyName: string, propertyDefinition: Definition<unknown, unknown>) => unknown): any|void
	{
		for (const propertyName of this.getProperties())
		{ // For each property, checking that its type is defined and calling the callback with its type.
			const result = this.propertyWithDefinition(propertyName, (propertyDefinition) => {
				// If the property is defined, calling the function with the property name and definition.
				const result = callback(propertyName, propertyDefinition);

				// If there is a return value, returning it directly (loop is broken).
				if (typeof result !== "undefined") return result;
			});

			// If there is a return value, returning it directly (loop is broken).
			if (typeof result !== "undefined") return result;
		}
	}


	/**
	 * The original properties values.
	 * @protected
	 */
	protected _originalProperties: Record<string, any> = {};

	/**
	 * The original (serialized) object.
	 * @protected
	 */
	protected _originalObject: any = null;

	/**
	 * Determine if the model is new or not.
	 */
	isNew(): boolean
	{
		return !this._originalObject;
	}

	/**
	 * Determine if the model is dirty or not.
	 */
	isDirty(): boolean
	{
		return this.forEachModelProperty((propertyName, propertyDefinition) => (
			// For each property, checking if it is different.
			propertyDefinition.type.propertyHasChanged(this._originalProperties[propertyName], (this as any)[propertyName])
				// There is a difference, we should return false.
				? true
				// There is no difference, returning nothing.
				: undefined
		)) === true;
	}

	/**
	 * Get model identifier.
	 */
	getIdentifier(): unknown
	{
		return (this as any)[this.SIdentifier()];
	}

	/**
	 * Set current properties values as original values.
	 */
	resetDiff()
	{
		this.forEachModelProperty((propertyName, propertyDefinition) => {
			// For each property, set its original value to its current property value.
			this._originalProperties[propertyName] = (this as any)[propertyName];
			propertyDefinition.type.resetDiff((this as any)[propertyName]);
		});
	}
	/**
	 * Serialize the difference between current model state and original one.
	 */
	serializeDiff(): any
	{
		// Creating a serialized object.
		const serializedDiff: any = {};

		this.forEachModelProperty((propertyName, propertyDefinition) => {
			// For each defined model property, adding it to the serialized object if it has changed.
			if (this.SIdentifier() == propertyName
				|| propertyDefinition.type.propertyHasChanged(this._originalProperties[propertyName], (this as any)[propertyName]))
				// Adding the current property to the serialized object if it is the identifier or its value has changed.
				serializedDiff[propertyName] = propertyDefinition.type.serializeDiff((this as any)[propertyName]);
		})

		return serializedDiff; // Returning the serialized object.
	}
	/**
	 * Get difference between original values and current ones, then reset it.
	 * Similar to call `serializeDiff()` then `resetDiff()`.
	 */
	save(): any
	{
		// Get the difference.
		const diff = this.serializeDiff();

		// Once the difference has been gotten, reset it.
		this.resetDiff();

		return diff; // Return the difference.
	}


	/**
	 * Serialize the model.
	 */
	serialize(): any
	{
		// Creating a serialized object.
		const serializedObject: any = {};

		this.forEachModelProperty((propertyName, propertyDefinition) => {
			// For each defined model property, adding it to the serialized object.
			serializedObject[propertyName] = propertyDefinition.type.serialize((this as any)[propertyName]);
		});

		return serializedObject; // Returning the serialized object.
	}

	/**
	 * Special operations on parse.
	 * @protected
	 */
	protected parse(): void
	{} // Nothing by default. TODO: create an event system to create functions like "beforeDeserialization" or "afterDeserialization".

	/**
	 * Deserialize the model.
	 */
	deserialize(serializedObject: any): THIS
	{
		this.forEachModelProperty((propertyName, propertyDefinition) => {
			// For each defined model property, assigning its deserialized value to the model.
			(this as any)[propertyName] = propertyDefinition.type.deserialize(serializedObject[propertyName]);
		});

		// Reset original property values.
		this.resetDiff();

		this._originalObject = serializedObject; // The model is not a new one, but loaded from a deserialized one.

		return this as unknown as THIS; // Returning this, after deserialization.
	}
}
