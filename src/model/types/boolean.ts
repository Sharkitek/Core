import {Type} from "./type";
import {define, Definition} from "../property-definition";

/**
 * Type of any boolean value.
 */
export class BooleanType extends Type<boolean, boolean>
{
	deserialize(value: boolean|null|undefined): boolean|null|undefined
	{
		// Keep NULL and undefined values.
		if (value === undefined) return undefined;
		if (value === null) return null;

		return !!value; // ensure bool type.
	}

	serialize(value: boolean|null|undefined): boolean|null|undefined
	{
		// Keep NULL and undefined values.
		if (value === undefined) return undefined;
		if (value === null) return null;

		return !!value; // ensure bool type.
	}
}

/**
 * New boolean property definition.
 */
export function boolean(): Definition<boolean, boolean>
{
	return define(new BooleanType());
}
/**
 * New boolean property definition.
 * Alias of boolean.
 */
export function bool(): ReturnType<typeof boolean>
{
	return boolean();
}
