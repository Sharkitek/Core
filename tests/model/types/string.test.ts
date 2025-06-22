import {describe, expect, test} from "vitest";
import {s, StringType} from "../../../src/library";

describe("string type", () => {
	test("string type definition", () => {
		const stringType = s.property.string();
		expect(stringType.type).toBeInstanceOf(StringType);
	});

	test("string type functions", () => {
		expect(s.property.string().type.serialize("test")).toBe("test");
		expect(s.property.string().type.deserialize("test")).toBe("test");
		expect(s.property.string().type.serializeDiff("test")).toBe("test");

		expect(s.property.string().type.serialize(null)).toBe(null);
		expect(s.property.string().type.deserialize(null)).toBe(null);
		expect(s.property.string().type.serializeDiff(null)).toBe(null);

		expect(s.property.string().type.serialize(undefined)).toBe(undefined);
		expect(s.property.string().type.deserialize(undefined)).toBe(undefined);
		expect(s.property.string().type.serializeDiff(undefined)).toBe(undefined);

		expect(s.property.string().type.hasChanged("test", "test")).toBeFalsy();
		expect(s.property.string().type.hasChanged(null, null)).toBeFalsy();
		expect(s.property.string().type.hasChanged(undefined, undefined)).toBeFalsy();
		expect(s.property.string().type.hasChanged(null, undefined)).toBeTruthy();
		expect(s.property.string().type.hasChanged(undefined, null)).toBeTruthy();
		expect(s.property.string().type.hasChanged(null, "test")).toBeTruthy();
		expect(s.property.string().type.hasChanged(undefined, "test")).toBeTruthy();
		expect(s.property.string().type.hasChanged("test", null)).toBeTruthy();
		expect(s.property.string().type.hasChanged("test", undefined)).toBeTruthy();

		expect(s.property.string().type.serializedHasChanged("test", "test")).toBeFalsy();
		expect(s.property.string().type.serializedHasChanged(null, null)).toBeFalsy();
		expect(s.property.string().type.serializedHasChanged(undefined, undefined)).toBeFalsy();
		expect(s.property.string().type.serializedHasChanged(null, undefined)).toBeTruthy();
		expect(s.property.string().type.serializedHasChanged(undefined, null)).toBeTruthy();
		expect(s.property.string().type.serializedHasChanged(null, "test")).toBeTruthy();
		expect(s.property.string().type.serializedHasChanged(undefined, "test")).toBeTruthy();
		expect(s.property.string().type.serializedHasChanged("test", null)).toBeTruthy();
		expect(s.property.string().type.serializedHasChanged("test", undefined)).toBeTruthy();

		s.property.string().type.resetDiff("test");
		s.property.string().type.resetDiff(undefined);
		s.property.string().type.resetDiff(null);

		expect(s.property.string().type.applyPatch("another", "test", false)).toBe("test");
		expect(s.property.string().type.applyPatch(undefined, "test", true)).toBe("test");
		expect(s.property.string().type.applyPatch(null, "test", false)).toBe("test");
		expect(s.property.string().type.applyPatch("test", undefined, false)).toBeUndefined();
		expect(s.property.string().type.applyPatch("test", null, false)).toBeNull();
	});

	test("invalid parameters types", () => {
		const testDate = new Date();
		expect(s.property.string().type.serialize({} as any)).toBe("[object Object]");
		expect(s.property.string().type.serialize(2120 as any)).toBe("2120");
		expect(s.property.string().type.serialize(testDate as any)).toBe(testDate.toString());
		expect(s.property.string().type.deserialize({} as any)).toBe("[object Object]");
		expect(s.property.string().type.deserialize(2120 as any)).toBe("2120");
		expect(s.property.string().type.serializeDiff({} as any)).toBe("[object Object]");
		expect(s.property.string().type.serializeDiff(2120 as any)).toBe("2120");
		expect(s.property.string().type.hasChanged({} as any, {} as any)).toBeTruthy();
		expect(s.property.string().type.hasChanged(false as any, false as any)).toBeFalsy();
		expect(s.property.string().type.serializedHasChanged({} as any, {} as any)).toBeTruthy();
		expect(s.property.string().type.serializedHasChanged(false as any, false as any)).toBeFalsy();
		expect(s.property.string().type.clone({} as any)).toStrictEqual({});
	});
});
