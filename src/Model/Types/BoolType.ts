import {Type} from "./Type";

/**
 * Type of any boolean value.
 */
export class BoolType extends Type<boolean, boolean>
{
	deserialize(value: boolean): boolean
	{
		return !!value; // ensure bool type.
	}

	serialize(value: boolean): boolean
	{
		return !!value; // ensure bool type.
	}
}

/**
 * Type of any boolean value.
 */
export const SBool = new BoolType();
