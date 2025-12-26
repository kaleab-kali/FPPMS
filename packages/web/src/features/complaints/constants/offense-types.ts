/**
 * Offense Types for Ethiopian Prison Personnel Complaint Management
 *
 * Based on Ethiopian Prison Personnel Law:
 * - Article 30: Minor Offenses (46 types) - Handled at Center level
 * - Article 31: Serious Offenses (32 types) - Handled by HQ Committee
 *
 * Punishment Scale (Article 30):
 * - Percentages represent salary deduction from monthly salary
 * - 100% = one month salary deduction
 * - "ESCALATE" = case escalates to Article 31
 *
 * Decision Authority (Article 30):
 * - Severity Levels 1-4: Direct Superior decides
 * - Severity Levels 5-7: Discipline Committee decides
 */

export type PunishmentValue = number | "WARNING" | "ESCALATE" | null;

export type DecisionAuthority = "DIRECT_SUPERIOR" | "DISCIPLINE_COMMITTEE";

export interface PunishmentScale {
	first: PunishmentValue;
	second: PunishmentValue;
	third: PunishmentValue;
	fourth: PunishmentValue;
	fifth: PunishmentValue;
	sixth: PunishmentValue;
}

export interface OffenseType {
	code: string;
	article: "ARTICLE_30" | "ARTICLE_31";
	severityLevel: number | null; // 1-7 for Article 30, null for Article 31
	name: string;
	nameAm: string;
	description?: string;
	descriptionAm?: string;
	punishmentScale: PunishmentScale | null; // null for Article 31
	decisionAuthority: DecisionAuthority | null; // Based on severity level for Article 30, null for Article 31
	canEscalate: boolean; // Whether this offense can escalate to Article 31
}

// Severity Level to Decision Authority mapping
const SEVERITY_TO_AUTHORITY: Record<number, DecisionAuthority> = {
	1: "DIRECT_SUPERIOR",
	2: "DIRECT_SUPERIOR",
	3: "DIRECT_SUPERIOR",
	4: "DIRECT_SUPERIOR",
	5: "DISCIPLINE_COMMITTEE",
	6: "DISCIPLINE_COMMITTEE",
	7: "DISCIPLINE_COMMITTEE",
} as const;

/**
 * Article 30 - Minor Offenses (46 types)
 *
 * Severity Levels:
 * - Level 1 (Mildest): WARNING -> 3% -> 5% -> 7%
 * - Level 2: 3% -> 5% -> 7% -> 10%
 * - Level 3: 5% -> 7% -> 10% -> 15% -> 20%
 * - Level 4: 10% -> 15% -> 20% -> 30% -> 50%
 * - Level 5: 15% -> 20% -> 30% -> 50% -> 100% -> ESCALATE
 * - Level 6: 20% -> 30% -> 50% -> 100% -> ESCALATE
 * - Level 7 (Severe): 30% -> 50% -> 100% -> ESCALATE
 */
const ARTICLE_30_OFFENSES: OffenseType[] = [
	// Level 1 - Mildest (7 offenses, items 1-7)
	{
		code: "ART30-001",
		article: "ARTICLE_30",
		severityLevel: 1,
		name: "Failure to wear proper uniform",
		nameAm: "ትክክለኛ ዩኒፎርም አለመልበስ",
		punishmentScale: { first: "WARNING", second: 3, third: 5, fourth: 7, fifth: null, sixth: null },
		decisionAuthority: "DIRECT_SUPERIOR",
		canEscalate: false,
	},
	{
		code: "ART30-002",
		article: "ARTICLE_30",
		severityLevel: 1,
		name: "Absence from workplace without permission",
		nameAm: "ያለፈቃድ ከስራ ቦታ መቅረት",
		punishmentScale: { first: "WARNING", second: 3, third: 5, fourth: 7, fifth: null, sixth: null },
		decisionAuthority: "DIRECT_SUPERIOR",
		canEscalate: false,
	},
	{
		code: "ART30-003",
		article: "ARTICLE_30",
		severityLevel: 1,
		name: "Late arrival to work",
		nameAm: "ወደ ስራ ቦታ ዘግይቶ መድረስ",
		punishmentScale: { first: "WARNING", second: 3, third: 5, fourth: 7, fifth: null, sixth: null },
		decisionAuthority: "DIRECT_SUPERIOR",
		canEscalate: false,
	},
	{
		code: "ART30-004",
		article: "ARTICLE_30",
		severityLevel: 1,
		name: "Improper grooming or hygiene",
		nameAm: "ተገቢ ያልሆነ አለባበስ ወይም ንጽሕና",
		punishmentScale: { first: "WARNING", second: 3, third: 5, fourth: 7, fifth: null, sixth: null },
		decisionAuthority: "DIRECT_SUPERIOR",
		canEscalate: false,
	},
	{
		code: "ART30-005",
		article: "ARTICLE_30",
		severityLevel: 1,
		name: "Failure to maintain clean workspace",
		nameAm: "የስራ ቦታን ንጹህ አለማድረግ",
		punishmentScale: { first: "WARNING", second: 3, third: 5, fourth: 7, fifth: null, sixth: null },
		decisionAuthority: "DIRECT_SUPERIOR",
		canEscalate: false,
	},
	{
		code: "ART30-006",
		article: "ARTICLE_30",
		severityLevel: 1,
		name: "Using mobile phone during duty hours",
		nameAm: "በስራ ሰዓት ሞባይል ስልክ መጠቀም",
		punishmentScale: { first: "WARNING", second: 3, third: 5, fourth: 7, fifth: null, sixth: null },
		decisionAuthority: "DIRECT_SUPERIOR",
		canEscalate: false,
	},
	{
		code: "ART30-007",
		article: "ARTICLE_30",
		severityLevel: 1,
		name: "Minor insubordination",
		nameAm: "ቀላል ትዕዛዝ አለመቀበል",
		punishmentScale: { first: "WARNING", second: 3, third: 5, fourth: 7, fifth: null, sixth: null },
		decisionAuthority: "DIRECT_SUPERIOR",
		canEscalate: false,
	},

	// Level 2 (3 offenses, items 8-10)
	{
		code: "ART30-008",
		article: "ARTICLE_30",
		severityLevel: 2,
		name: "Unauthorized absence (1-5 days)",
		nameAm: "ያልተፈቀደ መቅረት (1-5 ቀናት)",
		punishmentScale: { first: 3, second: 5, third: 7, fourth: 10, fifth: null, sixth: null },
		decisionAuthority: "DIRECT_SUPERIOR",
		canEscalate: false,
	},
	{
		code: "ART30-009",
		article: "ARTICLE_30",
		severityLevel: 2,
		name: "Negligence in duty",
		nameAm: "በስራ ላይ ቸልተኝነት",
		punishmentScale: { first: 3, second: 5, third: 7, fourth: 10, fifth: null, sixth: null },
		decisionAuthority: "DIRECT_SUPERIOR",
		canEscalate: false,
	},
	{
		code: "ART30-010",
		article: "ARTICLE_30",
		severityLevel: 2,
		name: "Failure to report incidents",
		nameAm: "ክስተቶችን አለማሳወቅ",
		punishmentScale: { first: 3, second: 5, third: 7, fourth: 10, fifth: null, sixth: null },
		decisionAuthority: "DIRECT_SUPERIOR",
		canEscalate: false,
	},

	// Level 3 (2 offenses, items 11-12)
	{
		code: "ART30-011",
		article: "ARTICLE_30",
		severityLevel: 3,
		name: "Unauthorized absence (6-10 days)",
		nameAm: "ያልተፈቀደ መቅረት (6-10 ቀናት)",
		punishmentScale: { first: 5, second: 7, third: 10, fourth: 15, fifth: 20, sixth: null },
		decisionAuthority: "DIRECT_SUPERIOR",
		canEscalate: false,
	},
	{
		code: "ART30-012",
		article: "ARTICLE_30",
		severityLevel: 3,
		name: "Unauthorized absence (10-20 days)",
		nameAm: "ያልተፈቀደ መቅረት (10-20 ቀናት)",
		punishmentScale: { first: 5, second: 7, third: 10, fourth: 15, fifth: 20, sixth: null },
		decisionAuthority: "DIRECT_SUPERIOR",
		canEscalate: false,
	},

	// Level 4 (8 offenses, items 14-21)
	{
		code: "ART30-014",
		article: "ARTICLE_30",
		severityLevel: 4,
		name: "Improper handling of government property",
		nameAm: "የመንግስት ንብረትን በአግባቡ አለመያዝ",
		punishmentScale: { first: 10, second: 15, third: 20, fourth: 30, fifth: 50, sixth: null },
		decisionAuthority: "DIRECT_SUPERIOR",
		canEscalate: false,
	},
	{
		code: "ART30-015",
		article: "ARTICLE_30",
		severityLevel: 4,
		name: "Disrespectful behavior towards superiors",
		nameAm: "ለበላይ አለቆች ያለመከበር ባህሪ",
		punishmentScale: { first: 10, second: 15, third: 20, fourth: 30, fifth: 50, sixth: null },
		decisionAuthority: "DIRECT_SUPERIOR",
		canEscalate: false,
	},
	{
		code: "ART30-016",
		article: "ARTICLE_30",
		severityLevel: 4,
		name: "Failure to follow proper procedures",
		nameAm: "ተገቢ ሂደቶችን አለመከተል",
		punishmentScale: { first: 10, second: 15, third: 20, fourth: 30, fifth: 50, sixth: null },
		decisionAuthority: "DIRECT_SUPERIOR",
		canEscalate: false,
	},
	{
		code: "ART30-017",
		article: "ARTICLE_30",
		severityLevel: 4,
		name: "Spreading false information",
		nameAm: "ሀሰተኛ መረጃ ማሰራጨት",
		punishmentScale: { first: 10, second: 15, third: 20, fourth: 30, fifth: 50, sixth: null },
		decisionAuthority: "DIRECT_SUPERIOR",
		canEscalate: false,
	},
	{
		code: "ART30-018",
		article: "ARTICLE_30",
		severityLevel: 4,
		name: "Failure to properly secure premises",
		nameAm: "ቅጥር ግቢውን በትክክል አለመጠበቅ",
		punishmentScale: { first: 10, second: 15, third: 20, fourth: 30, fifth: 50, sixth: null },
		decisionAuthority: "DIRECT_SUPERIOR",
		canEscalate: false,
	},
	{
		code: "ART30-019",
		article: "ARTICLE_30",
		severityLevel: 4,
		name: "Unauthorized use of official resources",
		nameAm: "ይፋዊ ሀብቶችን ያለፈቃድ መጠቀም",
		punishmentScale: { first: 10, second: 15, third: 20, fourth: 30, fifth: 50, sixth: null },
		decisionAuthority: "DIRECT_SUPERIOR",
		canEscalate: false,
	},
	{
		code: "ART30-020",
		article: "ARTICLE_30",
		severityLevel: 4,
		name: "Failure to maintain confidentiality",
		nameAm: "ምስጢራዊነትን አለመጠበቅ",
		punishmentScale: { first: 10, second: 15, third: 20, fourth: 30, fifth: 50, sixth: null },
		decisionAuthority: "DIRECT_SUPERIOR",
		canEscalate: false,
	},
	{
		code: "ART30-021",
		article: "ARTICLE_30",
		severityLevel: 4,
		name: "Violation of work safety rules",
		nameAm: "የስራ ደህንነት ደንቦችን መጣስ",
		punishmentScale: { first: 10, second: 15, third: 20, fourth: 30, fifth: 50, sixth: null },
		decisionAuthority: "DIRECT_SUPERIOR",
		canEscalate: false,
	},

	// Level 5 (10 offenses, items 22-31)
	{
		code: "ART30-022",
		article: "ARTICLE_30",
		severityLevel: 5,
		name: "Sleeping on duty",
		nameAm: "በስራ ላይ መተኛት",
		punishmentScale: { first: 15, second: 20, third: 30, fourth: 50, fifth: 100, sixth: "ESCALATE" },
		decisionAuthority: "DISCIPLINE_COMMITTEE",
		canEscalate: true,
	},
	{
		code: "ART30-023",
		article: "ARTICLE_30",
		severityLevel: 5,
		name: "Unauthorized entry to restricted areas",
		nameAm: "ወደ ተከለከሉ ቦታዎች ያለፈቃድ መግባት",
		punishmentScale: { first: 15, second: 20, third: 30, fourth: 50, fifth: 100, sixth: "ESCALATE" },
		decisionAuthority: "DISCIPLINE_COMMITTEE",
		canEscalate: true,
	},
	{
		code: "ART30-024",
		article: "ARTICLE_30",
		severityLevel: 5,
		name: "Unauthorized contact with prisoners",
		nameAm: "ከእስረኞች ጋር ያልተፈቀደ ግንኙነት",
		punishmentScale: { first: 15, second: 20, third: 30, fourth: 50, fifth: 100, sixth: "ESCALATE" },
		decisionAuthority: "DISCIPLINE_COMMITTEE",
		canEscalate: true,
	},
	{
		code: "ART30-025",
		article: "ARTICLE_30",
		severityLevel: 5,
		name: "Bringing unauthorized items to facility",
		nameAm: "ያልተፈቀዱ ዕቃዎችን ወደ ተቋም ማምጣት",
		punishmentScale: { first: 15, second: 20, third: 30, fourth: 50, fifth: 100, sixth: "ESCALATE" },
		decisionAuthority: "DISCIPLINE_COMMITTEE",
		canEscalate: true,
	},
	{
		code: "ART30-026",
		article: "ARTICLE_30",
		severityLevel: 5,
		name: "Abuse of authority",
		nameAm: "ስልጣንን አላግባብ መጠቀም",
		punishmentScale: { first: 15, second: 20, third: 30, fourth: 50, fifth: 100, sixth: "ESCALATE" },
		decisionAuthority: "DISCIPLINE_COMMITTEE",
		canEscalate: true,
	},
	{
		code: "ART30-027",
		article: "ARTICLE_30",
		severityLevel: 5,
		name: "Harassment of colleagues",
		nameAm: "የስራ ባልደረቦችን ማስጨነቅ",
		punishmentScale: { first: 15, second: 20, third: 30, fourth: 50, fifth: 100, sixth: "ESCALATE" },
		decisionAuthority: "DISCIPLINE_COMMITTEE",
		canEscalate: true,
	},
	{
		code: "ART30-028",
		article: "ARTICLE_30",
		severityLevel: 5,
		name: "Falsification of minor records",
		nameAm: "ቀላል መዝገቦችን ማጭበርበር",
		punishmentScale: { first: 15, second: 20, third: 30, fourth: 50, fifth: 100, sixth: "ESCALATE" },
		decisionAuthority: "DISCIPLINE_COMMITTEE",
		canEscalate: true,
	},
	{
		code: "ART30-029",
		article: "ARTICLE_30",
		severityLevel: 5,
		name: "Failure to report colleague misconduct",
		nameAm: "የባልደረባ ጥፋት አለማሳወቅ",
		punishmentScale: { first: 15, second: 20, third: 30, fourth: 50, fifth: 100, sixth: "ESCALATE" },
		decisionAuthority: "DISCIPLINE_COMMITTEE",
		canEscalate: true,
	},
	{
		code: "ART30-030",
		article: "ARTICLE_30",
		severityLevel: 5,
		name: "Improper use of force",
		nameAm: "ኃይልን በአግባቡ አለመጠቀም",
		punishmentScale: { first: 15, second: 20, third: 30, fourth: 50, fifth: 100, sixth: "ESCALATE" },
		decisionAuthority: "DISCIPLINE_COMMITTEE",
		canEscalate: true,
	},
	{
		code: "ART30-031",
		article: "ARTICLE_30",
		severityLevel: 5,
		name: "Interference with investigations",
		nameAm: "በምርመራዎች ውስጥ ጣልቃ መግባት",
		punishmentScale: { first: 15, second: 20, third: 30, fourth: 50, fifth: 100, sixth: "ESCALATE" },
		decisionAuthority: "DISCIPLINE_COMMITTEE",
		canEscalate: true,
	},

	// Level 6 (11 offenses, items 32-42)
	{
		code: "ART30-032",
		article: "ARTICLE_30",
		severityLevel: 6,
		name: "Unauthorized absence exceeding 10 days",
		nameAm: "ከ10 ቀናት በላይ ያልተፈቀደ መቅረት",
		punishmentScale: { first: 20, second: 30, third: 50, fourth: 100, fifth: "ESCALATE", sixth: null },
		decisionAuthority: "DISCIPLINE_COMMITTEE",
		canEscalate: true,
	},
	{
		code: "ART30-033",
		article: "ARTICLE_30",
		severityLevel: 6,
		name: "Threatening colleagues or subordinates",
		nameAm: "ባልደረቦችን ወይም ተገዢዎችን ማስፈራራት",
		punishmentScale: { first: 20, second: 30, third: 50, fourth: 100, fifth: "ESCALATE", sixth: null },
		decisionAuthority: "DISCIPLINE_COMMITTEE",
		canEscalate: true,
	},
	{
		code: "ART30-034",
		article: "ARTICLE_30",
		severityLevel: 6,
		name: "Intoxication on duty",
		nameAm: "በስራ ላይ መስከር",
		punishmentScale: { first: 20, second: 30, third: 50, fourth: 100, fifth: "ESCALATE", sixth: null },
		decisionAuthority: "DISCIPLINE_COMMITTEE",
		canEscalate: true,
	},
	{
		code: "ART30-035",
		article: "ARTICLE_30",
		severityLevel: 6,
		name: "Gambling on facility premises",
		nameAm: "በተቋሙ ቅጥር ግቢ ውስጥ ቁማር መጫወት",
		punishmentScale: { first: 20, second: 30, third: 50, fourth: 100, fifth: "ESCALATE", sixth: null },
		decisionAuthority: "DISCIPLINE_COMMITTEE",
		canEscalate: true,
	},
	{
		code: "ART30-036",
		article: "ARTICLE_30",
		severityLevel: 6,
		name: "Damage to government property",
		nameAm: "የመንግስት ንብረት ማበላሸት",
		punishmentScale: { first: 20, second: 30, third: 50, fourth: 100, fifth: "ESCALATE", sixth: null },
		decisionAuthority: "DISCIPLINE_COMMITTEE",
		canEscalate: true,
	},
	{
		code: "ART30-037",
		article: "ARTICLE_30",
		severityLevel: 6,
		name: "Dereliction of security duty",
		nameAm: "የጥበቃ ግዴታን መተው",
		punishmentScale: { first: 20, second: 30, third: 50, fourth: 100, fifth: "ESCALATE", sixth: null },
		decisionAuthority: "DISCIPLINE_COMMITTEE",
		canEscalate: true,
	},
	{
		code: "ART30-038",
		article: "ARTICLE_30",
		severityLevel: 6,
		name: "Unauthorized possession of contraband",
		nameAm: "የተከለከሉ ዕቃዎችን ያለፈቃድ መያዝ",
		punishmentScale: { first: 20, second: 30, third: 50, fourth: 100, fifth: "ESCALATE", sixth: null },
		decisionAuthority: "DISCIPLINE_COMMITTEE",
		canEscalate: true,
	},
	{
		code: "ART30-039",
		article: "ARTICLE_30",
		severityLevel: 6,
		name: "Accepting gifts from prisoners or visitors",
		nameAm: "ከእስረኞች ወይም ጎብኝዎች ስጦታ መቀበል",
		punishmentScale: { first: 20, second: 30, third: 50, fourth: 100, fifth: "ESCALATE", sixth: null },
		decisionAuthority: "DISCIPLINE_COMMITTEE",
		canEscalate: true,
	},
	{
		code: "ART30-040",
		article: "ARTICLE_30",
		severityLevel: 6,
		name: "Participating in unauthorized activities",
		nameAm: "ባልተፈቀዱ እንቅስቃሴዎች ውስጥ መሳተፍ",
		punishmentScale: { first: 20, second: 30, third: 50, fourth: 100, fifth: "ESCALATE", sixth: null },
		decisionAuthority: "DISCIPLINE_COMMITTEE",
		canEscalate: true,
	},
	{
		code: "ART30-041",
		article: "ARTICLE_30",
		severityLevel: 6,
		name: "Releasing confidential information",
		nameAm: "ሚስጥራዊ መረጃ ማውጣት",
		punishmentScale: { first: 20, second: 30, third: 50, fourth: 100, fifth: "ESCALATE", sixth: null },
		decisionAuthority: "DISCIPLINE_COMMITTEE",
		canEscalate: true,
	},
	{
		code: "ART30-042",
		article: "ARTICLE_30",
		severityLevel: 6,
		name: "Insubordination with consequences",
		nameAm: "መዘዝ ያለው ትዕዛዝ አለመቀበል",
		punishmentScale: { first: 20, second: 30, third: 50, fourth: 100, fifth: "ESCALATE", sixth: null },
		decisionAuthority: "DISCIPLINE_COMMITTEE",
		canEscalate: true,
	},

	// Level 7 - Most Severe Article 30 (4 offenses, items 43-46)
	{
		code: "ART30-043",
		article: "ARTICLE_30",
		severityLevel: 7,
		name: "Negligence leading to escape attempt",
		nameAm: "ወደ ማምለጫ ሙከራ የሚያመራ ቸልተኝነት",
		punishmentScale: { first: 30, second: 50, third: 100, fourth: "ESCALATE", fifth: null, sixth: null },
		decisionAuthority: "DISCIPLINE_COMMITTEE",
		canEscalate: true,
	},
	{
		code: "ART30-044",
		article: "ARTICLE_30",
		severityLevel: 7,
		name: "Serious misconduct with prisoners",
		nameAm: "ከእስረኞች ጋር ከባድ ጥፋት",
		punishmentScale: { first: 30, second: 50, third: 100, fourth: "ESCALATE", fifth: null, sixth: null },
		decisionAuthority: "DISCIPLINE_COMMITTEE",
		canEscalate: true,
	},
	{
		code: "ART30-045",
		article: "ARTICLE_30",
		severityLevel: 7,
		name: "Failure to prevent violence",
		nameAm: "ጥቃትን አለመከላከል",
		punishmentScale: { first: 30, second: 50, third: 100, fourth: "ESCALATE", fifth: null, sixth: null },
		decisionAuthority: "DISCIPLINE_COMMITTEE",
		canEscalate: true,
	},
	{
		code: "ART30-046",
		article: "ARTICLE_30",
		severityLevel: 7,
		name: "Repeated violations requiring escalation",
		nameAm: "ማሳደግ የሚያስፈልጋቸው ድጋሚ ጥሰቶች",
		description: "When Article 30 offenses are repeated to the point of requiring Article 31 review",
		descriptionAm: "የአንቀጽ 30 ጥፋቶች ወደ አንቀጽ 31 ክለሳ የሚያስፈልጋቸው ድረስ ሲደጋገሙ",
		punishmentScale: { first: 30, second: 50, third: 100, fourth: "ESCALATE", fifth: null, sixth: null },
		decisionAuthority: "DISCIPLINE_COMMITTEE",
		canEscalate: true,
	},
];

/**
 * Article 31 - Serious Offenses (32 types)
 *
 * All Article 31 offenses:
 * - Handled by Center Discipline Committee initially
 * - Guilty findings go to HQ Discipline Committee
 * - HQ Committee decides punishment (demotion, termination, criminal referral)
 * - No predefined punishment scale
 */
const ARTICLE_31_OFFENSES: OffenseType[] = [
	{
		code: "ART31-001",
		article: "ARTICLE_31",
		severityLevel: null,
		name: "Corruption or bribery",
		nameAm: "ሙስና ወይም ጉቦ",
		punishmentScale: null,
		decisionAuthority: null,
		canEscalate: false,
	},
	{
		code: "ART31-002",
		article: "ARTICLE_31",
		severityLevel: null,
		name: "Theft of government property",
		nameAm: "የመንግስት ንብረት መስረቅ",
		punishmentScale: null,
		decisionAuthority: null,
		canEscalate: false,
	},
	{
		code: "ART31-003",
		article: "ARTICLE_31",
		severityLevel: null,
		name: "Embezzlement of funds",
		nameAm: "ገንዘብ መዝረፍ",
		punishmentScale: null,
		decisionAuthority: null,
		canEscalate: false,
	},
	{
		code: "ART31-004",
		article: "ARTICLE_31",
		severityLevel: null,
		name: "Assisting prisoner escape",
		nameAm: "እስረኛ እንዲያመልጥ መርዳት",
		punishmentScale: null,
		decisionAuthority: null,
		canEscalate: false,
	},
	{
		code: "ART31-005",
		article: "ARTICLE_31",
		severityLevel: null,
		name: "Sexual misconduct",
		nameAm: "የወሲብ ጥፋት",
		punishmentScale: null,
		decisionAuthority: null,
		canEscalate: false,
	},
	{
		code: "ART31-006",
		article: "ARTICLE_31",
		severityLevel: null,
		name: "Drug trafficking",
		nameAm: "የአደንዛዥ ዕጽ ንግድ",
		punishmentScale: null,
		decisionAuthority: null,
		canEscalate: false,
	},
	{
		code: "ART31-007",
		article: "ARTICLE_31",
		severityLevel: null,
		name: "Physical assault causing serious injury",
		nameAm: "ከባድ ጉዳት ያደረሰ አካላዊ ጥቃት",
		punishmentScale: null,
		decisionAuthority: null,
		canEscalate: false,
	},
	{
		code: "ART31-008",
		article: "ARTICLE_31",
		severityLevel: null,
		name: "Murder or manslaughter",
		nameAm: "ግድያ ወይም ሰው መግደል",
		punishmentScale: null,
		decisionAuthority: null,
		canEscalate: false,
	},
	{
		code: "ART31-009",
		article: "ARTICLE_31",
		severityLevel: null,
		name: "Torture of prisoners",
		nameAm: "እስረኞችን ማሰቃየት",
		punishmentScale: null,
		decisionAuthority: null,
		canEscalate: false,
	},
	{
		code: "ART31-010",
		article: "ARTICLE_31",
		severityLevel: null,
		name: "Human rights violations",
		nameAm: "የሰብዓዊ መብቶች ጥሰት",
		punishmentScale: null,
		decisionAuthority: null,
		canEscalate: false,
	},
	{
		code: "ART31-011",
		article: "ARTICLE_31",
		severityLevel: null,
		name: "Unauthorized weapon discharge",
		nameAm: "ያልተፈቀደ የጦር መሳሪያ መተኮስ",
		punishmentScale: null,
		decisionAuthority: null,
		canEscalate: false,
	},
	{
		code: "ART31-012",
		article: "ARTICLE_31",
		severityLevel: null,
		name: "Treason or espionage",
		nameAm: "ክህደት ወይም ሰላይነት",
		punishmentScale: null,
		decisionAuthority: null,
		canEscalate: false,
	},
	{
		code: "ART31-013",
		article: "ARTICLE_31",
		severityLevel: null,
		name: "Falsification of official documents",
		nameAm: "ኦፊሴላዊ ሰነዶችን ማጭበርበር",
		punishmentScale: null,
		decisionAuthority: null,
		canEscalate: false,
	},
	{
		code: "ART31-014",
		article: "ARTICLE_31",
		severityLevel: null,
		name: "Fraud against the institution",
		nameAm: "በተቋሙ ላይ ማጭበርበር",
		punishmentScale: null,
		decisionAuthority: null,
		canEscalate: false,
	},
	{
		code: "ART31-015",
		article: "ARTICLE_31",
		severityLevel: null,
		name: "Smuggling contraband into facility",
		nameAm: "የተከለከሉ ዕቃዎችን ወደ ተቋም ማስገባት",
		punishmentScale: null,
		decisionAuthority: null,
		canEscalate: false,
	},
	{
		code: "ART31-016",
		article: "ARTICLE_31",
		severityLevel: null,
		name: "Conspiracy against the institution",
		nameAm: "በተቋሙ ላይ ሴራ",
		punishmentScale: null,
		decisionAuthority: null,
		canEscalate: false,
	},
	{
		code: "ART31-017",
		article: "ARTICLE_31",
		severityLevel: null,
		name: "Mutiny or inciting rebellion",
		nameAm: "ዓመፅ ወይም አመጽ ማነሳሳት",
		punishmentScale: null,
		decisionAuthority: null,
		canEscalate: false,
	},
	{
		code: "ART31-018",
		article: "ARTICLE_31",
		severityLevel: null,
		name: "Extortion of prisoners or families",
		nameAm: "እስረኞችን ወይም ቤተሰቦችን ማስገደድ",
		punishmentScale: null,
		decisionAuthority: null,
		canEscalate: false,
	},
	{
		code: "ART31-019",
		article: "ARTICLE_31",
		severityLevel: null,
		name: "Organized criminal activity",
		nameAm: "የተደራጀ ወንጀል እንቅስቃሴ",
		punishmentScale: null,
		decisionAuthority: null,
		canEscalate: false,
	},
	{
		code: "ART31-020",
		article: "ARTICLE_31",
		severityLevel: null,
		name: "Rape or sexual assault",
		nameAm: "አስገድዶ መድፈር ወይም ወሲባዊ ጥቃት",
		punishmentScale: null,
		decisionAuthority: null,
		canEscalate: false,
	},
	{
		code: "ART31-021",
		article: "ARTICLE_31",
		severityLevel: null,
		name: "Kidnapping",
		nameAm: "ሰውን መጥለፍ",
		punishmentScale: null,
		decisionAuthority: null,
		canEscalate: false,
	},
	{
		code: "ART31-022",
		article: "ARTICLE_31",
		severityLevel: null,
		name: "Illegal weapon possession",
		nameAm: "ሕገ-ወጥ የጦር መሳሪያ መያዝ",
		punishmentScale: null,
		decisionAuthority: null,
		canEscalate: false,
	},
	{
		code: "ART31-023",
		article: "ARTICLE_31",
		severityLevel: null,
		name: "Gross negligence causing death",
		nameAm: "ሞትን ያስከተለ ከፍተኛ ቸልተኝነት",
		punishmentScale: null,
		decisionAuthority: null,
		canEscalate: false,
	},
	{
		code: "ART31-024",
		article: "ARTICLE_31",
		severityLevel: null,
		name: "Revealing state secrets",
		nameAm: "የመንግስት ሚስጥር ማውጣት",
		punishmentScale: null,
		decisionAuthority: null,
		canEscalate: false,
	},
	{
		code: "ART31-025",
		article: "ARTICLE_31",
		severityLevel: null,
		name: "Terrorism or supporting terrorists",
		nameAm: "ሽብርተኝነት ወይም ሽብርተኞችን መደገፍ",
		punishmentScale: null,
		decisionAuthority: null,
		canEscalate: false,
	},
	{
		code: "ART31-026",
		article: "ARTICLE_31",
		severityLevel: null,
		name: "Arson",
		nameAm: "ሆን ብሎ ማቃጠል",
		punishmentScale: null,
		decisionAuthority: null,
		canEscalate: false,
	},
	{
		code: "ART31-027",
		article: "ARTICLE_31",
		severityLevel: null,
		name: "Participating in organized escape",
		nameAm: "በተደራጀ ማምለጫ ውስጥ መሳተፍ",
		punishmentScale: null,
		decisionAuthority: null,
		canEscalate: false,
	},
	{
		code: "ART31-028",
		article: "ARTICLE_31",
		severityLevel: null,
		name: "Abuse of prisoners resulting in permanent injury",
		nameAm: "ቋሚ ጉዳት ያስከተለ እስረኞችን ማሰቃየት",
		punishmentScale: null,
		decisionAuthority: null,
		canEscalate: false,
	},
	{
		code: "ART31-029",
		article: "ARTICLE_31",
		severityLevel: null,
		name: "Desertion",
		nameAm: "ከስራ መሸሽ",
		punishmentScale: null,
		decisionAuthority: null,
		canEscalate: false,
	},
	{
		code: "ART31-030",
		article: "ARTICLE_31",
		severityLevel: null,
		name: "Severe insubordination with serious consequences",
		nameAm: "ከባድ መዘዝ ያስከተለ ከባድ ትዕዛዝ አለመቀበል",
		punishmentScale: null,
		decisionAuthority: null,
		canEscalate: false,
	},
	{
		code: "ART31-031",
		article: "ARTICLE_31",
		severityLevel: null,
		name: "Conduct bringing institution into disrepute",
		nameAm: "ተቋሙን የሚያዋርድ ድርጊት",
		punishmentScale: null,
		decisionAuthority: null,
		canEscalate: false,
	},
	{
		code: "ART31-032",
		article: "ARTICLE_31",
		severityLevel: null,
		name: "Escalated Article 30 offense",
		nameAm: "ያደገ የአንቀጽ 30 ጥፋት",
		description: "Article 30 offense that has escalated due to repeated violations or severity",
		descriptionAm: "በተደጋጋሚ ጥሰቶች ወይም ክብደት ምክንያት ያደገ የአንቀጽ 30 ጥፋት",
		punishmentScale: null,
		decisionAuthority: null,
		canEscalate: false,
	},
];

// Combined list of all offenses
export const OFFENSE_TYPES: OffenseType[] = [...ARTICLE_30_OFFENSES, ...ARTICLE_31_OFFENSES];

// Export individual lists for convenience
export const ARTICLE_30_OFFENSE_LIST = ARTICLE_30_OFFENSES;
export const ARTICLE_31_OFFENSE_LIST = ARTICLE_31_OFFENSES;

/**
 * Helper Functions
 */

/**
 * Get all offenses for a specific article
 */
export const getOffensesByArticle = (article: "ARTICLE_30" | "ARTICLE_31"): OffenseType[] => {
	return OFFENSE_TYPES.filter((offense) => offense.article === article);
};

/**
 * Get a single offense by its code
 */
export const getOffenseByCode = (code: string): OffenseType | undefined => {
	return OFFENSE_TYPES.find((offense) => offense.code === code);
};

/**
 * Get the punishment for a specific occurrence of an offense
 * @param offenseCode - The offense code (e.g., "ART30-001")
 * @param occurrence - Which occurrence this is (1st, 2nd, 3rd, etc.)
 * @returns The punishment value or null if not found
 */
export const getPunishmentForOccurrence = (offenseCode: string, occurrence: number): PunishmentValue => {
	const offense = getOffenseByCode(offenseCode);
	if (!offense?.punishmentScale) return null;

	const occurrenceMap: Record<number, keyof PunishmentScale> = {
		1: "first",
		2: "second",
		3: "third",
		4: "fourth",
		5: "fifth",
		6: "sixth",
	} as const;

	const key = occurrenceMap[occurrence];
	if (!key) return null;

	return offense.punishmentScale[key];
};

/**
 * Format punishment value for display
 */
export const formatPunishment = (value: PunishmentValue, language: "en" | "am" = "en"): string => {
	if (value === null) return "-";
	if (value === "WARNING") return language === "am" ? "የጽሁፍ ማስጠንቀቂያ" : "Written Warning";
	if (value === "ESCALATE") return language === "am" ? "ወደ አንቀጽ 31 ያድጋል" : "Escalate to Article 31";
	return `${value}%`;
};

/**
 * Check if an offense should escalate to Article 31 based on occurrence
 */
export const shouldEscalateToArticle31 = (offenseCode: string, occurrence: number): boolean => {
	const punishment = getPunishmentForOccurrence(offenseCode, occurrence);
	return punishment === "ESCALATE";
};

/**
 * Get the decision authority for an Article 30 offense based on severity level
 */
export const getDecisionAuthority = (severityLevel: number | null): DecisionAuthority | null => {
	if (severityLevel === null) return null;
	return SEVERITY_TO_AUTHORITY[severityLevel] ?? null;
};

/**
 * Check if an offense requires committee decision (severity levels 5-7)
 */
export const requiresCommitteeDecision = (offenseCode: string): boolean => {
	const offense = getOffenseByCode(offenseCode);
	if (!offense || offense.article === "ARTICLE_31") return true; // All Article 31 require committee
	return offense.severityLevel !== null && offense.severityLevel >= 5;
};

/**
 * Get severity level description
 */
export const getSeverityLevelDescription = (level: number | null, language: "en" | "am" = "en"): string => {
	if (level === null) return language === "am" ? "ዋና ኮሚቴ ይወስናል" : "HQ Committee Decides";

	const descriptions: Record<number, { en: string; am: string }> = {
		1: { en: "Level 1 - Mildest", am: "ደረጃ 1 - በጣም ቀላል" },
		2: { en: "Level 2 - Minor", am: "ደረጃ 2 - ቀላል" },
		3: { en: "Level 3 - Moderate Low", am: "ደረጃ 3 - መካከለኛ ዝቅተኛ" },
		4: { en: "Level 4 - Moderate", am: "ደረጃ 4 - መካከለኛ" },
		5: { en: "Level 5 - Moderate High", am: "ደረጃ 5 - መካከለኛ ከፍተኛ" },
		6: { en: "Level 6 - Severe", am: "ደረጃ 6 - ከባድ" },
		7: { en: "Level 7 - Most Severe", am: "ደረጃ 7 - በጣም ከባድ" },
	} as const;

	return descriptions[level]?.[language] ?? `Level ${level}`;
};

/**
 * Get all offenses by severity level (for Article 30)
 */
export const getOffensesBySeverityLevel = (level: number): OffenseType[] => {
	return ARTICLE_30_OFFENSES.filter((offense) => offense.severityLevel === level);
};

/**
 * Count total offenses
 */
export const getOffenseCount = (): { article30: number; article31: number; total: number } => ({
	article30: ARTICLE_30_OFFENSES.length,
	article31: ARTICLE_31_OFFENSES.length,
	total: OFFENSE_TYPES.length,
});
