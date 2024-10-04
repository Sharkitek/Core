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
	<img alt="Version 3.0.0" src="https://img.shields.io/badge/version-3.0.0-blue" />
</p>

## Introduction

Sharkitek is a Javascript / TypeScript library designed to ease development of client-side models.

With Sharkitek, you define the architecture of your models by specifying their properties and their types.
Then, you can use the defined methods like `serialize`, `deserialize`, `save` or `serializeDiff`.

```typescript
class Example extends s.model({
	id: s.property.numeric(),
	name: s.property.string(),
})
{
}
```

## Examples

### Simple model definition

```typescript
/**
 * A person.
 */
class Person extends s.model({
	id: s.property.numeric(),
	name: s.property.string(),
	firstName: s.property.string(),
	email: s.property.string(),
	createdAt: s.property.date(),
	active: s.property.boolean(),
}, "id")
{
	active: boolean = true;
}
```

```typescript
/**
 * An article.
 */
class Article extends s.model({
	id: s.property.numeric(),
	title: s.property.string(),
	authors: s.property.array(s.property.model(Author)),
	text: s.property.string(),
	evaluation: s.property.decimal(),
	tags: s.property.array(
		s.property.object({
			name: s.property.string(),
		})
	),
}, "id")
{
	id: number;
	title: string;
	authors: Author[] = [];
	text: string;
	evaluation: number;
	tags: {
		name: string;
	}[];
}
```

## API

### Types

Types are defined by a class extending `Type`.

Sharkitek defines some basic types by default, in these classes:

- `BoolType`: boolean value in the model, boolean value in the serialized object.
- `StringType`: string in the model, string in the serialized object.
- `NumericType`: number in the model, number in the serialized object.
- `DecimalType`: number in the model, formatted string in the serialized object.
- `DateType`: date in the model, ISO formatted date in the serialized object.
- `ArrayType`: array in the model, array in the serialized object.
- `ObjectType`: object in the model, object in the serialized object.
- `ModelType`: instance of a specific class in the model, object in the serialized object.

When you are defining a property of a Sharkitek model, you must provide its type by instantiating one of these classes.

```typescript
class Example extends s.model({
	foo: s.property.define(new StringType()),
})
{
	foo: string;
}
```

To ease the use of these classes and reduce read complexity,
properties of each type are easily definable with a function for each type.

- `BoolType` => `s.property.boolean`
- `StringType` => `s.property.string`
- `NumericType` => `s.property.numeric`
- `DecimalType` => `s.property.decimal`
- `DateType` => `s.property.date`
- `ArrayType` => `s.property.array`
- `ObjectType` => `s.property.object`
- `ModelType` => `s.property.model`

Type implementers should provide a corresponding function for each defined type. They can even provide
multiple functions or constants with predefined parameters.
(For example, we could define `s.property.stringArray()` which would be similar to `s.property.array(s.property.string())`.)

```typescript
class Example extends s.model({
	foo: s.property.string(),
})
{
	foo: string;
}
```

### Models

#### `serialize()`

Serialize the model.

Example:

```typescript
const serializedObject = model.serialize();
```

#### `deserialize(serializedObject)`

Deserialize the model.

Example:

```typescript
const model = (new TestModel()).deserialize({
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
const model = (new TestModel()).deserialize({
	id: 5,
	title: "Hello World!",
	users: [
		{
			id: 6,
			name: "TEST",
		},
	],
});

model.title = "A new title for a new world";

const result = model.serializeDiff();
// if `id` is defined as the model identifier:
// result = { id: 5, title: "A new title for a new world" }
// if `id` is not defined as the model identifier:
// result = { title: "A new title for a new world" }
```

#### `resetDiff()`

Set current properties values as original values.

Example:

```typescript
const model = (new TestModel()).deserialize({
	id: 5,
	title: "Hello World!",
	users: [
		{
			id: 6,
			name: "TEST",
		},
	],
});

model.title = "A new title for a new world";

model.resetDiff();

const result = model.serializeDiff();
// if `id` is defined as the model identifier:
// result = { id: 5 }
// if `id` is not defined as the model identifier:
// result = {}
```

#### `save()`

Get difference between original values and current ones, then reset it.
Similar to call `serializeDiff()` then `resetDiff()`.

```typescript
const model = (new TestModel()).deserialize({
	id: 5,
	title: "Hello World!",
	users: [
		{
			id: 6,
			name: "TEST",
		},
	],
});

model.title = "A new title for a new world";

const result = model.save();
// if `id` is defined as the model identifier:
// result = { id: 5, title: "A new title for a new world" }
// if `id` is not defined as the model identifier:
// result = { title: "A new title for a new world" }
```
