import {Type} from "./type";
import {define, Definition} from "../property-definition";
import {InvalidTypeValueError} from "../../errors";

/**
 * Type of dates.
 */
export class DateType extends Type<string, Date>
{
	deserialize(value: string|null|undefined): Date|null|undefined
	{
		if (value === undefined) return undefined;
		if (value === null) return null;

		return new Date(value);
	}

	serialize(value: Date|null|undefined): string|null|undefined
	{
		if (value === undefined) return undefined;
		if (value === null) return null;
		if (!(value instanceof Date)) throw new InvalidTypeValueError(this, value, "value must be a date");
		if (isNaN(value?.valueOf())) return value?.toString();

		return value?.toISOString();
	}

	hasChanged(originalValue: Date|null|undefined, currentValue: Date|null|undefined): boolean
	{
		if (originalValue instanceof Date && currentValue instanceof Date)
		{ // Compare dates.
			const originalTime = originalValue.getTime();
			const currentTime = currentValue.getTime();

			// The two values are not numbers, nothing has changed.
			if (isNaN(originalTime) && isNaN(currentTime)) return false;

			// Timestamps need to be exactly the same.
			return originalValue.getTime() !== currentValue.getTime();
		}
		else
			// Compare undefined or null values.
			return originalValue !== currentValue;
	}
}

/**
 * New date property definition.
 */
export function date(): Definition<string, Date>
{
	return define(new DateType());
}
