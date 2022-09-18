import {Type} from "./Type";

/**
 * Type of dates.
 */
export class DateType extends Type<string, Date>
{
	deserialize(value: string): Date
	{
		return new Date(value);
	}

	serialize(value: Date): string
	{
		return value.toISOString();
	}
}

/**
 * Type of dates.
 */
export const SDate = new DateType();
