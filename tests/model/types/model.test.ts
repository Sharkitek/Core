import {describe, expect, test} from "vitest";
import {ModelType, s} from "../../../src/library";

class TestModel
{
	id: number;
	name: string;
	price: number;
}

describe("model type", () => {
	const testModel = s.defineModel({
		Class: TestModel,
		properties: {
			id: s.property.numeric(),
			name: s.property.string(),
			price: s.property.decimal(),
		},
		identifier: "id",
	});

	test("model type definition", () => {
		const modelType = s.property.model(testModel);
		expect(modelType.type).toBeInstanceOf(ModelType);
	});

	test("model type functions", () => {
		{ // Try to serialize / deserialize.
			const testModelInstance = testModel.model(Object.assign(new TestModel(), { id: 1, name: "test", price: 12.548777 })).instance;
			expect(s.property.model(testModel).type.serialize(testModelInstance)).toEqual({ id: 1, name: "test", price: "12.548777" });
			expect(testModel.model(
				s.property.model(testModel).type.deserialize({ id: 1, name: "test", price: "12.548777" })
			).getInstanceProperties()).toEqual(testModel.model(testModelInstance).getInstanceProperties());
		}

		{ // Try to serialize the difference.
			const testModelInstance = testModel.model(Object.assign(new TestModel(), { id: 1, name: "test", price: 12.548777 })).instance;
			testModelInstance.name = "new";
			expect(s.property.model(testModel).type.serializeDiff(testModelInstance)).toEqual({ id: 1, name: "new" });
		}

		expect(s.property.model(testModel).type.serialize(null)).toEqual(null);
		expect(s.property.model(testModel).type.deserialize(null)).toEqual(null);
		expect(s.property.model(testModel).type.serializeDiff(null)).toEqual(null);

		expect(s.property.model(testModel).type.serialize(undefined)).toEqual(undefined);
		expect(s.property.model(testModel).type.deserialize(undefined)).toEqual(undefined);
		expect(s.property.model(testModel).type.serializeDiff(undefined)).toEqual(undefined);

		{
			const testModelInstance = testModel.model(Object.assign(new TestModel(), { id: 1, name: "test", price: 12.548777 })).instance;
			expect(s.property.model(testModel).type.hasChanged(testModelInstance, testModelInstance)).toBeFalsy();
		}
		{
			const testModelInstance = testModel.model(Object.assign(new TestModel(), { id: 1, name: "test", price: 12.548777 })).instance;
			testModelInstance.price = 12.548778;
			expect(s.property.model(testModel).type.hasChanged(testModelInstance, testModelInstance)).toBeTruthy();
		}
		expect(s.property.model(testModel).type.hasChanged(null, null)).toBeFalsy();
		expect(s.property.model(testModel).type.hasChanged(undefined, undefined)).toBeFalsy();
		expect(s.property.model(testModel).type.hasChanged(null, undefined)).toBeTruthy();
		expect(s.property.model(testModel).type.hasChanged(undefined, null)).toBeTruthy();
		expect(s.property.model(testModel).type.hasChanged(null, testModel.model(Object.assign(new TestModel(), { id: 1, name: "test", price: 12.548777 })).instance)).toBeTruthy();
		expect(s.property.model(testModel).type.hasChanged(undefined, testModel.model(Object.assign(new TestModel(), { id: 1, name: "test", price: 12.548777 })).instance)).toBeTruthy();
		expect(s.property.model(testModel).type.hasChanged(testModel.model(Object.assign(new TestModel(), { id: 1, name: "test", price: 12.548777 })).instance, null)).toBeTruthy();
		expect(s.property.model(testModel).type.hasChanged(testModel.model(Object.assign(new TestModel(), { id: 1, name: "test", price: 12.548777 })).instance, undefined)).toBeTruthy();

		expect(s.property.model(testModel).type.serializedHasChanged(
			{ id: 1, name: "test", price: "12.548777" },
			{ id: 1, price: "12.548777", name: "test" },
		)).toBeFalsy();
		expect(s.property.model(testModel).type.serializedHasChanged(
			{ id: 1, name: "test", price: "12.548777" },
			{ id: 1, name: "test", price: "12.548778" },
		)).toBeTruthy();
		expect(s.property.model(testModel).type.serializedHasChanged(null, null)).toBeFalsy();
		expect(s.property.model(testModel).type.serializedHasChanged(undefined, undefined)).toBeFalsy();
		expect(s.property.model(testModel).type.serializedHasChanged(null, undefined)).toBeTruthy();
		expect(s.property.model(testModel).type.serializedHasChanged(undefined, null)).toBeTruthy();
		expect(s.property.model(testModel).type.serializedHasChanged(null, { id: 1, name: "test", price: "12.548777" })).toBeTruthy();
		expect(s.property.model(testModel).type.serializedHasChanged(undefined, { id: 1, name: "test", price: "12.548777" })).toBeTruthy();
		expect(s.property.model(testModel).type.serializedHasChanged({ id: 1, name: "test", price: "12.548777" }, null)).toBeTruthy();
		expect(s.property.model(testModel).type.serializedHasChanged({ id: 1, name: "test", price: "12.548777" }, undefined)).toBeTruthy();

		{ // Serializing the difference to check that the difference has been reset.
			const testModelInstance = testModel.model(Object.assign(new TestModel(), { id: 1, name: "test", price: 12.548777 })).instance;
			testModelInstance.price = 555.555;
			expect(testModel.model(testModelInstance).serializeDiff()).toEqual({ id: 1, price: "555.555" });
			s.property.model(testModel).type.resetDiff(testModelInstance);
			expect(testModel.model(testModelInstance).serializeDiff()).toEqual({ id: 1 });
		}

		s.property.model(testModel).type.resetDiff(undefined);
		s.property.model(testModel).type.resetDiff(null);

		{ // Test that values are cloned in a different model instance.
			const testModelInstance = testModel.model(Object.assign(new TestModel(), { id: 1, name: "test", price: 12.548777 })).instance;
			testModelInstance.price = 555.555;
			const clonedModelInstance = s.property.model(testModel).type.clone(testModelInstance);
			expect(clonedModelInstance).not.toBe(testModelInstance);
			expect(testModel.model(clonedModelInstance).getInstanceProperties()).toEqual(testModel.model(testModelInstance).getInstanceProperties());
			expect(testModel.model(clonedModelInstance).serializeDiff()).toEqual(testModel.model(testModelInstance).serializeDiff());
		}
		expect(s.property.model(testModel).type.clone(undefined)).toBe(undefined);
		expect(s.property.model(testModel).type.clone(null)).toBe(null);
	});
});
