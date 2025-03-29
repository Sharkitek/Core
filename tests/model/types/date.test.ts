import {describe, expect, test} from "vitest";
import {DateType, s} from "../../../src/library";

describe("date type", () => {
	const testDate = new Date();

	test("date type definition", () => {
		const dateType = s.property.date();
		expect(dateType.type).toBeInstanceOf(DateType);
	});

	test("date type functions", () => {
		expect(s.property.date().type.serialize(testDate)).toBe(testDate.toISOString());
		expect(s.property.date().type.deserialize(testDate.toISOString())?.getTime()).toBe(testDate.getTime());
		expect(s.property.date().type.serializeDiff(new Date(testDate))).toBe(testDate.toISOString());
		expect(s.property.date().type.deserialize("2565152-2156121-256123121 5121544175:21515612").valueOf()).toBeNaN();
		expect(s.property.date().type.serialize(new Date(NaN))).toBe((new Date(NaN)).toString());

		expect(s.property.date().type.serialize(null)).toBe(null);
		expect(s.property.date().type.deserialize(null)).toBe(null);
		expect(s.property.date().type.serializeDiff(null)).toBe(null);

		expect(s.property.date().type.serialize(undefined)).toBe(undefined);
		expect(s.property.date().type.deserialize(undefined)).toBe(undefined);
		expect(s.property.date().type.serializeDiff(undefined)).toBe(undefined);

		expect(s.property.date().type.hasChanged(testDate, new Date(testDate))).toBeFalsy();
		expect(s.property.date().type.hasChanged(null, null)).toBeFalsy();
		expect(s.property.date().type.hasChanged(undefined, undefined)).toBeFalsy();
		expect(s.property.date().type.hasChanged(null, undefined)).toBeTruthy();
		expect(s.property.date().type.hasChanged(undefined, null)).toBeTruthy();
		expect(s.property.date().type.hasChanged(null, testDate)).toBeTruthy();
		expect(s.property.date().type.hasChanged(undefined, testDate)).toBeTruthy();
		expect(s.property.date().type.hasChanged(testDate, null)).toBeTruthy();
		expect(s.property.date().type.hasChanged(new Date(NaN), null)).toBeTruthy();
		expect(s.property.date().type.hasChanged(new Date(NaN), undefined)).toBeTruthy();
		expect(s.property.date().type.hasChanged(new Date(NaN), new Date(NaN))).toBeFalsy();

		expect(s.property.date().type.serializedHasChanged(testDate.toISOString(), (new Date(testDate)).toISOString())).toBeFalsy();
		expect(s.property.date().type.serializedHasChanged(null, null)).toBeFalsy();
		expect(s.property.date().type.serializedHasChanged(undefined, undefined)).toBeFalsy();
		expect(s.property.date().type.serializedHasChanged(null, undefined)).toBeTruthy();
		expect(s.property.date().type.serializedHasChanged(undefined, null)).toBeTruthy();
		expect(s.property.date().type.serializedHasChanged(null, testDate.toISOString())).toBeTruthy();
		expect(s.property.date().type.serializedHasChanged(undefined, testDate.toISOString())).toBeTruthy();
		expect(s.property.date().type.serializedHasChanged(testDate.toISOString(), null)).toBeTruthy();
		expect(s.property.date().type.serializedHasChanged((new Date(NaN)).toString(), null)).toBeTruthy();
		expect(s.property.date().type.serializedHasChanged((new Date(NaN)).toString(), undefined)).toBeTruthy();
		expect(s.property.date().type.serializedHasChanged((new Date(NaN)).toString(), (new Date(NaN)).toString())).toBeFalsy();

		s.property.date().type.resetDiff(testDate);
		s.property.date().type.resetDiff(undefined);
		s.property.date().type.resetDiff(null);

		{ // Test that the date is cloned in a different object.
			const propertyValue = new Date();
			const clonedPropertyValue = s.property.date().type.clone(propertyValue);
			expect(clonedPropertyValue).not.toBe(propertyValue);
			expect(clonedPropertyValue).toEqual(propertyValue);
		}
	});
});
