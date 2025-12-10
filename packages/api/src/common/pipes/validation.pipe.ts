import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

@Injectable()
export class ValidationPipe implements PipeTransform<unknown> {
	async transform(value: unknown, { metatype }: ArgumentMetadata): Promise<unknown> {
		if (!metatype || !this.toValidate(metatype)) {
			return value;
		}

		const object = plainToInstance(metatype, value);
		const errors = await validate(object);

		if (errors.length > 0) {
			const messages = errors.map((error) => {
				const constraints = error.constraints || {};
				return Object.values(constraints).join(", ");
			});
			throw new BadRequestException(messages);
		}

		return value;
	}

	private toValidate(metatype: new (...args: unknown[]) => unknown): boolean {
		const types: Array<new (...args: unknown[]) => unknown> = [String, Boolean, Number, Array, Object];
		return !types.includes(metatype);
	}
}
