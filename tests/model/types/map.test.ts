import {describe, expect, test} from "vitest";
import {InvalidTypeValueError, NumericType, s, StringType} from "../../../src/library";
import {MapType} from "../../../src/model/types/map";

describe("map type", () => {
	test("map type definition", () => {
		const mapType = s.property.map(s.property.string(), s.property.numeric());
		expect(mapType.type).toBeInstanceOf(MapType);
	});

	const testProperty = s.property.map(s.property.string(), s.property.decimal());
	const testMapValue = new Map<string, number>();
	testMapValue.set("test", 1.52);
	testMapValue.set("another", 55);

	test("object type functions", () => {
		expect(testProperty.type.serialize(testMapValue)).toEqual({
			test: "1.52",
			another: "55",
		});
		expect(testProperty.type.deserialize({
			test: "1.52",
			another: "55",
		})).toEqual(testMapValue);
		expect(testProperty.type.serializeDiff(testMapValue)).toEqual({
			test: "1.52",
			another: "55",
		});

		expect(testProperty.type.serialize(null)).toEqual(null);
		expect(testProperty.type.deserialize(null)).toEqual(null);
		expect(testProperty.type.serializeDiff(null)).toEqual(null);

		expect(testProperty.type.serialize(undefined)).toEqual(undefined);
		expect(testProperty.type.deserialize(undefined)).toEqual(undefined);
		expect(testProperty.type.serializeDiff(undefined)).toEqual(undefined);

		const anotherTestMapValue = new Map<string, number>();
		anotherTestMapValue.set("test", 1.52);
		anotherTestMapValue.set("another", 55);
		expect(testProperty.type.hasChanged(testMapValue, anotherTestMapValue)).toBeFalsy();
		anotherTestMapValue.set("test", 1.521);
		expect(testProperty.type.hasChanged(testMapValue, anotherTestMapValue)).toBeTruthy();
		anotherTestMapValue.delete("test");
		expect(testProperty.type.hasChanged(testMapValue, anotherTestMapValue)).toBeTruthy();
		expect(testProperty.type.hasChanged(null, null)).toBeFalsy();
		expect(testProperty.type.hasChanged(undefined, undefined)).toBeFalsy();
		expect(testProperty.type.hasChanged(null, undefined)).toBeTruthy();
		expect(testProperty.type.hasChanged(undefined, null)).toBeTruthy();
		expect(testProperty.type.hasChanged(null, testMapValue)).toBeTruthy();
		expect(testProperty.type.hasChanged(undefined, testMapValue)).toBeTruthy();
		expect(testProperty.type.hasChanged(testMapValue, null)).toBeTruthy();
		expect(testProperty.type.hasChanged(testMapValue, undefined)).toBeTruthy();

		expect(testProperty.type.serializedHasChanged({ test: "1.52", another: "55" }, { test: "1.52", another: "55" })).toBeFalsy();
		expect(testProperty.type.serializedHasChanged({ test: "1.52", another: "55" }, { test: "1.521", another: "55" })).toBeTruthy();
		expect(testProperty.type.serializedHasChanged({ test: "1.52", another: "55" }, { another: "55" })).toBeTruthy();
		expect(testProperty.type.serializedHasChanged(null, null)).toBeFalsy();
		expect(testProperty.type.serializedHasChanged(undefined, undefined)).toBeFalsy();
		expect(testProperty.type.serializedHasChanged(null, undefined)).toBeTruthy();
		expect(testProperty.type.serializedHasChanged(undefined, null)).toBeTruthy();
		expect(testProperty.type.serializedHasChanged(null, { test: "1.52", another: "55" })).toBeTruthy();
		expect(testProperty.type.serializedHasChanged(undefined, { test: "1.52", another: "55" })).toBeTruthy();
		expect(testProperty.type.serializedHasChanged({ test: "1.52", another: "55" }, null)).toBeTruthy();
		expect(testProperty.type.serializedHasChanged({ test: "1.52", another: "55" }, undefined)).toBeTruthy();

		testProperty.type.resetDiff(testMapValue);
		testProperty.type.resetDiff(undefined);
		testProperty.type.resetDiff(null);

		{ // Test that keys and values are cloned in a different map.
			const clonedTestMapValue = testProperty.type.clone(testMapValue);
			expect(clonedTestMapValue).not.toBe(testMapValue);
			expect(clonedTestMapValue).toEqual(testMapValue);
		}
		{ // Test that values are cloned in a different object.
			const propertyValue = new Map();
			propertyValue.set("test", [12, 11]);
			const clonedPropertyValue = s.property.stringMap(s.property.array(s.property.numeric())).type.clone(propertyValue);
			expect(clonedPropertyValue).not.toBe(propertyValue);
			expect(clonedPropertyValue).toEqual(propertyValue);
			expect(clonedPropertyValue.get("test")).not.toBe(propertyValue.get("test"));
			expect(clonedPropertyValue.get("test")).toEqual(propertyValue.get("test"));
		}
		expect(testProperty.type.clone(undefined)).toBe(undefined);
		expect(testProperty.type.clone(null)).toBe(null);

		{ // Apply a patch with undefined / NULL values.
			expect(testProperty.type.applyPatch(
				testMapValue,
				undefined,
				false
			)).toBeUndefined();
			expect(testProperty.type.applyPatch(
				testMapValue,
				null,
				true
			)).toBeNull();
		}

		{ // Invalid patch.
			expect(
				() => testProperty.type.applyPatch(testMapValue, 5416 as any, false)
			).toThrow(InvalidTypeValueError);
		}

		{ // Apply a patch.
			{
				const objectInstance = testProperty.type.applyPatch(
					testMapValue,
					{ test: "1.521" },
					true,
				);

				const expectedMapValue = new Map<string, number>();
				expectedMapValue.set("test", 1.521);
				expectedMapValue.set("another", 55);
				expect(objectInstance).toStrictEqual(expectedMapValue);
			}

			{
				const objectInstance = testProperty.type.applyPatch(
					undefined,
					{ test: "1.52" },
					false
				);

				const expectedMapValue = new Map<string, number>();
				expectedMapValue.set("test", 1.52);
				expect(objectInstance).toStrictEqual(expectedMapValue);
			}

			{
				const objectInstance = testProperty.type.applyPatch(
					null,
					{ test: "1.52" },
					false
				);

				const expectedMapValue = new Map<string, number>();
				expectedMapValue.set("test", 1.52);
				expect(objectInstance).toStrictEqual(expectedMapValue);
			}
		}
	});

	test("invalid parameters types", () => {
		expect(() => testProperty.type.serialize(5 as any)).toThrowError(InvalidTypeValueError);
		expect(() => testProperty.type.deserialize(5 as any)).toThrowError(InvalidTypeValueError);
		expect(() => testProperty.type.serializeDiff(5 as any)).toThrowError(InvalidTypeValueError);
		expect(() => testProperty.type.clone(5 as any)).toThrowError(InvalidTypeValueError);

		expect(() => testProperty.type.serialize([] as any)).toThrowError(InvalidTypeValueError);
		expect(() => testProperty.type.deserialize([] as any)).toThrowError(InvalidTypeValueError);
		expect(() => testProperty.type.serializeDiff([] as any)).toThrowError(InvalidTypeValueError);
		expect(() => testProperty.type.clone([] as any)).toThrowError(InvalidTypeValueError);

		expect(() => testProperty.type.serialize({} as any)).toThrowError(InvalidTypeValueError);
		expect(() => testProperty.type.serializeDiff({} as any)).toThrowError(InvalidTypeValueError);
		expect(() => testProperty.type.clone({} as any)).toThrowError(InvalidTypeValueError);
	});
});
