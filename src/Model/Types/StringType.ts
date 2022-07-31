import {Type} from "./Type";

/**
 * Type of any string value.
 */
export class StringType extends Type<string, string>
{
	deserialize(value: string): string
	{
		return value;
	}

	serialize(value: string): string
	{
		return value;
	}
}

/**
 * Type of any string value.
 */
export const SString = new StringType();
