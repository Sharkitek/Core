import {Type} from "./Type";
import {define, Definition} from "../PropertyDefinition";

/**
 * Type of any numeric value.
 */
export class NumericType extends Type<number, number>
{
	deserialize(value: number|null|undefined): number|null|undefined
	{
		return value;
	}

	serialize(value: number|null|undefined): number|null|undefined
	{
		return value;
	}
}

/**
 * New numeric property definition.
 */
export function numeric(): Definition<number, number>
{
	return define(new NumericType());
}
