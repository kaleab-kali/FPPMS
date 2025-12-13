import React from "react";
import type { FieldError, FieldValues, Path, UseFormRegister } from "react-hook-form";
import { Input } from "#web/components/ui/input.tsx";
import { Label } from "#web/components/ui/label.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#web/components/ui/select.tsx";
import { cn } from "#web/lib/utils.ts";

interface FormFieldBaseProps {
	label: string;
	error?: FieldError;
	required?: boolean;
	className?: string;
}

interface FormInputFieldProps<T extends FieldValues> extends FormFieldBaseProps {
	type?: "text" | "email" | "tel" | "number" | "date";
	placeholder?: string;
	disabled?: boolean;
	register: UseFormRegister<T>;
	name: Path<T>;
}

interface FormSelectFieldProps extends FormFieldBaseProps {
	value: string;
	onValueChange: (value: string) => void;
	placeholder?: string;
	options: Array<{ value: string; label: string }>;
	disabled?: boolean;
}

const FormInputFieldInner = <T extends FieldValues>({
	label,
	error,
	required = false,
	className,
	type = "text",
	placeholder,
	disabled = false,
	register,
	name,
}: FormInputFieldProps<T>) => {
	const inputProps = type === "number" ? register(name, { valueAsNumber: true }) : register(name);

	return (
		<div className={cn("space-y-2", className)}>
			<Label htmlFor={name} className={cn(required && "after:content-['*'] after:ml-0.5 after:text-destructive")}>
				{label}
			</Label>
			<Input
				id={name}
				type={type}
				placeholder={placeholder}
				disabled={disabled}
				aria-invalid={!!error}
				className={cn(error && "border-destructive")}
				{...inputProps}
			/>
			{error && <p className="text-sm text-destructive">{error.message}</p>}
		</div>
	);
};

export const FormInputField = React.memo(FormInputFieldInner) as typeof FormInputFieldInner;

const NONE_VALUE = "__none__";

export const FormSelectField = React.memo(
	({
		label,
		error,
		required = false,
		className,
		value,
		onValueChange,
		placeholder,
		options,
		disabled = false,
	}: FormSelectFieldProps) => {
		const handleChange = React.useCallback(
			(newValue: string) => {
				onValueChange(newValue === NONE_VALUE ? "" : newValue);
			},
			[onValueChange],
		);

		return (
			<div className={cn("space-y-2", className)}>
				<Label className={cn(required && "after:content-['*'] after:ml-0.5 after:text-destructive")}>{label}</Label>
				<Select value={value || NONE_VALUE} onValueChange={handleChange} disabled={disabled}>
					<SelectTrigger className={cn("w-full", error && "border-destructive")}>
						<SelectValue placeholder={placeholder} />
					</SelectTrigger>
					<SelectContent>
						{!required && <SelectItem value={NONE_VALUE}>-</SelectItem>}
						{options.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{error && <p className="text-sm text-destructive">{error.message}</p>}
			</div>
		);
	},
	(prev, next) =>
		prev.label === next.label &&
		prev.value === next.value &&
		prev.error?.message === next.error?.message &&
		prev.disabled === next.disabled &&
		prev.options === next.options,
);

FormSelectField.displayName = "FormSelectField";
