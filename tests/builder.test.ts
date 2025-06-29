import {describe, expect, test} from "vitest";

import {defineModel, newModel, s} from "../src/library";

class Testest {
	foo: string;
	bar: number;
	baz: boolean;
}

describe("model builder", () => {
	const modelBuilder = newModel(Testest)
		.property("foo", s.property.string())
		.property("bar", s.property.decimal())
		.property("baz", s.property.boolean())
		.identifier("foo");

	test("build model definition", () => {
		expect(modelBuilder.definition).toStrictEqual({
			Class: Testest,
			identifier: "foo",
			properties: {
				foo: s.property.string(),
				bar: s.property.decimal(),
				baz: s.property.boolean(),
			},
		});
	});

	test("build a model", () => {
		expect(modelBuilder.define()).toStrictEqual(
			defineModel(modelBuilder.definition),
		);
	});
});
