import {describe, expect, test} from "vitest";
import {
	InvalidTypeValueError,
	NumericType,
	ObjectType,
	s,
	StringType,
} from "../../../src/library";

describe("object type", () => {
	test("object type definition", () => {
		const objectType = s.property.object({
			test: s.property.string(),
			another: s.property.numeric(),
		});
		expect(objectType.type).toBeInstanceOf(ObjectType);

		expect((objectType.type as any).properties).toHaveLength(2);
		for (const property of (objectType.type as any).properties) {
			// Check all object properties.
			if (property.name == "test")
				expect(property.definition.type).toBeInstanceOf(StringType);
			else if (property.name == "another")
				expect(property.definition.type).toBeInstanceOf(NumericType);
			else expect.unreachable();
		}
	});

	const testProperty = s.property.object({
		test: s.property.string(),
		another: s.property.decimal(),
	});

	test("object type functions", () => {
		expect(
			testProperty.type.serialize({test: "test", another: 12.548777}),
		).toEqual({test: "test", another: "12.548777"});
		expect(
			testProperty.type.deserialize({test: "test", another: "12.548777"}),
		).toEqual({test: "test", another: 12.548777});
		expect(
			testProperty.type.serializeDiff({test: "test", another: 12.548777}),
		).toEqual({test: "test", another: "12.548777"});

		expect(testProperty.type.serialize(null)).toEqual(null);
		expect(testProperty.type.deserialize(null)).toEqual(null);
		expect(testProperty.type.serializeDiff(null)).toEqual(null);

		expect(testProperty.type.serialize(undefined)).toEqual(undefined);
		expect(testProperty.type.deserialize(undefined)).toEqual(undefined);
		expect(testProperty.type.serializeDiff(undefined)).toEqual(undefined);

		expect(
			testProperty.type.hasChanged(
				{test: "test", another: 12.548777},
				{another: 12.548777, test: "test"},
			),
		).toBeFalsy();
		expect(
			testProperty.type.hasChanged(
				{test: "test", another: 12.548777},
				{test: "test", another: 12.548778},
			),
		).toBeTruthy();
		expect(testProperty.type.hasChanged(null, null)).toBeFalsy();
		expect(testProperty.type.hasChanged(undefined, undefined)).toBeFalsy();
		expect(testProperty.type.hasChanged(null, undefined)).toBeTruthy();
		expect(testProperty.type.hasChanged(undefined, null)).toBeTruthy();
		expect(
			testProperty.type.hasChanged(null, {test: "test", another: 12.548777}),
		).toBeTruthy();
		expect(
			testProperty.type.hasChanged(undefined, {
				test: "test",
				another: 12.548777,
			}),
		).toBeTruthy();
		expect(
			testProperty.type.hasChanged({test: "test", another: 12.548777}, null),
		).toBeTruthy();
		expect(
			testProperty.type.hasChanged(
				{test: "test", another: 12.548777},
				undefined,
			),
		).toBeTruthy();

		expect(
			testProperty.type.serializedHasChanged(
				{test: "test", another: "12.548777"},
				{another: "12.548777", test: "test"},
			),
		).toBeFalsy();
		expect(
			testProperty.type.serializedHasChanged(
				{test: "test", another: "12.548777"},
				{test: "test", another: "12.548778"},
			),
		).toBeTruthy();
		expect(testProperty.type.serializedHasChanged(null, null)).toBeFalsy();
		expect(
			testProperty.type.serializedHasChanged(undefined, undefined),
		).toBeFalsy();
		expect(
			testProperty.type.serializedHasChanged(null, undefined),
		).toBeTruthy();
		expect(
			testProperty.type.serializedHasChanged(undefined, null),
		).toBeTruthy();
		expect(
			testProperty.type.serializedHasChanged(null, {
				test: "test",
				another: "12.548777",
			}),
		).toBeTruthy();
		expect(
			testProperty.type.serializedHasChanged(undefined, {
				test: "test",
				another: "12.548777",
			}),
		).toBeTruthy();
		expect(
			testProperty.type.serializedHasChanged(
				{test: "test", another: "12.548777"},
				null,
			),
		).toBeTruthy();
		expect(
			testProperty.type.serializedHasChanged(
				{test: "test", another: "12.548777"},
				undefined,
			),
		).toBeTruthy();

		testProperty.type.resetDiff({test: "test", another: 12.548777});
		testProperty.type.resetDiff(undefined);
		testProperty.type.resetDiff(null);

		{
			// Test that values are cloned in a different object.
			const propertyValue = {test: "test", another: 12.548777};
			const clonedPropertyValue = testProperty.type.clone(propertyValue);
			expect(clonedPropertyValue).not.toBe(propertyValue);
			expect(clonedPropertyValue).toEqual(propertyValue);
		}
		{
			// Test that values are cloned in a different object.
			const propertyValue = {arr: [12, 11]};
			const clonedPropertyValue = s.property
				.object({arr: s.property.array(s.property.numeric())})
				.type.clone(propertyValue);
			expect(clonedPropertyValue).not.toBe(propertyValue);
			expect(clonedPropertyValue).toEqual(propertyValue);
			expect(clonedPropertyValue.arr).not.toBe(propertyValue.arr);
			expect(clonedPropertyValue.arr).toEqual(propertyValue.arr);
		}
		expect(testProperty.type.clone(undefined)).toBe(undefined);
		expect(testProperty.type.clone(null)).toBe(null);

		{
			// Apply a patch with undefined / NULL values.
			expect(
				testProperty.type.applyPatch(
					{test: "test", another: 12.548777},
					undefined,
					false,
				),
			).toBeUndefined();
			expect(
				testProperty.type.applyPatch(
					{test: "test", another: 12.548777},
					null,
					true,
				),
			).toBeNull();
		}

		{
			// Invalid patch.
			expect(() =>
				testProperty.type.applyPatch(
					{test: "test", another: 12.548777},
					5416 as any,
					false,
				),
			).toThrow(InvalidTypeValueError);
		}

		{
			// Apply a patch.
			{
				const objectInstance = testProperty.type.applyPatch(
					{test: "test", another: 12.548777},
					{test: "another"},
					true,
				);

				expect(objectInstance).toStrictEqual({
					test: "another",
					another: 12.548777,
				});
			}

			{
				const objectInstance = testProperty.type.applyPatch(
					undefined,
					{test: "test"},
					false,
				);

				expect(objectInstance).toStrictEqual({
					test: "test",
				});
			}

			{
				const objectInstance = testProperty.type.applyPatch(
					null,
					{test: "test"},
					false,
				);

				expect(objectInstance).toStrictEqual({
					test: "test",
				});
			}
		}
	});

	test("invalid parameters types", () => {
		expect(() => testProperty.type.serialize(5 as any)).toThrowError(
			InvalidTypeValueError,
		);
		expect(() => testProperty.type.deserialize(5 as any)).toThrowError(
			InvalidTypeValueError,
		);
		expect(() => testProperty.type.serializeDiff(5 as any)).toThrowError(
			InvalidTypeValueError,
		);
		expect(() => testProperty.type.resetDiff(5 as any)).toThrowError(
			InvalidTypeValueError,
		);
		expect(() => testProperty.type.hasChanged(5 as any, 5 as any)).toThrowError(
			InvalidTypeValueError,
		);
		expect(() =>
			testProperty.type.serializedHasChanged(5 as any, 5 as any),
		).toThrowError(InvalidTypeValueError);
		expect(() => testProperty.type.clone(5 as any)).toThrowError(
			InvalidTypeValueError,
		);

		expect(() => testProperty.type.serialize([] as any)).toThrowError(
			InvalidTypeValueError,
		);
		expect(() => testProperty.type.deserialize([] as any)).toThrowError(
			InvalidTypeValueError,
		);
		expect(() => testProperty.type.serializeDiff([] as any)).toThrowError(
			InvalidTypeValueError,
		);
		expect(() => testProperty.type.resetDiff([] as any)).toThrowError(
			InvalidTypeValueError,
		);
		expect(() =>
			testProperty.type.hasChanged({} as any, [] as any),
		).toThrowError(InvalidTypeValueError);
		expect(() =>
			testProperty.type.serializedHasChanged({} as any, [] as any),
		).toThrowError(InvalidTypeValueError);
		expect(() => testProperty.type.clone([] as any)).toThrowError(
			InvalidTypeValueError,
		);
	});
});
