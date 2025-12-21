import { IsEnum, IsNotEmpty, IsString } from "class-validator";

export const USER_STATUS_VALUES = ["ACTIVE", "INACTIVE", "LOCKED", "PENDING", "TRANSFERRED", "TERMINATED"] as const;
export type UserStatusType = (typeof USER_STATUS_VALUES)[number];

export class ChangeUserStatusDto {
	@IsString()
	@IsNotEmpty()
	@IsEnum(USER_STATUS_VALUES)
	status: UserStatusType;

	@IsString()
	@IsNotEmpty()
	reason: string;
}
