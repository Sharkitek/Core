import {Type} from "./Type";

/**
 * Type of any numeric value.
 */
export class NumericType extends Type<number, number>
{
	deserialize(value: number): number
	{
		return value;
	}

	serialize(value: number): number
	{
		return value;
	}
}

/**
 * Type of any numeric value.
 */
export const SNumeric = new NumericType();
