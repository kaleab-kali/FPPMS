export const formatDate = (date: Date): string => {
	return date.toISOString().split("T")[0];
};

export const addDays = (date: Date, days: number): Date => {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
};

export const calculateAge = (birthDate: Date): number => {
	const today = new Date();
	const birth = new Date(birthDate);
	let age = today.getFullYear() - birth.getFullYear();
	const monthDiff = today.getMonth() - birth.getMonth();

	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
		age--;
	}

	return age;
};

export const calculateYearsOfService = (startDate: Date): number => {
	return calculateAge(startDate);
};

export const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
	const checkDate = new Date(date).getTime();
	return checkDate >= new Date(startDate).getTime() && checkDate <= new Date(endDate).getTime();
};
