import {TypeError} from "./type-error";
import {Type} from "../model/types/type";

/**
 * A Sharkitek type error when the passed value is invalid.
 */
export class InvalidTypeValueError<SerializedType, ModelType> extends TypeError<
	SerializedType,
	ModelType
> {
	constructor(
		public type: Type<SerializedType, ModelType>,
		public value: any,
		message?: string,
	) {
		super(type, message ?? `${JSON.stringify(value)} is an invalid value`);
	}
}
