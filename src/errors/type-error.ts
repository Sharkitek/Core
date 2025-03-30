import {SharkitekError} from "./sharkitek-error";
import {Type} from "../model/types/type";

/**
 * A Sharkitek type error.
 */
export class TypeError<SerializedType, ModelType> extends SharkitekError
{
	constructor(public type: Type<SerializedType, ModelType>, message?: string)
	{
		super(`Error in type ${type.constructor.name}${message ? `: ${message}` : ""}`);
	}
}
