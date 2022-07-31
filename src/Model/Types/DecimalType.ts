import {Type} from "./Type";

/**
 * Type of decimal numbers.
 */
export class DecimalType extends Type<string, number>
{
	deserialize(value: string): number
	{
		return parseFloat(value);
	}

	serialize(value: number): string
	{
		return value.toString();
	}
}

/**
 * Type of decimal numbers;
 */
export const SDecimal = new DecimalType();
