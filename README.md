# Sharkitek Core

## Introduction

Sharkitek is a Javascript / TypeScript library designed to ease development of client-side models.

With Sharkitek, you define the architecture of your models by specifying their properties and their types.
Then, you can use the defined methods like `serialize`, `deserialize` or `serializeDiff`.

```typescript
class Example extends Model<Example>
{
	id: number;
	name: string;
	
	protected SDefinition(): ModelDefinition<Example>
	{
		return {
			id: SDefine(SNumeric),
			name: SDefine(SString),
		};
	}
}
```

## Examples

### Simple model definition

```typescript
/**
 * A person.
 */
class Person extends Model<Person>
{
	id: number;
	name: string;
	firstName: string;
	email: string;
	createdAt: Date;
	active: boolean = true;
	
	protected SIdentifier(): ModelIdentifier<Person>
	{
		return "id";
	}
	
	protected SDefinition(): ModelDefinition<Person>
	{
		return {
			name: SDefine(SString),
			firstName: SDefine(SString),
			email: SDefine(SString),
			createdAt: SDefine(SDate),
			active: SDefine(SBool),
		};
	}
}
```

```typescript
/**
 * An article.
 */
class Article extends Model<Article>
{
	id: number;
	title: string;
	authors: Author[] = [];
	text: string;
	evaluation: number;

	protected SIdentifier(): ModelIdentifier<Article>
	{
		return "id";
	}

	protected SDefinition(): ModelDefinition<Article>
	{
		return {
			id: SDefine(SNumeric),
			title: SDefine(SString),
			authors: SDefine(SArray(SModel(Author))),
			text: SDefine(SString),
			evaluation: SDefine(SDecimal),
		};
	}
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
- `ModelType`: instance of a specific class in the model, object in the serialized object.

When you are defining a Sharkitek property, you must provide its type by instantiating one of these classes.

```typescript
class Example extends Model<Example>
{
	foo: string;
	
	protected SDefinition(): ModelDefinition<Example>
	{
		return {
			foo: new Definition(new StringType()),
		};
	}
}
```

To ease the use of these classes and reduce read complexity, some constant variables and functions are defined in the library,
following a certain naming convention: "S{type_name}".

- `BoolType` => `SBool`
- `StringType` => `SString`
- `NumericType` => `SNumeric`
- `DecimalType` => `SDecimal`
- `DateType` => `SDate`
- `ArrayType` => `SArray`
- `ModelType` => `SModel`

When the types require parameters, the constant is defined as a function. If there is no parameter, then a simple
variable is enough.

Type implementers should provide a corresponding variable or function for each defined type. They can even provide
multiple functions or constants when predefined parameters. (For example, we could define `SStringArray` which would
be a variable similar to `SArray(SString)`.)

```typescript
class Example extends Model<Example>
{
	foo: string = undefined;
	
	protected SDefinition(): ModelDefinition<Example>
	{
		return {
			foo: SDefine(SString),
		};
	}
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
