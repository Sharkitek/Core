import {Type} from "./Type";
import {define, Definition} from "../PropertyDefinition";

/**
 * Type of dates.
 */
export class DateType extends Type<string, Date>
{
	deserialize(value: string|null|undefined): Date|null|undefined
	{
		if (value === undefined) return undefined;
		if (value === null) return null;

		return new Date(value);
	}

	serialize(value: Date|null|undefined): string|null|undefined
	{
		if (value === undefined) return undefined;
		if (value === null) return null;

		return value?.toISOString();
	}
}

/**
 * New date property definition.
 */
export function date(): Definition<string, Date>
{
	return define(new DateType());
}
