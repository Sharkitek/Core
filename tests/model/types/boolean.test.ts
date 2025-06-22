import {describe, expect, test} from "vitest";
import {BooleanType, s} from "../../../src/library";

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

		expect(s.property.boolean().type.applyPatch(false, true, true)).toBeTruthy();
		expect(s.property.boolean().type.applyPatch(false, true, false)).toBeTruthy();
		expect(s.property.boolean().type.applyPatch(true, false, false)).toBeFalsy();
		expect(s.property.boolean().type.applyPatch(false, undefined, false)).toBeUndefined();
		expect(s.property.boolean().type.applyPatch(false, null, false)).toBeNull();
		expect(s.property.boolean().type.applyPatch(undefined, null, false)).toBeNull();
		expect(s.property.boolean().type.applyPatch(null, null, false)).toBeNull();
		expect(s.property.boolean().type.applyPatch(null, false, false)).toBeFalsy();
	});

	test("invalid parameters types", () => {
		expect(s.property.boolean().type.serialize(1 as any)).toBeTruthy();
		expect(s.property.boolean().type.serialize(0 as any)).toBeFalsy();
		expect(s.property.boolean().type.deserialize(1 as any)).toBeTruthy();
		expect(s.property.boolean().type.deserialize(0 as any)).toBeFalsy();
		expect(s.property.boolean().type.serializeDiff(1 as any)).toBeTruthy();
		expect(s.property.boolean().type.serializeDiff(0 as any)).toBeFalsy();
		expect(() => s.property.boolean().type.resetDiff({} as any)).not.toThrow();
		expect(s.property.boolean().type.hasChanged({} as any, {} as any)).toBeTruthy();
		expect(s.property.boolean().type.hasChanged(false as any, false as any)).toBeFalsy();
		expect(s.property.boolean().type.serializedHasChanged({} as any, {} as any)).toBeTruthy();
		expect(s.property.boolean().type.serializedHasChanged(false as any, false as any)).toBeFalsy();
		expect(s.property.boolean().type.clone({} as any)).toStrictEqual({});
	});
});
