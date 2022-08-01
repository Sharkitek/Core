import {Type} from "./Types/Type";
import "reflect-metadata";
import {ConstructorOf} from "./Types/ModelType";

/**
 * Key of Sharkitek property metadata.
 */
const sharkitekMetadataKey = Symbol("sharkitek");

/**
 * Key of Sharkitek model identifier.
 */
const modelIdentifierMetadataKey = Symbol("modelIdentifier");

/**
 * Sharkitek property metadata interface.
 */
interface SharkitekMetadataInterface
{
	/**
	 * Property type instance.
	 */
	type: Type<any, any>;
}

/**
 * Class decorator for Sharkitek models.
 */
export function Sharkitek(constructor: Function)
{
	/*return class extends (constructor as FunctionConstructor) {
		constructor()
		{
			super();
		}
	};*/
}

/**
 * Property decorator to define a Sharkitek model identifier.
 */
export function Identifier(obj: Model, propertyName: string): void
{
	// Register the current property as identifier of the current model object.
	Reflect.defineMetadata(modelIdentifierMetadataKey, propertyName, obj);
}

/**
 * Property decorator for Sharkitek models properties.
 * @param type - Type of the property.
 */
export function Property<SerializedType, SharkitekType>(type: Type<SerializedType, SharkitekType>): PropertyDecorator
{
	// Return the decorator function.
	return (obj: ConstructorOf<Model>, propertyName) => {
		// Initializing property metadata.
		const metadata: SharkitekMetadataInterface = {
			type: type,
		};
		// Set property metadata.
		Reflect.defineMetadata(sharkitekMetadataKey, metadata, obj, propertyName);
	};
}

/**
 * A Sharkitek model.
 */
export abstract class Model
{
	/**
	 * Get the Sharkitek model identifier.
	 * @private
	 */
	private getModelIdentifier(): string
	{
		return Reflect.getMetadata(modelIdentifierMetadataKey, this);
	}
	/**
	 * Get the Sharkitek metadata of the property.
	 * @param propertyName - The name of the property for which to get metadata.
	 * @private
	 */
	private getPropertyMetadata(propertyName: string): SharkitekMetadataInterface
	{
		return Reflect.getMetadata(sharkitekMetadataKey, this, propertyName);
	}
	/**
	 * Calling a function for a defined property.
	 * @param propertyName - The property for which to check definition.
	 * @param callback - The function called when the property is defined.
	 * @param notProperty - The function called when the property is not defined.
	 * @protected
	 */
	protected propertyWithMetadata(propertyName: string, callback: (propertyMetadata: SharkitekMetadataInterface) => void, notProperty: () => void = () => {}): unknown
	{
		// Getting the current property metadata.
		const propertyMetadata = this.getPropertyMetadata(propertyName);
		if (propertyMetadata)
			// Metadata are defined, calling the right callback.
			return callback(propertyMetadata);
		else
			// Metadata are not defined, calling the right callback.
			return notProperty();
	}
	/**
	 * Calling a function for each defined property.
	 * @param callback - The function to call.
	 * @protected
	 */
	protected forEachModelProperty(callback: (propertyName: string, propertyMetadata: SharkitekMetadataInterface) => unknown): any|void
	{
		for (const propertyName of Object.keys(this))
		{ // For each property, checking that its type is defined and calling the callback with its type.
			const result = this.propertyWithMetadata(propertyName, (propertyMetadata) => {
				// If the property is defined, calling the function with the property name and metadata.
				const result = callback(propertyName, propertyMetadata);

				// If there is a return value, returning it directly (loop is broken).
				if (typeof result !== "undefined") return result;

				// Update metadata if they have changed.
				Reflect.defineMetadata(sharkitekMetadataKey, propertyMetadata, this, propertyName);
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
		return this.forEachModelProperty((propertyName, propertyMetadata) => (
			// For each property, checking if it is different.
			propertyMetadata.type.propertyHasChanged(this._originalProperties[propertyName], (this as any)[propertyName])
				// There is a difference, we should return false.
				? true
				// There is not difference, returning nothing.
				: undefined
		)) === true;
	}

	/**
	 * Get model identifier.
	 */
	getIdentifier(): unknown
	{
		return (this as any)[this.getModelIdentifier()];
	}

	/**
	 * Set current properties values as original values.
	 */
	resetDiff()
	{
		this.forEachModelProperty((propertyName, propertyMetadata) => {
			// For each property, set its original value to its current property value.
			this._originalProperties[propertyName] = (this as any)[propertyName];
			propertyMetadata.type.resetDiff((this as any)[propertyName]);
		});
	}
	/**
	 * Serialize the difference between current model state and original one.
	 */
	serializeDiff(): any
	{
		// Creating a serialized object.
		const serializedDiff: any = {};

		this.forEachModelProperty((propertyName, propertyMetadata) => {
			// For each defined model property, adding it to the serialized object if it has changed.
			if (this.getModelIdentifier() == propertyName
				|| propertyMetadata.type.propertyHasChanged(this._originalProperties[propertyName], (this as any)[propertyName]))
				// Adding the current property to the serialized object if it is the identifier or its value has changed.
				serializedDiff[propertyName] = propertyMetadata.type.serializeDiff((this as any)[propertyName]);
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
	serialize(): void
	{
		// Creating a serialized object.
		const serializedObject: any = {};

		this.forEachModelProperty((propertyName, propertyMetadata) => {
			// For each defined model property, adding it to the serialized object.
			serializedObject[propertyName] = propertyMetadata.type.serialize((this as any)[propertyName]);
		});

		return serializedObject; // Returning the serialized object.
	}

	/**
	 * Special operations on parse.
	 * @protected
	 */
	protected parse(): void
	{} // Nothing by default. TODO: create a event system to create functions like "beforeDeserialization" or "afterDeserialization".

	/**
	 * Deserialize the model.
	 */
	deserialize(serializedObject: any): this
	{
		this.forEachModelProperty((propertyName, propertyMetadata) => {
			// For each defined model property, assigning its deserialized value to the model.
			(this as any)[propertyName] = propertyMetadata.type.deserialize(serializedObject[propertyName]);
		});

		// Reset original property values.
		this.resetDiff();

		this._originalObject = serializedObject; // The model is not a new one, but loaded from a deserialized one.

		return this; // Returning this, after deserialization.
	}
}
