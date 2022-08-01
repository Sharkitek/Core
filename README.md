# Sharkitek Core

## Introduction

Sharkitek is a Javascript / TypeScript library designed to ease development of client-side models.

With Sharkitek, you define the architecture of your models by applying decorators (which define their type) on your class properties.
Then, you can use the defined methods like `serialize`, `deserialize` or `serializeDiff`.

Sharkitek makes use of decorators as defined in the [TypeScript Reference](https://www.typescriptlang.org/docs/handbook/decorators.html).
Due to the way decorators work, you must always set a value to your properties when you declare them, even if this value is `undefined`.

```typescript
class Example extends Model
{
	@Property(SNumeric)
	@Identifier
	id: number = undefined;
	
	@Property(SString)
	name: string = undefined;
}
```

## Examples

### Simple model definition

```typescript
/**
 * A person.
 */
class Person extends Model
{
	@Property(SNumeric)
	@Identifier
	id: number = undefined;
	
	@Property(SString)
	name: string = undefined;

	@Property(SString)
	firstName: string = undefined;

	@Property(SString)
	email: string = undefined;
}
```

**Important**: You _must_ set a value to all your defined properties. If there is no set value, the decorator will not
be applied instantly on object initialization and the deserialization will not work properly.

```typescript
/**
 * An article.
 */
class Article extends Model
{
	@Property(SNumeric)
	@Identifier
	id: number = undefined;

	@Property(SString)
	title: string = undefined;

	@Property(SArray(SModel(Author)))
	authors: Author[] = [];

	@Property(SString)
	text: string = undefined;

	@Property(SDecimal)
	evaluation: number = undefined;
}
```

## API

### Types

Types are defined by a class extending `Type`.

Sharkitek defines some basic types by default, in these classes:

- `StringType`: string in the model, string in the serialized object.
- `NumericType`: number in the model, number in the serialized object.
- `DecimalType`: number in the model, formatted string in the serialized object.
- `ArrayType`: array in the model, array in the serialized object.
- `ModelType`: instance of a specific class in the model, object in the serialized object.

When you are defining a Sharkitek property, you must provide its type by instantiating one of these classes.

```typescript
class Example extends Model
{
	@Property(new StringType())
	foo: string = undefined;
}
```

To ease the use of these classes and reduce read complexity, some constant variables and functions are defined in the library,
following a certain naming convention: "S{type_name}".

- `StringType` => `SString`
- `NumericType` => `SNumeric`
- `DecimalType` => `SDecimal`
- `ArrayType` => `SArray`
- `ModelType` => `SModel`

When the types require parameters, the constant is defined as a function. If there is no parameter, then a simple
variable is enough.

Type implementers should provide a corresponding variable or function for each defined type. They can even provide
multiple functions or constants when predefined parameters. (For example, we could define `SStringArray` which would
be a variable similar to `SArray(SString)`.)

```typescript
class Example extends Model
{
	@Property(SString)
	foo: string = undefined;
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
