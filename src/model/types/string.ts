import {Type} from "./type";
import {define, Definition} from "../property-definition";

/**
 * Type of any string value.
 */
export class StringType extends Type<string, string>
{
	deserialize(value: string|null|undefined): string|null|undefined
	{
		if (value === undefined) return undefined;
		if (value === null) return null;

		return String(value);
	}

	serialize(value: string|null|undefined): string|null|undefined
	{
		if (value === undefined) return undefined;
		if (value === null) return null;

		return String(value);
	}
}

/**
 * New string property definition.
 */
export function string(): Definition<string, string>
{
	return define(new StringType());
}
