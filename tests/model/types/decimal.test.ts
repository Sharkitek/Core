import {describe, expect, test} from "vitest";
import {DecimalType, InvalidTypeValueError, s} from "../../../src/library";

describe("decimal type", () => {
	test("decimal type definition", () => {
		const decimalType = s.property.decimal();
		expect(decimalType.type).toBeInstanceOf(DecimalType);
	});

	describe("serialize", () => {
		test("serialize", () => {
			expect(s.property.decimal().type.serialize(5.257)).toBe("5.257");

			expect(s.property.decimal().type.serialize(null)).toBe(null);
			expect(s.property.decimal().type.serialize(undefined)).toBe(undefined);
		});

		test("invalid parameters", () => {
			expect(() => s.property.decimal().type.serialize({} as any)).toThrowError(
				InvalidTypeValueError,
			);
		});
	});

	describe("deserialize", () => {
		test("deserialize", () => {
			expect(s.property.decimal().type.deserialize("5.257")).toBe(5.257);
			expect(s.property.decimal().type.deserialize(null)).toBe(null);
			expect(s.property.decimal().type.deserialize(undefined)).toBe(undefined);
		});

		test("invalid parameters", () => {
			expect(s.property.decimal().type.deserialize({} as any)).toBe(NaN);
			expect(s.property.decimal().type.deserialize({} as any)).toBe(NaN);
		});
	});

	describe("serializeDiff", () => {
		test("serializeDiff", () => {
			expect(s.property.decimal().type.serializeDiff(542)).toBe("542");

			expect(s.property.decimal().type.serializeDiff(null)).toBe(null);
			expect(s.property.decimal().type.serializeDiff(undefined)).toBe(
				undefined,
			);
		});

		test("invalid parameters", () => {
			expect(() =>
				s.property.decimal().type.serializeDiff({} as any),
			).toThrowError(InvalidTypeValueError);
		});
	});

	describe("resetDiff", () => {
		test("resetDiff", () => {
			s.property.decimal().type.resetDiff(5.257);
			s.property.decimal().type.resetDiff(undefined);
			s.property.decimal().type.resetDiff(null);
		});

		test("invalid parameters", () => {
			expect(() =>
				s.property.decimal().type.resetDiff({} as any),
			).not.toThrow();
		});
	});

	describe("hasChanged", () => {
		test("hasChanged", () => {
			expect(s.property.decimal().type.hasChanged(5.257, 5.257)).toBeFalsy();
			expect(s.property.decimal().type.hasChanged(null, null)).toBeFalsy();
			expect(
				s.property.decimal().type.hasChanged(undefined, undefined),
			).toBeFalsy();
			expect(
				s.property.decimal().type.hasChanged(null, undefined),
			).toBeTruthy();
			expect(
				s.property.decimal().type.hasChanged(undefined, null),
			).toBeTruthy();
			expect(s.property.decimal().type.hasChanged(null, 5.257)).toBeTruthy();
			expect(
				s.property.decimal().type.hasChanged(undefined, 5.257),
			).toBeTruthy();
			expect(s.property.decimal().type.hasChanged(5.257, null)).toBeTruthy();
			expect(
				s.property.decimal().type.hasChanged(5.257, undefined),
			).toBeTruthy();
		});

		test("invalid parameters", () => {
			expect(
				s.property.decimal().type.hasChanged({} as any, {} as any),
			).toBeTruthy();
			expect(
				s.property.decimal().type.hasChanged(false as any, false as any),
			).toBeFalsy();
		});
	});

	describe("serializedHasChanged", () => {
		test("serializedHasChanged", () => {
			expect(
				s.property.decimal().type.serializedHasChanged("5.257", "5.257"),
			).toBeFalsy();
			expect(
				s.property.decimal().type.serializedHasChanged(null, null),
			).toBeFalsy();
			expect(
				s.property.decimal().type.serializedHasChanged(undefined, undefined),
			).toBeFalsy();
			expect(
				s.property.decimal().type.serializedHasChanged(null, undefined),
			).toBeTruthy();
			expect(
				s.property.decimal().type.serializedHasChanged(undefined, null),
			).toBeTruthy();
			expect(
				s.property.decimal().type.serializedHasChanged(null, "5.257"),
			).toBeTruthy();
			expect(
				s.property.decimal().type.serializedHasChanged(undefined, "5.257"),
			).toBeTruthy();
			expect(
				s.property.decimal().type.serializedHasChanged("5.257", null),
			).toBeTruthy();
			expect(
				s.property.decimal().type.serializedHasChanged("5.257", undefined),
			).toBeTruthy();
		});

		test("invalid parameters", () => {
			expect(
				s.property.decimal().type.serializedHasChanged({} as any, {} as any),
			).toBeTruthy();
			expect(
				s.property
					.decimal()
					.type.serializedHasChanged(false as any, false as any),
			).toBeFalsy();
		});
	});

	describe("clone", () => {
		test("invalid parameters", () => {
			expect(s.property.decimal().type.clone({} as any)).toStrictEqual({});
		});
	});

	test("applyPatch", () => {
		expect(s.property.decimal().type.applyPatch(1, "5.257", false)).toBe(5.257);
		expect(s.property.decimal().type.applyPatch(undefined, "5.257", true)).toBe(
			5.257,
		);
		expect(s.property.decimal().type.applyPatch(null, "5.257", false)).toBe(
			5.257,
		);
		expect(
			s.property.decimal().type.applyPatch(5.257, undefined, false),
		).toBeUndefined();
		expect(s.property.decimal().type.applyPatch(5.257, null, false)).toBeNull();
	});
});
