import {describe, expect, test} from "vitest";
import {InvalidTypeValueError, NumericType, s} from "../../../src/library";

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
		expect(
			s.property.numeric().type.hasChanged(undefined, undefined),
		).toBeFalsy();
		expect(s.property.numeric().type.hasChanged(null, undefined)).toBeTruthy();
		expect(s.property.numeric().type.hasChanged(undefined, null)).toBeTruthy();
		expect(s.property.numeric().type.hasChanged(null, 5.257)).toBeTruthy();
		expect(s.property.numeric().type.hasChanged(undefined, 5.257)).toBeTruthy();
		expect(s.property.numeric().type.hasChanged(5.257, null)).toBeTruthy();
		expect(s.property.numeric().type.hasChanged(5.257, undefined)).toBeTruthy();

		expect(
			s.property.numeric().type.serializedHasChanged(5.257, 5.257),
		).toBeFalsy();
		expect(
			s.property.numeric().type.serializedHasChanged(null, null),
		).toBeFalsy();
		expect(
			s.property.numeric().type.serializedHasChanged(undefined, undefined),
		).toBeFalsy();
		expect(
			s.property.numeric().type.serializedHasChanged(null, undefined),
		).toBeTruthy();
		expect(
			s.property.numeric().type.serializedHasChanged(undefined, null),
		).toBeTruthy();
		expect(
			s.property.numeric().type.serializedHasChanged(null, 5.257),
		).toBeTruthy();
		expect(
			s.property.numeric().type.serializedHasChanged(undefined, 5.257),
		).toBeTruthy();
		expect(
			s.property.numeric().type.serializedHasChanged(5.257, null),
		).toBeTruthy();
		expect(
			s.property.numeric().type.serializedHasChanged(5.257, undefined),
		).toBeTruthy();

		s.property.numeric().type.resetDiff(5.257);
		s.property.numeric().type.resetDiff(undefined);
		s.property.numeric().type.resetDiff(null);

		expect(s.property.numeric().type.applyPatch(1, 5.257, false)).toBe(5.257);
		expect(s.property.numeric().type.applyPatch(null, 5.257, true)).toBe(5.257);
		expect(s.property.numeric().type.applyPatch(undefined, 5.257, false)).toBe(
			5.257,
		);
		expect(
			s.property.numeric().type.applyPatch(5.257, undefined, false),
		).toBeUndefined();
		expect(s.property.numeric().type.applyPatch(5.257, null, false)).toBeNull();
	});

	test("invalid parameters types", () => {
		expect(() => s.property.numeric().type.serialize({} as any)).toThrowError(
			InvalidTypeValueError,
		);
		expect(() => s.property.numeric().type.deserialize({} as any)).toThrowError(
			InvalidTypeValueError,
		);
		expect(() =>
			s.property.numeric().type.serializeDiff({} as any),
		).toThrowError(InvalidTypeValueError);
		expect(() => s.property.numeric().type.resetDiff({} as any)).not.toThrow();
		expect(
			s.property.numeric().type.hasChanged({} as any, {} as any),
		).toBeTruthy();
		expect(
			s.property.numeric().type.hasChanged(false as any, false as any),
		).toBeFalsy();
		expect(
			s.property.numeric().type.serializedHasChanged({} as any, {} as any),
		).toBeTruthy();
		expect(
			s.property
				.numeric()
				.type.serializedHasChanged(false as any, false as any),
		).toBeFalsy();
		expect(s.property.numeric().type.clone({} as any)).toStrictEqual({});
	});
});
