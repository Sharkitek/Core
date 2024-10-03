import {Type} from "./Type";
import {define, Definition} from "../PropertyDefinition";

/**
 * Type of any string value.
 */
export class StringType extends Type<string, string>
{
	deserialize(value: string|null|undefined): string|null|undefined
	{
		return value;
	}

	serialize(value: string|null|undefined): string|null|undefined
	{
		return value;
	}
}

/**
 * New string property definition.
 */
export function string(): Definition<string, string>
{
	return define(new StringType());
}
