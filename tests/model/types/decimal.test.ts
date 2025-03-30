import {describe, expect, test} from "vitest";
import {DecimalType, InvalidTypeValueError, s} from "../../../src/library";

describe("decimal type", () => {
	test("decimal type definition", () => {
		const decimalType = s.property.decimal();
		expect(decimalType.type).toBeInstanceOf(DecimalType);
	});

	test("decimal type functions", () => {
		expect(s.property.decimal().type.serialize(5.257)).toBe("5.257");
		expect(s.property.decimal().type.deserialize("5.257")).toBe(5.257);
		expect(s.property.decimal().type.serializeDiff(542)).toBe("542");

		expect(s.property.decimal().type.serialize(null)).toBe(null);
		expect(s.property.decimal().type.deserialize(null)).toBe(null);
		expect(s.property.decimal().type.serializeDiff(null)).toBe(null);

		expect(s.property.decimal().type.serialize(undefined)).toBe(undefined);
		expect(s.property.decimal().type.deserialize(undefined)).toBe(undefined);
		expect(s.property.decimal().type.serializeDiff(undefined)).toBe(undefined);

		expect(s.property.decimal().type.hasChanged(5.257, 5.257)).toBeFalsy();
		expect(s.property.decimal().type.hasChanged(null, null)).toBeFalsy();
		expect(s.property.decimal().type.hasChanged(undefined, undefined)).toBeFalsy();
		expect(s.property.decimal().type.hasChanged(null, undefined)).toBeTruthy();
		expect(s.property.decimal().type.hasChanged(undefined, null)).toBeTruthy();
		expect(s.property.decimal().type.hasChanged(null, 5.257)).toBeTruthy();
		expect(s.property.decimal().type.hasChanged(undefined, 5.257)).toBeTruthy();
		expect(s.property.decimal().type.hasChanged(5.257, null)).toBeTruthy();
		expect(s.property.decimal().type.hasChanged(5.257, undefined)).toBeTruthy();

		expect(s.property.decimal().type.serializedHasChanged("5.257", "5.257")).toBeFalsy();
		expect(s.property.decimal().type.serializedHasChanged(null, null)).toBeFalsy();
		expect(s.property.decimal().type.serializedHasChanged(undefined, undefined)).toBeFalsy();
		expect(s.property.decimal().type.serializedHasChanged(null, undefined)).toBeTruthy();
		expect(s.property.decimal().type.serializedHasChanged(undefined, null)).toBeTruthy();
		expect(s.property.decimal().type.serializedHasChanged(null, "5.257")).toBeTruthy();
		expect(s.property.decimal().type.serializedHasChanged(undefined, "5.257")).toBeTruthy();
		expect(s.property.decimal().type.serializedHasChanged("5.257", null)).toBeTruthy();
		expect(s.property.decimal().type.serializedHasChanged("5.257", undefined)).toBeTruthy();

		s.property.decimal().type.resetDiff(5.257);
		s.property.decimal().type.resetDiff(undefined);
		s.property.decimal().type.resetDiff(null);
	});

	test("invalid parameters types", () => {
		expect(() => s.property.decimal().type.serialize({} as any)).toThrowError(InvalidTypeValueError);
		expect(s.property.decimal().type.deserialize({} as any)).toBe(NaN);
		expect(s.property.decimal().type.deserialize({} as any)).toBe(NaN);
		expect(() => s.property.decimal().type.serializeDiff({} as any)).toThrowError(InvalidTypeValueError);
		expect(() => s.property.decimal().type.resetDiff({} as any)).not.toThrow();
		expect(s.property.decimal().type.hasChanged({} as any, {} as any)).toBeTruthy();
		expect(s.property.decimal().type.hasChanged(false as any, false as any)).toBeFalsy();
		expect(s.property.decimal().type.serializedHasChanged({} as any, {} as any)).toBeTruthy();
		expect(s.property.decimal().type.serializedHasChanged(false as any, false as any)).toBeFalsy();
		expect(s.property.decimal().type.clone({} as any)).toStrictEqual({});
	});
});
