import {Type} from "./type";
import {define, Definition} from "../property-definition";
import {InvalidTypeValueError} from "../../errors";

/**
 * Type of any numeric value.
 */
export class NumericType extends Type<number, number> {
	deserialize(value: number | null | undefined): number | null | undefined {
		if (value === undefined) return undefined;
		if (value === null) return null;

		if (typeof value !== "number")
			throw new InvalidTypeValueError(this, value, "value must be a number");

		return value;
	}

	serialize(value: number | null | undefined): number | null | undefined {
		if (value === undefined) return undefined;
		if (value === null) return null;

		if (typeof value !== "number")
			throw new InvalidTypeValueError(this, value, "value must be a number");

		return value;
	}
}

/**
 * New numeric property definition.
 */
export function numeric(): Definition<number, number> {
	return define(new NumericType());
}
