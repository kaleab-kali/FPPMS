export const BLOOD_TYPE_OPTIONS = [
	{ value: "A_POSITIVE", label: "A+" },
	{ value: "A_NEGATIVE", label: "A-" },
	{ value: "B_POSITIVE", label: "B+" },
	{ value: "B_NEGATIVE", label: "B-" },
	{ value: "AB_POSITIVE", label: "AB+" },
	{ value: "AB_NEGATIVE", label: "AB-" },
	{ value: "O_POSITIVE", label: "O+" },
	{ value: "O_NEGATIVE", label: "O-" },
] as const;

export const WORK_SCHEDULE_OPTIONS = [
	{ value: "REGULAR", label: "Regular" },
	{ value: "SHIFT_24", label: "24-Hour Shift" },
] as const;

export const SALARY_STEP_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
	value: String(i),
	label: `Step ${i}`,
}));

export const MARITAL_STATUS_OPTIONS = [
	{ value: "SINGLE", label: "Single" },
	{ value: "MARRIED", label: "Married" },
	{ value: "DIVORCED", label: "Divorced" },
	{ value: "WIDOWED", label: "Widowed" },
] as const;

export const GENDER_OPTIONS = [
	{ value: "MALE", label: "Male" },
	{ value: "FEMALE", label: "Female" },
] as const;

export const RELATIONSHIP_OPTIONS = [
	{ value: "SPOUSE", label: "Spouse" },
	{ value: "PARENT", label: "Parent" },
	{ value: "SIBLING", label: "Sibling" },
	{ value: "CHILD", label: "Child" },
	{ value: "FRIEND", label: "Friend" },
	{ value: "OTHER", label: "Other" },
] as const;
