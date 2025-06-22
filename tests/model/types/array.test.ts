import {describe, expect, test} from "vitest";
import {ArrayType, InvalidTypeValueError, s} from "../../../src/library";

class TestModel
{
	id: number;
	name: string;
	price: number;
}

describe("array type", () => {
	const testModel = s.defineModel({
		Class: TestModel,
		properties: {
			id: s.property.numeric(),
			name: s.property.string(),
			price: s.property.decimal(),
		},
		identifier: "id",
	});

	test("array type definition", () => {
		const arrayType = s.property.array(s.property.model(testModel));
		expect(arrayType.type).toBeInstanceOf(ArrayType);
	});

	const testProperty = s.property.array(s.property.decimal());

	test("array type functions", () => {
		expect(testProperty.type.serialize([12.547, 8, -52.11])).toEqual(["12.547", "8", "-52.11"]);
		expect(testProperty.type.deserialize(["12.547", "8", "-52.11"])).toEqual([12.547, 8, -52.11]);

		{ // Try to serialize the difference of an array with one changed model.
			const propertyValue = [
				testModel.model(Object.assign(new TestModel(), { id: 1, name: "test", price: 22 })).instance,
				testModel.model(Object.assign(new TestModel(), { id: 2, name: "another", price: 12.55 })).instance,
			];
			propertyValue[0].name = "new";
			expect(s.property.array(s.property.model(testModel)).type.serializeDiff(propertyValue)).toEqual([
				{ id: 1, name: "new" },
				{ id: 2 },
			]);
		}

		expect(testProperty.type.serialize(null)).toBe(null);
		expect(testProperty.type.deserialize(null)).toBe(null);
		expect(testProperty.type.serializeDiff(null)).toBe(null);

		expect(testProperty.type.serialize(undefined)).toBe(undefined);
		expect(testProperty.type.deserialize(undefined)).toBe(undefined);
		expect(testProperty.type.serializeDiff(undefined)).toBe(undefined);

		expect(testProperty.type.hasChanged([12.547, 8, -52.11], [12.547, 8, -52.11])).toBeFalsy();
		expect(testProperty.type.hasChanged(null, null)).toBeFalsy();
		expect(testProperty.type.hasChanged(undefined, undefined)).toBeFalsy();
		expect(testProperty.type.hasChanged(null, undefined)).toBeTruthy();
		expect(testProperty.type.hasChanged(undefined, null)).toBeTruthy();
		expect(testProperty.type.hasChanged(null, [12.547, 8, -52.11])).toBeTruthy();
		expect(testProperty.type.hasChanged(undefined, [12.547, 8, -52.11])).toBeTruthy();
		expect(testProperty.type.hasChanged([12.547, 8, -52.11], null)).toBeTruthy();
		expect(testProperty.type.hasChanged([12.547, 8, -52.11], undefined)).toBeTruthy();
		expect(testProperty.type.hasChanged([12.547, 8, -52.11], [12.547, -52.11, 8])).toBeTruthy();
		expect(testProperty.type.hasChanged([12.547, -52.11, 8], [12.547, 8, -52.11])).toBeTruthy();
		expect(testProperty.type.hasChanged([12.547, 8, -52.11], [12.547, 8])).toBeTruthy();
		expect(testProperty.type.hasChanged([12.547, 8], [12.547, 8, -52.11])).toBeTruthy();

		expect(testProperty.type.serializedHasChanged(["12.547", "8", "-52.11"], ["12.547", "8", "-52.11"])).toBeFalsy();
		expect(testProperty.type.serializedHasChanged(null, null)).toBeFalsy();
		expect(testProperty.type.serializedHasChanged(undefined, undefined)).toBeFalsy();
		expect(testProperty.type.serializedHasChanged(null, undefined)).toBeTruthy();
		expect(testProperty.type.serializedHasChanged(undefined, null)).toBeTruthy();
		expect(testProperty.type.serializedHasChanged(null, ["12.547", "8", "-52.11"])).toBeTruthy();
		expect(testProperty.type.serializedHasChanged(undefined, ["12.547", "8", "-52.11"])).toBeTruthy();
		expect(testProperty.type.serializedHasChanged(["12.547", "8", "-52.11"], null)).toBeTruthy();
		expect(testProperty.type.serializedHasChanged(["12.547", "8", "-52.11"], undefined)).toBeTruthy();
		expect(testProperty.type.serializedHasChanged(["12.547", "8", "-52.11"], ["12.547", "-52.11", "8"])).toBeTruthy();
		expect(testProperty.type.serializedHasChanged(["12.547", "-52.11", "8"], ["12.547", "8", "-52.11"])).toBeTruthy();
		expect(testProperty.type.serializedHasChanged(["12.547", "8", "-52.11"], ["12.547", "8"])).toBeTruthy();
		expect(testProperty.type.serializedHasChanged(["12.547", "8"], ["12.547", "8", "-52.11"])).toBeTruthy();

		{ // Try to reset the difference of an array with one changed model.
			const propertyValue = [
				testModel.model(Object.assign(new TestModel(), { id: 1, name: "test", price: 22 })).instance,
				testModel.model(Object.assign(new TestModel(), { id: 2, name: "another", price: 12.55 })).instance,
			];
			propertyValue[0].name = "new";
			expect(s.property.array(s.property.model(testModel)).type.serializeDiff(propertyValue)).toEqual([
				{ id: 1, name: "new" },
				{ id: 2 },
			]);
			s.property.array(s.property.model(testModel)).type.resetDiff(propertyValue)
			expect(s.property.array(s.property.model(testModel)).type.serializeDiff(propertyValue)).toEqual([
				{ id: 1 },
				{ id: 2 },
			]);
		}
		testProperty.type.resetDiff(undefined);
		testProperty.type.resetDiff(null);

		{ // Test that values are cloned in a different array.
			const propertyValue = [12.547, 8, -52.11];
			const clonedPropertyValue = testProperty.type.clone(propertyValue);
			expect(clonedPropertyValue).not.toBe(propertyValue);
			expect(clonedPropertyValue).toEqual(propertyValue);
		}
		{ // Test that values are cloned recursively.
			const propertyValue = [
				testModel.model(Object.assign(new TestModel(), { id: 1, name: "test", price: 22 })).instance,
				testModel.model(Object.assign(new TestModel(), { id: 2, name: "another", price: 12.55 })).instance,
			];

			// The arrays are different.
			const clonedPropertyValue = s.property.array(s.property.model(testModel)).type.clone(propertyValue);
			expect(clonedPropertyValue).not.toBe(propertyValue);

			// Array values must be different objects but have the same values.
			expect(clonedPropertyValue[0]).not.toBe(propertyValue[0]);
			expect(clonedPropertyValue[1]).not.toBe(propertyValue[1]);
			expect(testModel.model(clonedPropertyValue[0]).getInstanceProperties()).toEqual(testModel.model(propertyValue[0]).getInstanceProperties());
			expect(testModel.model(clonedPropertyValue[1]).getInstanceProperties()).toEqual(testModel.model(propertyValue[1]).getInstanceProperties());
		}
		expect(testProperty.type.clone(undefined)).toBe(undefined);
		expect(testProperty.type.clone(null)).toBe(null);

		{ // Test simple patch.
			expect(
				testProperty.type.applyPatch([12.547, 8, -52.11], ["12.547", "444.34", "-52.11"], true)
			).toEqual([12.547, 444.34, -52.11]);
			expect(
				testProperty.type.applyPatch(undefined, ["12.547", "444.34", "-52.11"], false)
			).toEqual([12.547, 444.34, -52.11]);
			expect(
				testProperty.type.applyPatch(null, ["12.547", "444.34", "-52.11"], false)
			).toEqual([12.547, 444.34, -52.11]);
			expect(
				testProperty.type.applyPatch([12.547, 8, -52.11], undefined, false)
			).toBeUndefined();
			expect(
				testProperty.type.applyPatch([12.547, 8, -52.11], null, false)
			).toBeNull();
		}
		{ // Invalid patch.
			expect(
				() => testProperty.type.applyPatch([12.547, 8, -52.11], {} as any, false)
			).toThrow(InvalidTypeValueError);
		}
		{ // Test recursive patch.
			const propertyValue = [
				testModel.model(Object.assign(new TestModel(), { id: 1, name: "test", price: 22 })).instance,
				testModel.model(Object.assign(new TestModel(), { id: 2, name: "another", price: 12.55 })).instance,
			];

			const patched = s.property.array(s.property.model(testModel)).type.applyPatch(propertyValue, [{
				id: 1,
				name: "new",
			}, {
				id: 2,
				price: "13.65",
			}], true);

			// Check applied patch.
			expect(patched).toEqual([
				testModel.parse({ id: 1, name: "new", price: "22" }),
				testModel.parse({ id: 2, name: "another", price: "13.65" }),
			]);

			// Check that originals have been updated.
			expect(testModel.model(patched[0]).serializeDiff()).toEqual({ id: 1 });
			patched[0].name = "test";
			expect(testModel.model(patched[0]).serializeDiff()).toEqual({ id: 1, name: "test" });
			expect(testModel.model(patched[1]).serializeDiff()).toEqual({ id: 2 });
			patched[1].price = 12.55;
			expect(testModel.model(patched[1]).serializeDiff()).toEqual({ id: 2, price: "12.55" });
		}
		{ // Test recursive patch without originals update.-
			const propertyValue = [
				testModel.model(Object.assign(new TestModel(), { id: 1, name: "test", price: 22 })).instance,
				testModel.model(Object.assign(new TestModel(), { id: 2, name: "another", price: 12.55 })).instance,
			];

			const patched = s.property.array(s.property.model(testModel)).type.applyPatch(propertyValue, [{
				id: 1,
				name: "new",
			}, {
				id: 2,
				price: "13.65",
			}], false);

			// Check that originals haven't been updated.
			expect(testModel.model(patched[0]).serializeDiff()).toEqual({ id: 1, name: "new" });
			expect(testModel.model(patched[1]).serializeDiff()).toEqual({ id: 2, price: "13.65" });
		}
	});

	test("invalid parameters types", () => {
		expect(() => testProperty.type.serialize({} as any)).toThrowError(InvalidTypeValueError);
		expect(() => testProperty.type.deserialize({} as any)).toThrowError(InvalidTypeValueError);
		expect(() => testProperty.type.serializeDiff({} as any)).toThrowError(InvalidTypeValueError);
		expect(() => testProperty.type.resetDiff({} as any)).not.toThrow();
		expect(testProperty.type.hasChanged({} as any, {} as any)).toBeTruthy();
		expect(testProperty.type.hasChanged(false as any, false as any)).toBeFalsy();
		expect(testProperty.type.serializedHasChanged({} as any, {} as any)).toBeTruthy();
		expect(testProperty.type.serializedHasChanged(false as any, false as any)).toBeFalsy();
		expect(() => testProperty.type.clone({} as any)).toThrowError(InvalidTypeValueError);
	});
});
