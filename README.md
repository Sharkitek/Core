<p align="center">
	<a href="https://code.zeptotech.net/Sharkitek/Core">
		<picture>
			<img alt="Sharkitek logo" width="200" src="https://code.zeptotech.net/Sharkitek/Core/raw/branch/main/logo.svg" />
		</picture>
	</a>
</p>
<h1 align="center">
	Sharkitek
</h1>

<h4 align="center">
	<a href="https://code.zeptotech.net/Sharkitek/Core">Documentation</a> |
	<a href="https://code.zeptotech.net/Sharkitek/Core">Website</a>
</h4>

<p align="center">
	TypeScript library for well-designed model architectures
</p>

<p align="center">
	<img alt="Tests status" src="https://code.zeptotech.net/Sharkitek/Core/badges/workflows/test.yaml/badge.svg" />
	<a href="https://bundlephobia.com/package/@sharkitek/core" target="_blank">
		<img alt="Bundle size" src="https://badgen.net/bundlephobia/minzip/@sharkitek/core" />
	</a>
	<a href="https://www.npmjs.com/package/@sharkitek/core" target="_blank">
		<img alt="Latest release" src="https://badgen.net/npm/v/@sharkitek/core" />
	</a>
	<a href="https://bundlephobia.com/package/@sharkitek/core" target="_blank">
		<img alt="Bundle size" src="https://badgen.net/bundlephobia/dependency-count/@sharkitek/core" />
	</a>
	<img alt="Latest release" src="https://badgen.net/npm/types/@sharkitek/core" />
</p>

## Introduction

Sharkitek is a lightweight Javascript / TypeScript library designed to ease development of models.

```shell
yarn add @sharkitek/core
```

With Sharkitek, you define the architecture of your models by specifying their properties and their types.
Then, you can use the defined methods like `serialize`, `parse`, `patch` or `serializeDiff`.

```typescript
class Example
{
	static model = defineModel({
		Class: Example,
		properties: {
			id: s.property.numeric(),
			name: s.property.string(),
		},
		identifier: "id",
	});
	
	id: number;
	name: string;
}
```

## Quick start

**Note**: by convention, we define our models in a `model` static variable in the model's class. It is a good way to keep your model declaration near the actual class, and its usage will be more natural.

### Model definition

```typescript
/**
 * A person.
 */
class Person
{
	static model = defineModel({
		Class: Person,
		properties: {
			id: s.property.numeric(),
			name: s.property.string(),
			email: s.property.string(),
			createdAt: s.property.date(),
			active: s.property.boolean(),
		},
		identifier: "id",
	});
	
	id: number;
	name: string;
	email: string;
	createdAt: Date;
	active: boolean = true;
}
```

```typescript
/**
 * An article.
 */
class Article
{
	static model = defineModel({
		Class: Article,
		properties: {
			id: s.property.numeric(),
			title: s.property.string(),
			authors: s.property.array(s.property.model(Person)),
			text: s.property.string(),
			evaluation: s.property.decimal(),
			tags: s.property.array(
				s.property.object({
					name: s.property.string(),
				})
			),
		},
		identifier: "id",
	});
	
	id: number;
	title: string;
	authors: Person[] = [];
	text: string;
	evaluation: number;
	tags: {
		name: string;
	}[];
}
```

```typescript
/**
 * A model with composite keys.
 */
class CompositeKeys
{
	static model = defineModel({
		Class: CompositeKeys,
		properties: {
			id1: s.property.numeric(),
			id2: s.property.string(),
		},
		identifier: ["id1", "id2"],
	});
	
	id1: number;
	id2: string;
}
```

### Model functions

#### Serialization

```typescript
const instance = new Person();
instance.id = 1;
instance.createdAt = new Date();
instance.name = "John Doe";
instance.email = "john@doe.test";
instance.active = true;
const serialized = Person.model.model(instance).serialize();
console.log(serialized); // { id: 1, createdAt: "YYYY-MM-DDTHH:mm:ss.sssZ", name: "John Doe", email: "john@doe.test", active: true }
```

#### Deserialization

```typescript
const instance = Person.model.parse({
	id: 1,
	createdAt: "2011-10-05T14:48:00.000Z",
	name: "John Doe",
	email: "john@doe.test",
	active: true,
});
console.log(instance instanceof Person); // true
console.log(instance.createdAt instanceof Date); // true
```

#### Patch

```typescript
const instance = Person.model.parse({
	id: 1,
	createdAt: "2011-10-05T14:48:00.000Z",
	name: "John Doe",
	email: "john@doe.test",
	active: true,
});

instance.name = "Johnny";

// Patch serialized only changed properties and the identifier.
console.log(Person.model.model(instance).patch()); // { id: 1, name: "Johnny" }
// If you run it one more time, already patched properties will not be included again.
console.log(Person.model.model(instance).patch()); // { id: 1 }
```

#### Identifier

```typescript
const instance = new CompositeKeys();
instance.id1 = 5;
instance.id2 = "foo";
const instanceIdentifier = CompositeKeys.model.model(instance).getIdentifier();
console.log(instanceIdentifier); // [5, "foo"]
```

## API

### Types

Types are defined by a class extending `Type`.

Sharkitek defines some basic types by default, in these classes:

- `BooleanType`: boolean value in the model, boolean value in the serialized object.
- `StringType`: string in the model, string in the serialized object.
- `NumericType`: number in the model, number in the serialized object.
- `DecimalType`: number in the model, formatted string in the serialized object.
- `DateType`: date in the model, ISO formatted date in the serialized object.
- `ArrayType`: array in the model, array in the serialized object.
- `ObjectType`: object in the model, object in the serialized object.
- `ModelType`: instance of a specific class in the model, object in the serialized object.

When you are defining a property of a Sharkitek model, you must provide its type by instantiating one of these classes.

```typescript
class Example
{
	static model = defineModel({
		Class: Example,
		properties: {
			foo: s.property.define(new StringType()),
		},
	});
	
	foo: string;
}
```

To ease the use of these classes and reduce read complexity, properties of each type are easily definable with a function for each type.

- `BooleanType` => `s.property.boolean`
- `StringType` => `s.property.string`
- `NumericType` => `s.property.numeric`
- `DecimalType` => `s.property.decimal`
- `DateType` => `s.property.date`
- `ArrayType` => `s.property.array`
- `ObjectType` => `s.property.object`
- `ModelType` => `s.property.model`

Type implementers should provide a corresponding function for each defined type. They can even provide multiple functions or constants with predefined parameters. For example, we could define `s.property.stringArray()` which would be similar to `s.property.array(s.property.string())`.

```typescript
class Example
{
	static model = defineModel({
		Class: Example,
		properties: {
			foo: s.property.string(),
		},
	});
	
	foo: string;
}
```

### Models

#### `model(instance)`

Get a model class (which has all the sharkitek models' functions) from a model instance.

```typescript
const model = definedModel.model(modelInstance);
```

#### `serialize()`

Serialize the model.

Example:

```typescript
const serializedObject = definedModel.model(modelInstance).serialize();
```

#### `parse(serializedObject)`

Deserialize the model.

Example:

```typescript
const modelInstance = definedModel.parse({
	id: 5,
	title: "Hello World!",
	users: [
		{
			id: 6,
			name: "TEST",
		},
	],
});
```

#### `serializeDiff()`

Serialize the difference between current model state and original one.

Example:

```typescript
const modelInstance = definedModel.parse({
	id: 5,
	title: "Hello World!",
	users: [
		{
			id: 6,
			name: "TEST",
		},
	],
});

modelInstance.title = "A new title for a new world";

const result = definedModel.model(modelInstance).serializeDiff();
// if `id` is defined as the model identifier:
// result = { id: 5, title: "A new title for a new world" }
// if `id` is not defined as the model identifier:
// result = { title: "A new title for a new world" }
```

#### `resetDiff()`

Set current properties values as original values.

Example:

```typescript
const modelInstance = definedModel.parse({
	id: 5,
	title: "Hello World!",
	users: [
		{
			id: 6,
			name: "TEST",
		},
	],
});

modelInstance.title = "A new title for a new world";

definedModel.model(modelInstance).resetDiff();

const result = definedModel.model(modelInstance).serializeDiff();
// if `id` is defined as the model identifier:
// result = { id: 5 }
// if `id` is not defined as the model identifier:
// result = {}
```

#### `patch()`

Get difference between original values and current ones, then reset it.
Similar to call `serializeDiff()` then `resetDiff()`.

```typescript
const modelInstance = definedModel.parse({
	id: 5,
	title: "Hello World!",
	users: [
		{
			id: 6,
			name: "TEST",
		},
	],
});

modelInstance.title = "A new title for a new world";

const result = definedModel.model(modelInstance).patch();
// if `id` is defined as the model identifier:
// result = { id: 5, title: "A new title for a new world" }
// if `id` is not defined as the model identifier:
// result = { title: "A new title for a new world" }
```
