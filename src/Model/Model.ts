import {Definition} from "./PropertyDefinition";

/**
 * Type definition of a model constructor.
 */
export type ConstructorOf<T extends object> = { new(): T; };

/**
 * Unknown property definition.
 */
export type UnknownDefinition = Definition<unknown, unknown>;

/**
 * A model shape.
 */
export type ModelShape = Record<string, UnknownDefinition>;

/**
 * Properties of a model based on its shape.
 */
export type PropertiesModel<Shape extends ModelShape> = {
	[k in keyof Shape]: Shape[k]["_sharkitek"];
};

/**
 * Serialized object type based on model shape.
 */
export type SerializedModel<Shape extends ModelShape> = {
	[k in keyof Shape]: Shape[k]["_serialized"];
};

/**
 * Type of a model object.
 */
export type Model<Shape extends ModelShape, IdentifierType = unknown> = ModelDefinition<Shape, IdentifierType> & PropertiesModel<Shape>;

/**
 * Type of the extends function of model classes.
 */
export type ExtendsFunctionType<ModelType extends Model<Shape, IdentifierType<Shape, Identifier>>, Shape extends ModelShape, Identifier extends keyof Shape = any> =
	<Extension extends object>(extension: ThisType<ModelType> & Extension) => ModelClass<ModelType & Extension, Shape, Identifier>;

/**
 * Type of a model class.
 */
export type ModelClass<ModelType extends Model<Shape, IdentifierType<Shape, Identifier>>, Shape extends ModelShape, Identifier extends keyof Shape = any> = (
	ConstructorOf<ModelType> & {
		extends: ExtendsFunctionType<ModelType, Shape, Identifier>;
	}
);

/**
 * Identifier type.
 */
export type IdentifierType<Shape extends ModelShape, K extends keyof Shape> = Shape[K]["_sharkitek"];

/**
 * Identifier name type.
 */
export type IdentifierNameType<Shape> = Shape extends ModelShape ? keyof Shape : unknown;

/**
 * Interface of a Sharkitek model definition.
 */
export interface ModelDefinition<Shape extends ModelShape, IdentifierType, ModelType extends Model<Shape, IdentifierType> = Model<Shape, IdentifierType>>
{
	/**
	 * Get model identifier.
	 */
	getIdentifier(): IdentifierType;

	/**
	 * Get model identifier name.
	 */
	getIdentifierName(): IdentifierNameType<Shape>;

	/**
	 * Serialize the model.
	 */
	serialize(): SerializedModel<Shape>;
	/**
	 * Deserialize the model.
	 * @param obj Serialized object.
	 */
	deserialize(obj: SerializedModel<Shape>): ModelType;

	/**
	 * Find out if the model is new (never deserialized) or not.
	 */
	isNew(): boolean;
	/**
	 * Find out if the model is dirty or not.
	 */
	isDirty(): boolean;

	/**
	 * Serialize the difference between current model state and the original one.
	 */
	serializeDiff(): Partial<SerializedModel<Shape>>;
	/**
	 * Set current properties values as original values.
	 */
	resetDiff(): void;
	/**
	 * Get difference between original values and current ones, then reset it.
	 * Similar to call `serializeDiff()` then `resetDiff()`.
	 */
	patch(): Partial<SerializedModel<Shape>>;
}

/**
 * Define a Sharkitek model.
 * @param shape Model shape definition.
 * @param identifier Identifier property name.
 */
export function model<ModelType extends Model<Shape, IdentifierType<Shape, Identifier>>, Shape extends ModelShape, Identifier extends IdentifierNameType<Shape> = any>(
	shape: Shape,
	identifier?: Identifier,
): ModelClass<ModelType, Shape, Identifier>
{
	// Get shape entries.
	const shapeEntries = Object.entries(shape) as [keyof Shape, UnknownDefinition][];

	return withExtends(
		// Initialize generic model class.
		class GenericModel implements ModelDefinition<Shape, IdentifierType<Shape, Identifier>, ModelType>
		{
			constructor()
			{
				// Initialize properties to undefined.
				Object.assign(this,
					// Build empty properties model from shape entries.
					Object.fromEntries(shapeEntries.map(([key]) => [key, undefined])) as PropertiesModel<Shape>
				);
			}

			/**
			 * Calling a function for each defined property.
			 * @param callback - The function to call.
			 * @protected
			 */
			protected forEachModelProperty<ReturnType>(callback: (propertyName: keyof Shape, propertyDefinition: UnknownDefinition) => ReturnType): ReturnType
			{
				for (const [propertyName, propertyDefinition] of shapeEntries)
				{ // For each property, checking that its type is defined and calling the callback with its type.
					// If the property is defined, calling the function with the property name and definition.
					const result = callback(propertyName, propertyDefinition);
					// If there is a return value, returning it directly (loop is broken).
					if (typeof result !== "undefined") return result;
				}
			}


			/**
			 * The original properties values.
			 * @protected
			 */
			protected _originalProperties: Partial<PropertiesModel<Shape>> = {};

			/**
			 * The original (serialized) object.
			 * @protected
			 */
			protected _originalObject: SerializedModel<Shape>|null = null;



			getIdentifier(): IdentifierType<Shape, Identifier>
			{
				return (this as PropertiesModel<Shape>)?.[identifier];
			}

			getIdentifierName(): IdentifierNameType<Shape>
			{
				return identifier;
			}

			serialize(): SerializedModel<Shape>
			{
				// Creating an empty (=> partial) serialized object.
				const serializedObject: Partial<SerializedModel<Shape>> = {};

				this.forEachModelProperty((propertyName, propertyDefinition) => {
					// For each defined model property, adding it to the serialized object.
					serializedObject[propertyName] = propertyDefinition.type.serialize((this as PropertiesModel<Shape>)?.[propertyName]);
				});

				return serializedObject as SerializedModel<Shape>; // Returning the serialized object.
			}

			deserialize(obj: SerializedModel<Shape>): ModelType
			{
				this.forEachModelProperty((propertyName, propertyDefinition) => {
					// For each defined model property, assigning its deserialized value.
					(this as PropertiesModel<Shape>)[propertyName] = propertyDefinition.type.deserialize(obj[propertyName]);
				});

				// Reset original property values.
				this.resetDiff();

				this._originalObject = obj; // The model is not a new one, but loaded from a deserialized one. Storing it.

				return this as unknown as ModelType;
			}


			isNew(): boolean
			{
				return !this._originalObject;
			}

			isDirty(): boolean
			{
				return this.forEachModelProperty((propertyName, propertyDefinition) => (
					// For each property, checking if it is different.
					propertyDefinition.type.propertyHasChanged(this._originalProperties[propertyName], (this as PropertiesModel<Shape>)[propertyName])
						// There is a difference, we should return false.
						? true
						// There is no difference, returning nothing.
						: undefined
				)) === true;
			}


			serializeDiff(): Partial<SerializedModel<Shape>>
			{
				// Creating an empty (=> partial) serialized object.
				const serializedObject: Partial<SerializedModel<Shape>> = {};

				this.forEachModelProperty((propertyName, propertyDefinition) => {
					// For each defined model property, adding it to the serialized object if it has changed or if it is the identifier.
					if (
						identifier == propertyName ||
						propertyDefinition.type.propertyHasChanged(this._originalProperties[propertyName], (this as PropertiesModel<Shape>)[propertyName])
					) // Adding the current property to the serialized object if it is the identifier or its value has changed.
						serializedObject[propertyName] = propertyDefinition.type.serializeDiff((this as PropertiesModel<Shape>)?.[propertyName]);
				});

				return serializedObject; // Returning the serialized object.
			}

			resetDiff(): void
			{
				this.forEachModelProperty((propertyName, propertyDefinition) => {
					// For each property, set its original value to its current property value.
					this._originalProperties[propertyName] = structuredClone(this as PropertiesModel<Shape>)[propertyName];
					propertyDefinition.type.resetDiff((this as PropertiesModel<Shape>)[propertyName]);
				});
			}

			patch(): Partial<SerializedModel<Shape>>
			{
				// Get the difference.
				const diff = this.serializeDiff();

				// Once the difference has been obtained, reset it.
				this.resetDiff();

				return diff; // Return the difference.
			}

		} as unknown as ConstructorOf<ModelType>
	);
}

/**
 * Any Sharkitek model.
 */
export type AnyModel = Model<any, any>;
/**
 * Any Sharkitek model class.
 */
export type AnyModelClass = ModelClass<AnyModel, any>;

/**
 * Add extends function to a model class.
 * @param genericModel The model class on which to add the extends function.
 */
function withExtends<ModelType extends Model<Shape, IdentifierType<Shape, Identifier>>, Shape extends ModelShape, Identifier extends keyof Shape = any>(
	genericModel: ConstructorOf<ModelType>
): ModelClass<ModelType, Shape, Identifier>
{
	return Object.assign(
		genericModel,
		{ // Extends function definition.
			extends<Extension extends object>(extension: Extension): ModelClass<ModelType & Extension, Shape, Identifier>
			{
				// Clone the model class and add extends function.
				const classClone = withExtends(class extends (genericModel as AnyModelClass) {} as AnyModelClass as ConstructorOf<ModelType & Extension>);
				// Add extension to the model class prototype.
				Object.assign(classClone.prototype, extension);
				return classClone;
			}
		}
	) as AnyModelClass as ModelClass<ModelType, Shape, Identifier>;
}
