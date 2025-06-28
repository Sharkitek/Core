import {Definition, UnknownDefinition} from "./property-definition";
import {ConstructorOf, Modify} from "../utils";

/**
 * A model shape.
 */
export type ModelShape<T extends object> = Partial<{
	[k in keyof T]: Definition<unknown, T[k]>;
}>;

/**
 * Properties values of a model based on its shape.
 */
export type ModelPropertiesValues<
	T extends object,
	Shape extends ModelShape<T>,
> = {
	[k in keyof Shape]: Shape[k]["_sharkitek"];
};

/**
 * Serialized object type based on model shape.
 */
export type SerializedModel<T extends object, Shape extends ModelShape<T>> = {
	[k in keyof Shape]?: Shape[k]["_serialized"];
};

/**
 * This is an experimental serialized model type declaration.
 * @deprecated
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ExperimentalSerializedModel<
	T extends object,
	Shape extends ModelShape<T>,
> = Omit<
	ExperimentalSerializedModelBase<T, Shape>,
	ExperimentalSerializedModelOptionalKeys<T, Shape>
> &
	Pick<
		Partial<ExperimentalSerializedModelBase<T, Shape>>,
		ExperimentalSerializedModelOptionalKeys<T, Shape>
	>;
type ExperimentalSerializedModelBase<
	T extends object,
	Shape extends ModelShape<T>,
> = {
	[k in keyof Shape]: Shape[k]["_serialized"];
};
type ExperimentalSerializedModelOptionalKeys<
	T extends object,
	Shape extends ModelShape<T>,
> = {
	[k in keyof Shape]: Shape[k]["_serialized"] extends undefined ? k : never;
}[keyof Shape];

/**
 * A sharkitek model instance, with internal model state.
 */
export type ModelInstance<
	T extends object,
	Shape extends ModelShape<T>,
	Identifier extends IdentifierDefinition<T, Shape>,
> = T & {
	/**
	 * The Sharkitek model state.
	 */
	_sharkitek: Model<T, Shape, Identifier>;
};

/**
 * Identifier definition type.
 */
export type IdentifierDefinition<
	T extends object,
	Shape extends ModelShape<T>,
> = keyof Shape | (keyof Shape)[];

/**
 * Identifier type.
 */
export type IdentifierType<
	T extends object,
	Shape extends ModelShape<T>,
	Identifier extends IdentifierDefinition<T, Shape>,
> = Identifier extends keyof Shape
	? Shape[Identifier]["_sharkitek"]
	: {
			[K in keyof Identifier]: Identifier[K] extends keyof Shape
				? Shape[Identifier[K]]["_sharkitek"]
				: unknown;
		};

/**
 * A model definition object.
 */
export interface ModelDefinition<
	T extends object,
	Shape extends ModelShape<T>,
	Identifier extends IdentifierDefinition<T, Shape>,
> {
	/**
	 * Model class.
	 */
	Class: ConstructorOf<T>;

	/**
	 * Properties names of the model identifier.
	 * Can be a single of a composite identifier.
	 */
	identifier?: Identifier;

	/**
	 * Model properties definition.
	 * Set properties types (serialized and deserialized).
	 */
	properties: Shape;
}

/**
 * A model property.
 */
export interface ModelProperty<T extends object, Shape extends ModelShape<T>> {
	/**
	 * Property name.
	 */
	name: keyof Shape;

	/**
	 * Property definition.
	 */
	definition: UnknownDefinition;

	/**
	 * Set if the property is part of the identifier or not.
	 */
	identifier: boolean;
}

/**
 * Model properties iterator object.
 */
export type ModelProperties<
	T extends object,
	Shape extends ModelShape<T>,
> = ModelProperty<T, Shape>[];

/**
 * A Sharkitek model state.
 */
export class Model<
	T extends object,
	Shape extends ModelShape<T>,
	Identifier extends IdentifierDefinition<T, Shape>,
> {
	/**
	 * The model manager instance.
	 */
	readonly manager: ModelManager<T, Shape, Identifier>;

	/**
	 * The model definition object.
	 */
	readonly definition: ModelDefinition<T, Shape, Identifier>;

	/**
	 * Iterable properties.
	 */
	readonly properties: ModelProperties<T, Shape>;

	/**
	 * The actual instance of the model.
	 */
	instance: ModelInstance<T, Shape, Identifier>;

	/**
	 * Original values, to keep track of the changes on the model properties.
	 * @protected
	 */
	protected original: {
		/**
		 * The original properties values.
		 */
		properties: Partial<ModelPropertiesValues<T, Shape>>;

		/**
		 * The original serialized object, if there is one.
		 */
		serialized: SerializedModel<T, Shape> | null;
	};

	/**
	 * Initialize a new model state with the defined properties.
	 * @param manager The model manager.
	 */
	constructor(manager: ModelManager<T, Shape, Identifier>) {
		this.manager = manager;
		this.definition = manager.definition;
		this.properties = manager.properties;
	}

	/**
	 * Initialize the Sharkitek model state for a new instance.
	 */
	initInstance(): this {
		return this.fromInstance(
			// Initialize a new model instance.
			new this.definition.Class(),
		);
	}

	/**
	 * Initialize the Sharkitek model state for the provided instance.
	 * @param instance The model instance.
	 */
	fromInstance(instance: T): this {
		// Initialize the sharkitek model instance.
		const sharkitekInstance = instance as ModelInstance<T, Shape, Identifier>;

		// Keep the original instance, if it exists.
		const originalInstance = sharkitekInstance._sharkitek;

		// Set references to instance / model state.
		sharkitekInstance._sharkitek = this;
		this.instance = sharkitekInstance;

		if (originalInstance)
			// Share the same original values object.
			this.original = originalInstance.original;
		else {
			// Initialize a new original values object, based on the current values of the instance.
			this.original = {
				properties: undefined,
				serialized: null,
			};
			this.resetDiff();
		}

		return this;
	}

	/**
	 * Deserialize provided data to a new model instance.
	 * @param serialized Serialized model.
	 */
	deserialize(serialized: SerializedModel<T, Shape>): this {
		// Initialize a new model instance.
		this.initInstance();

		for (const property of this.properties) {
			// For each defined model property, assigning its deserialized value.
			(this.instance[property.name as keyof T] as any) =
				property.definition.type.deserialize(serialized[property.name]);
		}

		// Reset original property values.
		this.resetDiff();
		// Store the original serialized object.
		this.original.serialized = serialized;

		return this;
	}

	/**
	 * Get current model instance identifier.
	 */
	getIdentifier(): IdentifierType<T, Shape, Identifier> {
		if (Array.isArray(this.definition.identifier)) {
			// The identifier is composite, make an array of properties values.
			return this.definition.identifier.map(
				(identifier) => this.instance?.[identifier as keyof T],
			) as IdentifierType<T, Shape, Identifier>;
		} else {
			// The identifier is a simple property, get its value.
			return this.instance?.[
				this.definition.identifier as keyof Shape as keyof T
			] as IdentifierType<T, Shape, Identifier>;
		}
	}

	/**
	 * Get current model instance properties.
	 */
	getInstanceProperties(): ModelPropertiesValues<T, Shape> {
		// Initialize an empty model properties object.
		const instanceProperties: Partial<ModelPropertiesValues<T, Shape>> = {};

		for (const property of this.properties) {
			// For each defined model property, adding it to the properties object.
			instanceProperties[property.name] =
				this.instance?.[property.name as keyof T]; // keyof Shape is a subset of keyof T.
		}

		return instanceProperties as ModelPropertiesValues<T, Shape>; // Returning the properties object.
	}

	/**
	 * Serialize the model instance.
	 */
	serialize(): SerializedModel<T, Shape> {
		// Creating an empty serialized object.
		const serializedObject: Partial<SerializedModel<T, Shape>> = {};

		for (const property of this.properties) {
			// For each defined model property, adding it to the serialized object.
			serializedObject[property.name] = property.definition.type.serialize(
				// keyof Shape is a subset of keyof T.
				this.instance?.[property.name as keyof T],
			);
		}

		return serializedObject as SerializedModel<T, Shape>; // Returning the serialized object.
	}

	/**
	 * Examine if the model is new (never deserialized) or not.
	 */
	isNew(): boolean {
		return !this.original.serialized;
	}

	/**
	 * Examine if the model is dirty or not.
	 */
	isDirty(): boolean {
		for (const property of this.properties) {
			// For each property, check if it is different.
			if (
				property.definition.type.hasChanged(
					this.original.properties?.[property.name],
					this.instance?.[property.name as keyof T],
				)
			)
				// There is a difference: the model is dirty.
				return true;
		}

		// No difference.
		return false;
	}

	/**
	 * Serialize the difference between current model state and the original one.
	 */
	serializeDiff(): Partial<SerializedModel<T, Shape>> {
		// Creating an empty serialized object.
		const serializedObject: Partial<SerializedModel<T, Shape>> = {};

		for (const property of this.properties) {
			// For each defined model property, adding it to the serialized object if it has changed or if it is in the identifier.
			const instancePropValue = this.instance?.[property.name as keyof T]; // keyof Shape is a subset of keyof T.
			if (
				property.identifier ||
				property.definition.type.hasChanged(
					this.original.properties?.[property.name],
					instancePropValue,
				)
			)
				// The property is part of the identifier or its value has changed.
				serializedObject[property.name] =
					property.definition.type.serializeDiff(instancePropValue);
		}

		return serializedObject; // Returning the serialized object.
	}

	/**
	 * Set current model properties as original values.
	 */
	resetDiff(): void {
		this.original.properties = {};
		for (const property of this.properties) {
			// For each property, set its original value to the current property value.
			const instancePropValue = this.instance?.[property.name as keyof T];
			this.original.properties[property.name] =
				property.definition.type.clone(instancePropValue);
			property.definition.type.resetDiff(instancePropValue);
		}
	}

	/**
	 * Get difference between original values and current ones, then reset it.
	 * Similar to call `serializeDiff()` then `resetDiff()`.
	 */
	patch(): Partial<SerializedModel<T, Shape>> {
		// Get the difference.
		const diff = this.serializeDiff();

		// Once the difference has been obtained, reset it.
		this.resetDiff();

		return diff; // Return the difference.
	}

	/**
	 * Clone the model instance.
	 */
	clone(): ModelInstance<T, Shape, Identifier> {
		// Initialize a new instance for the clone.
		const cloned = this.manager.model();

		// Clone every value of the model instance.
		for (const [key, value] of Object.entries(this.instance) as [
			keyof T,
			unknown,
		][]) {
			// For each [key, value], clone the value and put it in the cloned instance.

			// Do not clone ourselves.
			if (key == "_sharkitek") continue;

			if (this.definition.properties[key]) {
				// The current key is a defined property, clone using the defined type.
				(cloned.instance[key] as any) = (
					this.definition.properties[key] as UnknownDefinition
				).type.clone(value);
			} else {
				// Not a property, cloning the raw value.
				(cloned.instance[key] as any) = structuredClone(value);
			}
		}

		// Clone original properties.
		for (const property of this.properties) {
			// For each property, clone its original value.
			cloned.original.properties[property.name] =
				property.definition.type.clone(this.original.properties[property.name]);
		}

		// Clone original serialized.
		cloned.original.serialized = structuredClone(this.original.serialized);

		return cloned.instance; // Returning the cloned instance.
	}

	/**
	 * Assign the provided fields to existing properties.
	 * Fields that cannot be matched to existing properties are silently ignored.
	 * @param fields The fields to assign to the model.
	 */
	assign(
		fields: Partial<ModelPropertiesValues<T, Shape>> & {[field: string]: any},
	): ModelInstance<T, Shape, Identifier> {
		for (const field in fields) {
			// For each field, if it's a property, assign its value.
			if ((this.definition.properties as any)?.[field])
				// Set the instance value.
				this.instance[field as keyof T] = fields[field];
		}
		return this.instance;
	}

	/**
	 * Apply a patch to the model instance. All known fields will be deserialized and assigned to the properties.
	 * @param patch The patch object to apply.
	 * @param updateOriginals Indicates if the original properties values must be updated or not. By default, they are reset.
	 */
	applyPatch(
		patch: SerializedModel<T, Shape>,
		updateOriginals: boolean = true,
	): ModelInstance<T, Shape, Identifier> {
		if (updateOriginals) {
			// If serialized original is null and we need to update it, initialize it.
			this.original.serialized = this.serialize();
		}

		for (const serializedField in patch) {
			// For each field, if it's a property, assign its value.
			// Get the property definition.
			const property =
				this.definition.properties[serializedField as keyof Shape];
			if (property) {
				// Found a matching model property, assigning its deserialized value.
				(this.instance[serializedField as keyof Shape as keyof T] as any) = (
					property as UnknownDefinition
				).type.applyPatch(
					this.instance[serializedField as keyof Shape as keyof T],
					patch[serializedField],
					updateOriginals,
				);

				if (updateOriginals) {
					// Update original values.
					// Set original property value.
					(this.original.properties[serializedField] as any) = (
						property as UnknownDefinition
					).type.clone(
						this.instance[serializedField as keyof Shape as keyof T],
					);
					// Set original serialized value.
					this.original.serialized[serializedField] = patch[serializedField];
				}
			}
		}
		return this.instance;
	}
}

/**
 * A model manager, created from a model definition.
 */
export class ModelManager<
	T extends object,
	Shape extends ModelShape<T>,
	Identifier extends IdentifierDefinition<T, Shape>,
> {
	/**
	 * Defined properties.
	 */
	properties: ModelProperties<T, Shape>;

	/**
	 * Initialize a model manager from a model definition.
	 * @param definition The model definition.
	 */
	constructor(
		public readonly definition: ModelDefinition<T, Shape, Identifier>,
	) {
		this.initProperties();
	}

	/**
	 * Initialize properties iterator from current definition.
	 * @protected
	 */
	protected initProperties(): void {
		// Build an array of model properties from the definition.
		this.properties = [];
		for (const propertyName in this.definition.properties) {
			// For each property, build a model property object.
			this.properties.push({
				name: propertyName,
				definition: this.definition.properties[propertyName],
				// Find out if the current property is part of the identifier.
				identifier: Array.isArray(this.definition.identifier)
					? // The identifier is an array, the property must be in the array.
						this.definition.identifier.includes(
							propertyName as keyof Shape as keyof T,
						)
					: // The identifier is a single string, the property must be the defined identifier.
						this.definition.identifier == (propertyName as keyof Shape),
			} as ModelProperty<T, Shape>);
		}
	}

	/**
	 * Get the model state of the provided model instance.
	 * @param instance The model instance for which to get its state. NULL or undefined to create a new one.
	 */
	model(
		instance: T | ModelInstance<T, Shape, Identifier> | null = null,
	): Model<T, Shape, Identifier> {
		// Get the instance model state if there is one, or initialize a new one.
		if (instance)
			// There is an instance, create a model from it.
			return (
				(instance as ModelInstance<T, Shape, Identifier>)?._sharkitek ??
				new Model<T, Shape, Identifier>(this)
			).fromInstance(instance);
		else
			// No instance, initialize a new one.
			return new Model<T, Shape, Identifier>(this).initInstance();
	}

	/**
	 * Initialize a new model instance with the provided object properties values.
	 * Fields that cannot be matched to existing properties are silently ignored.
	 * @param fields
	 */
	from(
		fields: Partial<ModelPropertiesValues<T, Shape>> & {[field: string]: any},
	): ModelInstance<T, Shape, Identifier> {
		return this.model().assign(fields);
	}

	/**
	 * Parse the serialized model object to a new model instance.
	 * @param serialized The serialized model object.
	 */
	parse(
		serialized: SerializedModel<T, Shape>,
	): ModelInstance<T, Shape, Identifier> {
		return this.model().deserialize(serialized).instance;
	}
}

/**
 * Define a new model.
 * @param definition The model definition object.
 */
export function defineModel<
	T extends object,
	Shape extends ModelShape<T>,
	Identifier extends IdentifierDefinition<T, Shape>,
>(definition: ModelDefinition<T, Shape, Identifier>) {
	return new ModelManager<T, Shape, Identifier>(definition);
}

/**
 * Define a new model, extending an existing one.
 * @param extendedModel The extended model manager instance.
 * @param definition The extension of the model definition object.
 */
export function extend<
	ExtT extends object,
	ExtShape extends ModelShape<ExtT>,
	ExtIdentifier extends IdentifierDefinition<ExtT, ExtShape>,
	T extends ExtT,
	Shape extends ModelShape<T>,
	Identifier extends IdentifierDefinition<T, Shape>,
	ResIdentifier extends IdentifierDefinition<T, ResShape>,
	ResShape extends ModelShape<T> = Modify<ExtShape, Shape>,
>(
	extendedModel: ModelManager<ExtT, ExtShape, ExtIdentifier>,
	definition: ModelDefinition<T, Shape, Identifier>,
) {
	const {properties: extendedProperties, ...overridableDefinition} =
		extendedModel.definition;
	const {properties: propertiesExtension, ...definitionExtension} = definition;
	return new ModelManager({
		...overridableDefinition,
		...definitionExtension,
		properties: {
			...extendedProperties,
			...propertiesExtension,
		},
	}) as unknown as ModelManager<T, ResShape, ResIdentifier>;
}

/**
 * A generic model manager for a provided model type, to use in circular dependencies.
 */
export type GenericModelManager<T extends object> = ModelManager<
	T,
	ModelShape<T>,
	IdentifierDefinition<T, ModelShape<T>>
>;

/**
 * Function to get a model manager lazily.
 */
export type LazyModelManager<
	T extends object,
	Shape extends ModelShape<T>,
	Identifier extends IdentifierDefinition<T, Shape>,
> = () => ModelManager<T, Shape, Identifier>;
/**
 * A model manager definition that can be lazy.
 */
export type DeclaredModelManager<
	T extends object,
	Shape extends ModelShape<T>,
	Identifier extends IdentifierDefinition<T, Shape>,
> = ModelManager<T, Shape, Identifier> | LazyModelManager<T, Shape, Identifier>;
