import { PrismaClient } from "@prisma/client";

const FEDERAL_PRISON_CENTERS = [
	{
		code: "HQ",
		name: "Federal Prison Administration HQ",
		nameAm: "የፌደራል እስር ቤቶች አስተዳደር ዋና መስሪያ ቤት",
		type: "HQ",
		regionCode: "AA",
		address: "Addis Ababa, Lideta Sub-City",
		phone: "+251-111-234567",
		email: "hq@fpc.gov.et",
	},
	{
		code: "KLT",
		name: "Kaliti Federal Prison",
		nameAm: "ቃሊቲ ፌደራል እስር ቤት",
		type: "CENTER",
		regionCode: "AA",
		address: "Addis Ababa, Akaki Kaliti Sub-City",
		phone: "+251-111-345678",
		email: "kaliti@fpc.gov.et",
	},
	{
		code: "ZWY",
		name: "Ziway Federal Prison",
		nameAm: "ዝዋይ ፌደራል እስር ቤት",
		type: "CENTER",
		regionCode: "OR",
		address: "Ziway Town, East Shewa Zone",
		phone: "+251-464-412345",
		email: "ziway@fpc.gov.et",
	},
	{
		code: "DRD",
		name: "Dire Dawa Federal Prison",
		nameAm: "ድሬ ዳዋ ፌደራል እስር ቤት",
		type: "CENTER",
		regionCode: "DD",
		address: "Dire Dawa City Administration",
		phone: "+251-251-112345",
		email: "diredawa@fpc.gov.et",
	},
	{
		code: "SRB",
		name: "Shewarobit Federal Prison",
		nameAm: "ሸዋሮቢት ፌደራል እስር ቤት",
		type: "CENTER",
		regionCode: "AM",
		address: "Shewarobit Town, North Shewa Zone",
		phone: "+251-331-112345",
		email: "shewarobit@fpc.gov.et",
	},
] as const;

export const seedCenters = async (prisma: PrismaClient, tenantId: string): Promise<void> => {
	const centerMap: Record<string, string> = {};

	for (const center of FEDERAL_PRISON_CENTERS) {
		const existing = await prisma.center.findFirst({
			where: { tenantId, code: center.code },
		});

		if (existing) {
			console.log(`Center ${center.code} already exists, skipping...`);
			centerMap[center.code] = existing.id;
			continue;
		}

		const region = await prisma.region.findFirst({
			where: { tenantId, code: center.regionCode },
		});

		if (!region) {
			console.log(`Region ${center.regionCode} not found for center ${center.code}, skipping...`);
			continue;
		}

		const hqCenter = center.code !== "HQ" ? centerMap.HQ : null;

		const created = await prisma.center.create({
			data: {
				tenantId,
				code: center.code,
				name: center.name,
				nameAm: center.nameAm,
				type: center.type,
				regionId: region.id,
				address: center.address,
				phone: center.phone,
				email: center.email,
				parentCenterId: hqCenter,
				isActive: true,
			},
		});

		centerMap[center.code] = created.id;
		console.log(`Created center: ${center.name} (${center.code})`);
	}
};
