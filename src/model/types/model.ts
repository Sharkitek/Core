import {Type} from "./type";
import {define, Definition} from "../property-definition";
import {
	GenericModelManager,
	IdentifierDefinition,
	DeclaredModelManager,
	ModelInstance,
	ModelManager,
	ModelShape,
	SerializedModel,
} from "../model";
import {InvalidTypeValueError} from "../../errors";

/**
 * Type of a Sharkitek model value.
 */
export class ModelType<
	T extends object,
	Shape extends ModelShape<T>,
	Identifier extends IdentifierDefinition<T, Shape>,
> extends Type<SerializedModel<T, Shape>, ModelInstance<T, Shape, Identifier>> {
	/**
	 * Initialize a new model type of a Sharkitek model property.
	 * @param declaredModelManager Model manager.
	 */
	constructor(
		protected declaredModelManager: DeclaredModelManager<T, Shape, Identifier>,
	) {
		super();
	}

	/**
	 * Resolve the defined model using the declared model, that can be defined lazily.
	 */
	get definedModel(): ModelManager<T, Shape, Identifier> {
		return typeof this.declaredModelManager == "object"
			? this.declaredModelManager
			: this.declaredModelManager();
	}

	serialize(
		value: ModelInstance<T, Shape, Identifier> | null | undefined,
	): SerializedModel<T, Shape> | null | undefined {
		if (value === undefined) return undefined;
		if (value === null) return null;

		if (!(value instanceof this.definedModel.definition.Class))
			throw new InvalidTypeValueError(
				this,
				value,
				`value must be a compatible model (given ${value.constructor.name}, expected ${this.definedModel.definition.Class.name})`,
			);

		// Serializing the given model.
		return this.definedModel.model(value).serialize();
	}

	deserialize(
		value: SerializedModel<T, Shape> | null | undefined,
	): ModelInstance<T, Shape, Identifier> | null | undefined {
		if (value === undefined) return undefined;
		if (value === null) return null;

		if (typeof value !== "object" || Array.isArray(value))
			throw new InvalidTypeValueError(this, value, "value must be an object");

		// Parse the given object in the new model.
		return this.definedModel.parse(value);
	}

	serializeDiff(
		value: ModelInstance<T, Shape, Identifier> | null | undefined,
	): Partial<SerializedModel<T, Shape>> | null | undefined {
		if (value === undefined) return undefined;
		if (value === null) return null;

		if (!(value instanceof this.definedModel.definition.Class))
			throw new InvalidTypeValueError(
				this,
				value,
				`value must be a compatible model (given ${value.constructor.name}, expected ${this.definedModel.definition.Class.name})`,
			);

		// Serializing the given model.
		return this.definedModel.model(value).serializeDiff();
	}

	resetDiff(
		value: ModelInstance<T, Shape, Identifier> | null | undefined,
	): void {
		if (value === undefined) return;
		if (value === null) return;

		if (!(value instanceof this.definedModel.definition.Class))
			throw new InvalidTypeValueError(
				this,
				value,
				`value must be a compatible model (given ${value.constructor.name}, expected ${this.definedModel.definition.Class.name})`,
			);

		// Reset diff of the given model.
		this.definedModel.model(value).resetDiff();
	}

	hasChanged(
		originalValue: ModelInstance<T, Shape, Identifier> | null | undefined,
		currentValue: ModelInstance<T, Shape, Identifier> | null | undefined,
	): boolean {
		if (originalValue === undefined) return currentValue !== undefined;
		if (originalValue === null) return currentValue !== null;
		if (currentValue === undefined) return true; // Original value is not undefined.
		if (currentValue === null) return true; // Original value is not null.

		if (!(originalValue instanceof this.definedModel.definition.Class))
			throw new InvalidTypeValueError(
				this,
				originalValue,
				`value must be a compatible model (given ${originalValue.constructor.name}, expected ${this.definedModel.definition.Class.name})`,
			);
		if (!(currentValue instanceof this.definedModel.definition.Class))
			throw new InvalidTypeValueError(
				this,
				currentValue,
				`value must be a compatible model (given ${currentValue.constructor.name}, expected ${this.definedModel.definition.Class.name})`,
			);

		// If the current value is dirty, it has changed.
		return this.definedModel.model(currentValue).isDirty();
	}

	serializedHasChanged(
		originalValue: SerializedModel<T, Shape> | null | undefined,
		currentValue: SerializedModel<T, Shape> | null | undefined,
	): boolean {
		if (originalValue === undefined) return currentValue !== undefined;
		if (originalValue === null) return currentValue !== null;
		if (currentValue === undefined) return true; // Original value is not undefined.
		if (currentValue === null) return true; // Original value is not null.

		if (typeof originalValue !== "object" || Array.isArray(originalValue))
			throw new InvalidTypeValueError(
				this,
				originalValue,
				"value must be an object",
			);
		if (typeof currentValue !== "object" || Array.isArray(currentValue))
			throw new InvalidTypeValueError(
				this,
				currentValue,
				"value must be an object",
			);

		// If any property has changed, the value has changed.
		for (const property of this.definedModel.properties)
			if (
				property.definition.type.serializedHasChanged(
					originalValue?.[property.name],
					currentValue?.[property.name],
				)
			)
				return true;

		return false; // No change detected.
	}

	clone<Type extends ModelInstance<T, Shape, Identifier>>(
		value: Type | null | undefined,
	): Type {
		// Handle NULL / undefined values.
		if (!value) return super.clone(value);

		if (!(value instanceof this.definedModel.definition.Class))
			throw new InvalidTypeValueError(
				this,
				value,
				`value must be a compatible model (given ${value.constructor.name}, expected ${this.definedModel.definition.Class.name})`,
			);

		return this.definedModel.model(value).clone() as Type;
	}

	applyPatch<Type extends ModelInstance<T, Shape, Identifier>>(
		currentValue: Type | null | undefined,
		patchValue: SerializedModel<T, Shape> | null | undefined,
		updateOriginals: boolean,
	): Type | null | undefined {
		if (patchValue === undefined) return undefined;
		if (patchValue === null) return null;

		if (typeof patchValue !== "object" || Array.isArray(patchValue))
			throw new InvalidTypeValueError(
				this,
				patchValue,
				"value must be an object",
			);

		return this.definedModel
			.model(currentValue)
			.applyPatch(patchValue, updateOriginals) as Type;
	}
}

/**
 * New model property definition.
 * @param definedModel Model manager.
 */
export function model<
	T extends object,
	Shape extends ModelShape<T>,
	Identifier extends IdentifierDefinition<T, Shape>,
>(
	definedModel: DeclaredModelManager<T, Shape, Identifier>,
): Definition<SerializedModel<T, Shape>, ModelInstance<T, Shape, Identifier>> {
	return define(new ModelType(definedModel));
}

/**
 * Utility function to fix circular dependencies issues.
 * @param definedModel A function returning the model to use.
 */
export function circular<T extends object>(
	definedModel: () => any,
): () => GenericModelManager<T> {
	return definedModel;
}
