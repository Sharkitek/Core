import {describe, expect, it} from "vitest";
import {InvalidTypeValueError, TypeError} from "../src/errors";
import {s} from "../src/library";

describe("errors", () => {
	it("tests type error", () => {
		expect(new TypeError(s.property.string().type).message).toBe(
			"Error in type StringType",
		);
		expect(new TypeError(s.property.string().type, "test").message).toBe(
			"Error in type StringType: test",
		);
	});

	it("tests invalid type value error", () => {
		expect(
			new InvalidTypeValueError(s.property.decimal().type, ["value"]).message,
		).toBe('Error in type DecimalType: ["value"] is an invalid value');
		expect(
			new InvalidTypeValueError(s.property.decimal().type, ["value"], "test")
				.message,
		).toBe("Error in type DecimalType: test");
	});
});
