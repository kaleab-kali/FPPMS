export const generateRandomString = (length: number): string => {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let result = "";
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
};

export const slugify = (text: string): string => {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "")
		.replace(/[\s_-]+/g, "-")
		.replace(/^-+|-+$/g, "");
};

export const capitalize = (text: string): string => {
	if (!text) return "";
	return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const capitalizeWords = (text: string): string => {
	return text
		.split(" ")
		.map((word) => capitalize(word))
		.join(" ");
};

export const truncate = (text: string, maxLength: number, suffix = "..."): string => {
	if (text.length <= maxLength) return text;
	return text.slice(0, maxLength - suffix.length) + suffix;
};

export const generateEmployeeId = (prefix: string, sequence: number): string => {
	return `${prefix}-${String(sequence).padStart(6, "0")}`;
};

export const maskString = (text: string, visibleChars = 4, maskChar = "*"): string => {
	if (text.length <= visibleChars) return text;
	const visiblePart = text.slice(-visibleChars);
	const maskedPart = maskChar.repeat(text.length - visibleChars);
	return maskedPart + visiblePart;
};
