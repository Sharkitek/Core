import {Type} from "./Type";
import {define, Definition} from "../PropertyDefinition";

/**
 * Type of decimal numbers.
 */
export class DecimalType extends Type<string, number>
{
	deserialize(value: string|null|undefined): number|null|undefined
	{
		if (value === undefined) return undefined;
		if (value === null) return null;

		return parseFloat(value);
	}

	serialize(value: number|null|undefined): string|null|undefined
	{
		if (value === undefined) return undefined;
		if (value === null) return null;

		return value?.toString();
	}
}

/**
 * New decimal property definition.
 */
export function decimal(): Definition<string, number>
{
	return define(new DecimalType());
}
