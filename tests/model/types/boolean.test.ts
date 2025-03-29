import {describe, expect, test} from "vitest";
import {BooleanType, s, StringType} from "../../../src/library";

describe("boolean type", () => {
	test("boolean type definition", () => {
		{
			const booleanType = s.property.boolean();
			expect(booleanType.type).toBeInstanceOf(BooleanType);
		}
		{
			const boolType = s.property.bool();
			expect(boolType.type).toBeInstanceOf(BooleanType);
		}
	});

	test("boolean type functions", () => {
		expect(s.property.boolean().type.serialize(false)).toBe(false);
		expect(s.property.boolean().type.deserialize(false)).toBe(false);
		expect(s.property.boolean().type.serializeDiff(true)).toBe(true);

		expect(s.property.boolean().type.serialize(null)).toBe(null);
		expect(s.property.boolean().type.deserialize(null)).toBe(null);
		expect(s.property.boolean().type.serializeDiff(null)).toBe(null);

		expect(s.property.boolean().type.serialize(undefined)).toBe(undefined);
		expect(s.property.boolean().type.deserialize(undefined)).toBe(undefined);
		expect(s.property.boolean().type.serializeDiff(undefined)).toBe(undefined);

		expect(s.property.boolean().type.hasChanged(true, true)).toBeFalsy();
		expect(s.property.boolean().type.hasChanged(null, null)).toBeFalsy();
		expect(s.property.boolean().type.hasChanged(undefined, undefined)).toBeFalsy();
		expect(s.property.boolean().type.hasChanged(null, undefined)).toBeTruthy();
		expect(s.property.boolean().type.hasChanged(undefined, null)).toBeTruthy();
		expect(s.property.boolean().type.hasChanged(null, false)).toBeTruthy();
		expect(s.property.boolean().type.hasChanged(undefined, false)).toBeTruthy();
		expect(s.property.boolean().type.hasChanged(false, null)).toBeTruthy();
		expect(s.property.boolean().type.hasChanged(false, undefined)).toBeTruthy();

		expect(s.property.boolean().type.serializedHasChanged(false, false)).toBeFalsy();
		expect(s.property.boolean().type.serializedHasChanged(null, null)).toBeFalsy();
		expect(s.property.boolean().type.serializedHasChanged(undefined, undefined)).toBeFalsy();
		expect(s.property.boolean().type.serializedHasChanged(null, undefined)).toBeTruthy();
		expect(s.property.boolean().type.serializedHasChanged(undefined, null)).toBeTruthy();
		expect(s.property.boolean().type.serializedHasChanged(null, false)).toBeTruthy();
		expect(s.property.boolean().type.serializedHasChanged(undefined, false)).toBeTruthy();
		expect(s.property.boolean().type.serializedHasChanged(false, null)).toBeTruthy();
		expect(s.property.boolean().type.serializedHasChanged(false, undefined)).toBeTruthy();

		s.property.boolean().type.resetDiff(false);
		s.property.boolean().type.resetDiff(undefined);
		s.property.boolean().type.resetDiff(null);
	});
});
