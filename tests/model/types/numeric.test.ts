import {describe, expect, test} from "vitest";
import {NumericType, s} from "../../../src/library";

describe("numeric type", () => {
	test("numeric type definition", () => {
		const numericType = s.property.numeric();
		expect(numericType.type).toBeInstanceOf(NumericType);
	});

	test("numeric type functions", () => {
		expect(s.property.numeric().type.serialize(5.257)).toBe(5.257);
		expect(s.property.numeric().type.deserialize(5.257)).toBe(5.257);
		expect(s.property.numeric().type.serializeDiff(542)).toBe(542);

		expect(s.property.numeric().type.serialize(null)).toBe(null);
		expect(s.property.numeric().type.deserialize(null)).toBe(null);
		expect(s.property.numeric().type.serializeDiff(null)).toBe(null);

		expect(s.property.numeric().type.serialize(undefined)).toBe(undefined);
		expect(s.property.numeric().type.deserialize(undefined)).toBe(undefined);
		expect(s.property.numeric().type.serializeDiff(undefined)).toBe(undefined);

		expect(s.property.numeric().type.hasChanged(5.257, 5.257)).toBeFalsy();
		expect(s.property.numeric().type.hasChanged(null, null)).toBeFalsy();
		expect(s.property.numeric().type.hasChanged(undefined, undefined)).toBeFalsy();
		expect(s.property.numeric().type.hasChanged(null, undefined)).toBeTruthy();
		expect(s.property.numeric().type.hasChanged(undefined, null)).toBeTruthy();
		expect(s.property.numeric().type.hasChanged(null, 5.257)).toBeTruthy();
		expect(s.property.numeric().type.hasChanged(undefined, 5.257)).toBeTruthy();
		expect(s.property.numeric().type.hasChanged(5.257, null)).toBeTruthy();
		expect(s.property.numeric().type.hasChanged(5.257, undefined)).toBeTruthy();

		expect(s.property.numeric().type.serializedHasChanged(5.257, 5.257)).toBeFalsy();
		expect(s.property.numeric().type.serializedHasChanged(null, null)).toBeFalsy();
		expect(s.property.numeric().type.serializedHasChanged(undefined, undefined)).toBeFalsy();
		expect(s.property.numeric().type.serializedHasChanged(null, undefined)).toBeTruthy();
		expect(s.property.numeric().type.serializedHasChanged(undefined, null)).toBeTruthy();
		expect(s.property.numeric().type.serializedHasChanged(null, 5.257)).toBeTruthy();
		expect(s.property.numeric().type.serializedHasChanged(undefined, 5.257)).toBeTruthy();
		expect(s.property.numeric().type.serializedHasChanged(5.257, null)).toBeTruthy();
		expect(s.property.numeric().type.serializedHasChanged(5.257, undefined)).toBeTruthy();

		s.property.numeric().type.resetDiff(5.257);
		s.property.numeric().type.resetDiff(undefined);
		s.property.numeric().type.resetDiff(null);
	});
});
