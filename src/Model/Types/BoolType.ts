import {Type} from "./Type";
import {define, Definition} from "../PropertyDefinition";

/**
 * Type of any boolean value.
 */
export class BoolType extends Type<boolean, boolean>
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
export function bool(): Definition<boolean, boolean>
{
	return define(new BoolType());
}
/**
 * New boolean property definition.
 * Alias of bool.
 */
export function boolean(): ReturnType<typeof bool>
{
	return bool();
}
