import type { PrismaClient } from "@prisma/client";

const WEAPON_CATEGORIES = [
	{ code: "PISTOL", name: "Pistol", nameAm: "ሽጉጥ" },
	{ code: "RIFLE", name: "Rifle", nameAm: "ጠመንጃ" },
	{ code: "SHOTGUN", name: "Shotgun", nameAm: "ሾትጋን" },
	{ code: "SMG", name: "Submachine Gun", nameAm: "ሳብማሽን ጠመንጃ" },
	{ code: "LMG", name: "Light Machine Gun", nameAm: "ቀላል ማሽን ጠመንጃ" },
	{ code: "SNIPER", name: "Sniper Rifle", nameAm: "ስናይፐር ጠመንጃ" },
] as const;

const WEAPON_TYPES = [
	{ categoryCode: "PISTOL", code: "GLOCK19", name: "Glock 19", caliber: "9mm", manufacturer: "Glock" },
	{ categoryCode: "PISTOL", code: "GLOCK17", name: "Glock 17", caliber: "9mm", manufacturer: "Glock" },
	{ categoryCode: "PISTOL", code: "BERETTA92", name: "Beretta 92FS", caliber: "9mm", manufacturer: "Beretta" },
	{ categoryCode: "PISTOL", code: "SIG226", name: "SIG P226", caliber: "9mm", manufacturer: "SIG Sauer" },
	{ categoryCode: "RIFLE", code: "AK47", name: "AK-47", caliber: "7.62x39mm", manufacturer: "Various" },
	{ categoryCode: "RIFLE", code: "M4A1", name: "M4A1 Carbine", caliber: "5.56x45mm", manufacturer: "Colt" },
	{ categoryCode: "RIFLE", code: "M16A4", name: "M16A4", caliber: "5.56x45mm", manufacturer: "Colt" },
	{ categoryCode: "RIFLE", code: "G3", name: "G3 Battle Rifle", caliber: "7.62x51mm", manufacturer: "H&K" },
	{ categoryCode: "SHOTGUN", code: "MOSSBERG500", name: "Mossberg 500", caliber: "12 gauge", manufacturer: "Mossberg" },
	{
		categoryCode: "SHOTGUN",
		code: "REMINGTON870",
		name: "Remington 870",
		caliber: "12 gauge",
		manufacturer: "Remington",
	},
	{ categoryCode: "SMG", code: "MP5", name: "MP5", caliber: "9mm", manufacturer: "H&K" },
	{ categoryCode: "SMG", code: "UZI", name: "Uzi", caliber: "9mm", manufacturer: "IMI" },
	{ categoryCode: "LMG", code: "M249", name: "M249 SAW", caliber: "5.56x45mm", manufacturer: "FN" },
	{ categoryCode: "LMG", code: "PKM", name: "PKM", caliber: "7.62x54mm", manufacturer: "Various" },
	{ categoryCode: "SNIPER", code: "M24", name: "M24 SWS", caliber: "7.62x51mm", manufacturer: "Remington" },
	{ categoryCode: "SNIPER", code: "SVD", name: "SVD Dragunov", caliber: "7.62x54mm", manufacturer: "Various" },
] as const;

const AMMUNITION_TYPES = [
	{ code: "9MM_FMJ", name: "9mm FMJ", caliber: "9mm", manufacturer: "Various" },
	{ code: "9MM_HP", name: "9mm Hollow Point", caliber: "9mm", manufacturer: "Various" },
	{ code: "762X39_FMJ", name: "7.62x39mm FMJ", caliber: "7.62x39mm", manufacturer: "Various" },
	{ code: "556X45_FMJ", name: "5.56x45mm FMJ", caliber: "5.56x45mm", manufacturer: "Various" },
	{ code: "556X45_HP", name: "5.56x45mm HP", caliber: "5.56x45mm", manufacturer: "Various" },
	{ code: "762X51_FMJ", name: "7.62x51mm FMJ", caliber: "7.62x51mm", manufacturer: "Various" },
	{ code: "762X54_FMJ", name: "7.62x54mm FMJ", caliber: "7.62x54mm", manufacturer: "Various" },
	{ code: "12GA_BUCK", name: "12 Gauge Buckshot", caliber: "12 gauge", manufacturer: "Various" },
	{ code: "12GA_SLUG", name: "12 Gauge Slug", caliber: "12 gauge", manufacturer: "Various" },
] as const;

export const seedWeapons = async (prisma: PrismaClient, tenantId: string): Promise<void> => {
	console.log("Seeding weapon categories...");

	const categoryMap = new Map<string, string>();

	for (const category of WEAPON_CATEGORIES) {
		const created = await prisma.weaponCategory.upsert({
			where: { tenantId_code: { tenantId, code: category.code } },
			update: { name: category.name, nameAm: category.nameAm },
			create: {
				tenantId,
				code: category.code,
				name: category.name,
				nameAm: category.nameAm,
			},
		});
		categoryMap.set(category.code, created.id);
	}

	console.log(`Created ${WEAPON_CATEGORIES.length} weapon categories`);

	console.log("Seeding weapon types...");

	for (const weaponType of WEAPON_TYPES) {
		const categoryId = categoryMap.get(weaponType.categoryCode);
		if (!categoryId) continue;

		await prisma.weaponType.upsert({
			where: { tenantId_code: { tenantId, code: weaponType.code } },
			update: {
				name: weaponType.name,
				caliber: weaponType.caliber,
				manufacturer: weaponType.manufacturer,
			},
			create: {
				tenantId,
				categoryId,
				code: weaponType.code,
				name: weaponType.name,
				caliber: weaponType.caliber,
				manufacturer: weaponType.manufacturer,
			},
		});
	}

	console.log(`Created ${WEAPON_TYPES.length} weapon types`);

	console.log("Seeding ammunition types...");

	for (const ammoType of AMMUNITION_TYPES) {
		await prisma.ammunitionType.upsert({
			where: { tenantId_code: { tenantId, code: ammoType.code } },
			update: {
				name: ammoType.name,
				caliber: ammoType.caliber,
				manufacturer: ammoType.manufacturer,
			},
			create: {
				tenantId,
				code: ammoType.code,
				name: ammoType.name,
				caliber: ammoType.caliber,
				manufacturer: ammoType.manufacturer,
			},
		});
	}

	console.log(`Created ${AMMUNITION_TYPES.length} ammunition types`);
};
