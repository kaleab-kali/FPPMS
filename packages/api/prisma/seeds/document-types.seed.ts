import { type DocumentDirection, PrismaClient } from "@prisma/client";

interface DocumentTypeData {
	code: string;
	name: string;
	nameAm: string;
	direction: DocumentDirection;
	prefix: string;
}

const INCOMING_DOCUMENT_TYPES: DocumentTypeData[] = [
	{
		code: "LETTER_IN",
		name: "Incoming Letter",
		nameAm: "ገቢ ደብዳቤ",
		direction: "INCOMING",
		prefix: "LI",
	},
	{
		code: "REQUEST_IN",
		name: "Request",
		nameAm: "ጥያቄ",
		direction: "INCOMING",
		prefix: "RI",
	},
	{
		code: "COMPLAINT_DOC",
		name: "Complaint Document",
		nameAm: "የቅሬታ ሰነድ",
		direction: "INCOMING",
		prefix: "CD",
	},
	{
		code: "COURT_ORDER",
		name: "Court Order",
		nameAm: "የፍርድ ቤት ትእዛዝ",
		direction: "INCOMING",
		prefix: "CO",
	},
	{
		code: "MEMO_IN",
		name: "Incoming Memo",
		nameAm: "ገቢ ማስታወሻ",
		direction: "INCOMING",
		prefix: "MI",
	},
	{
		code: "REPORT_IN",
		name: "Incoming Report",
		nameAm: "ገቢ ሪፖርት",
		direction: "INCOMING",
		prefix: "RPI",
	},
	{
		code: "CIRCULAR_IN",
		name: "Incoming Circular",
		nameAm: "ገቢ ሰርኩላር",
		direction: "INCOMING",
		prefix: "CI",
	},
	{
		code: "INVOICE",
		name: "Invoice",
		nameAm: "ደረሰኝ",
		direction: "INCOMING",
		prefix: "INV",
	},
];

const OUTGOING_DOCUMENT_TYPES: DocumentTypeData[] = [
	{
		code: "LETTER_OUT",
		name: "Outgoing Letter",
		nameAm: "ወጪ ደብዳቤ",
		direction: "OUTGOING",
		prefix: "LO",
	},
	{
		code: "RESPONSE",
		name: "Response Letter",
		nameAm: "ምላሽ ደብዳቤ",
		direction: "OUTGOING",
		prefix: "RS",
	},
	{
		code: "MEMO_OUT",
		name: "Outgoing Memo",
		nameAm: "ወጪ ማስታወሻ",
		direction: "OUTGOING",
		prefix: "MO",
	},
	{
		code: "REPORT_OUT",
		name: "Outgoing Report",
		nameAm: "ወጪ ሪፖርት",
		direction: "OUTGOING",
		prefix: "RPO",
	},
	{
		code: "DIRECTIVE",
		name: "Directive",
		nameAm: "መመሪያ",
		direction: "OUTGOING",
		prefix: "DIR",
	},
	{
		code: "CERTIFICATE",
		name: "Certificate",
		nameAm: "የምስክር ወረቀት",
		direction: "OUTGOING",
		prefix: "CRT",
	},
	{
		code: "DECISION",
		name: "Decision Document",
		nameAm: "የውሳኔ ሰነድ",
		direction: "OUTGOING",
		prefix: "DEC",
	},
	{
		code: "CIRCULAR_OUT",
		name: "Outgoing Circular",
		nameAm: "ወጪ ሰርኩላር",
		direction: "OUTGOING",
		prefix: "CIR",
	},
];

const DOCUMENT_TYPES = [...INCOMING_DOCUMENT_TYPES, ...OUTGOING_DOCUMENT_TYPES];

export const seedDocumentTypes = async (prisma: PrismaClient, tenantId: string): Promise<void> => {
	console.log("Seeding document types...");

	for (const docType of DOCUMENT_TYPES) {
		const existing = await prisma.documentType.findFirst({
			where: { tenantId, code: docType.code },
		});

		if (existing) {
			console.log(`Document type ${docType.code} already exists, skipping...`);
			continue;
		}

		await prisma.documentType.create({
			data: {
				tenantId,
				code: docType.code,
				name: docType.name,
				nameAm: docType.nameAm,
				direction: docType.direction,
				prefix: docType.prefix,
				currentNumber: 0,
				isActive: true,
			},
		});

		console.log(`Created document type: ${docType.name} (${docType.code})`);
	}

	console.log("Document types seeding complete.");
};
