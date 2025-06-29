import {
	defineModel,
	IdentifierDefinition,
	ModelDefinition,
	ModelShape,
} from "./model";
import {ConstructorOf} from "../utils";
import {Definition} from "./property-definition";

/**
 * Model definition builder.
 */
export class ModelBuilder<
	T extends object,
	Shape extends ModelShape<T>,
	Identifier extends IdentifierDefinition<T, Shape>,
> {
	/**
	 * The built model definition.
	 */
	definition: ModelDefinition<T, Shape, Identifier>;

	/**
	 * Define a new property.
	 * @param name The new property name.
	 * @param definition The new property definition.
	 */
	property<
		SerializedType,
		PropertyName extends Exclude<keyof T, keyof Shape>,
		PropertyDefinition extends Definition<SerializedType, T[PropertyName]>,
	>(name: PropertyName, definition: PropertyDefinition) {
		(this.definition.properties[name] as Definition<unknown, T[typeof name]>) =
			definition;

		return this as unknown as ModelBuilder<
			T,
			Shape & {[k in PropertyName]: PropertyDefinition},
			Identifier
		>;
	}

	/**
	 * Set the model identifier.
	 * @param identifier The new model identifier.
	 */
	identifier<NewIdentifier extends IdentifierDefinition<T, Shape>>(
		identifier: NewIdentifier,
	) {
		(this.definition.identifier as unknown) = identifier;
		return this as unknown as ModelBuilder<T, Shape, NewIdentifier>;
	}

	/**
	 * Define a model using the current model definition.
	 */
	define() {
		return defineModel(this.definition);
	}
}

/**
 * Initialize a model builder for the provided class.
 * @param Class The class for which to build a model.
 */
export function newModel<
	T extends object,
	Shape extends ModelShape<T> = object,
	Identifier extends IdentifierDefinition<T, Shape> = never,
>(Class: ConstructorOf<T>): ModelBuilder<T, Shape, Identifier> {
	const builder = new ModelBuilder<T, Shape, Identifier>();
	builder.definition = {
		Class,
		properties: {} as Shape,
	};
	return builder;
}
