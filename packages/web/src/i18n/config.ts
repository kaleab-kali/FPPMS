import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { APP_CONFIG, STORAGE_KEYS } from "#web/config/constants.ts";
import amAttendance from "#web/i18n/locales/am/attendance.json";
import amAuditLog from "#web/i18n/locales/am/auditLog.json";
import amAuth from "#web/i18n/locales/am/auth.json";
import amCommittees from "#web/i18n/locales/am/committees.json";
import amCommon from "#web/i18n/locales/am/common.json";
import amComplaints from "#web/i18n/locales/am/complaints.json";
import amCorrespondence from "#web/i18n/locales/am/correspondence.json";
import amDashboard from "#web/i18n/locales/am/dashboard.json";
import amEmployees from "#web/i18n/locales/am/employees.json";
import amErrors from "#web/i18n/locales/am/errors.json";
// TODO: Uncomment when holidays module is merged
// import amHolidays from "#web/i18n/locales/am/holidays.json";
import amInventory from "#web/i18n/locales/am/inventory.json";
import amLookups from "#web/i18n/locales/am/lookups.json";
import amNavigation from "#web/i18n/locales/am/navigation.json";
import amOrganization from "#web/i18n/locales/am/organization.json";
import amRewards from "#web/i18n/locales/am/rewards.json";
import amRoles from "#web/i18n/locales/am/roles.json";
import amSalaryManagement from "#web/i18n/locales/am/salary-management.json";
import amSalaryScale from "#web/i18n/locales/am/salary-scale.json";
import amUsers from "#web/i18n/locales/am/users.json";
import amValidation from "#web/i18n/locales/am/validation.json";
import amWeapons from "#web/i18n/locales/am/weapons.json";
import enAttendance from "#web/i18n/locales/en/attendance.json";
import enAuditLog from "#web/i18n/locales/en/auditLog.json";
import enAuth from "#web/i18n/locales/en/auth.json";
import enCommittees from "#web/i18n/locales/en/committees.json";
import enCommon from "#web/i18n/locales/en/common.json";
import enComplaints from "#web/i18n/locales/en/complaints.json";
import enCorrespondence from "#web/i18n/locales/en/correspondence.json";
import enDashboard from "#web/i18n/locales/en/dashboard.json";
import enEmployees from "#web/i18n/locales/en/employees.json";
import enErrors from "#web/i18n/locales/en/errors.json";
// TODO: Uncomment when holidays module is merged
// import enHolidays from "#web/i18n/locales/en/holidays.json";
import enInventory from "#web/i18n/locales/en/inventory.json";
import enLookups from "#web/i18n/locales/en/lookups.json";
import enNavigation from "#web/i18n/locales/en/navigation.json";
import enOrganization from "#web/i18n/locales/en/organization.json";
import enRewards from "#web/i18n/locales/en/rewards.json";
import enRoles from "#web/i18n/locales/en/roles.json";
import enSalaryManagement from "#web/i18n/locales/en/salary-management.json";
import enSalaryScale from "#web/i18n/locales/en/salary-scale.json";
import enUsers from "#web/i18n/locales/en/users.json";
import enValidation from "#web/i18n/locales/en/validation.json";
import enWeapons from "#web/i18n/locales/en/weapons.json";

const resources = {
	en: {
		common: enCommon,
		attendance: enAttendance,
		auth: enAuth,
		auditLog: enAuditLog,
		committees: enCommittees,
		complaints: enComplaints,
		correspondence: enCorrespondence,
		navigation: enNavigation,
		validation: enValidation,
		errors: enErrors,
		users: enUsers,
		roles: enRoles,
		organization: enOrganization,
		lookups: enLookups,
		dashboard: enDashboard,
		employees: enEmployees,
		// holidays: enHolidays, // TODO: Uncomment when holidays module is merged
		inventory: enInventory,
		rewards: enRewards,
		weapons: enWeapons,
		"salary-scale": enSalaryScale,
		"salary-management": enSalaryManagement,
	},
	am: {
		common: amCommon,
		attendance: amAttendance,
		auth: amAuth,
		auditLog: amAuditLog,
		committees: amCommittees,
		complaints: amComplaints,
		correspondence: amCorrespondence,
		navigation: amNavigation,
		validation: amValidation,
		errors: amErrors,
		users: amUsers,
		roles: amRoles,
		organization: amOrganization,
		lookups: amLookups,
		dashboard: amDashboard,
		employees: amEmployees,
		// holidays: amHolidays, // TODO: Uncomment when holidays module is merged
		inventory: amInventory,
		rewards: amRewards,
		weapons: amWeapons,
		"salary-scale": amSalaryScale,
		"salary-management": amSalaryManagement,
	},
} as const;

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources,
		fallbackLng: APP_CONFIG.defaultLocale,
		supportedLngs: APP_CONFIG.supportedLocales,
		defaultNS: "common",
		ns: [
			"common",
			"attendance",
			"auth",
			"auditLog",
			"committees",
			"complaints",
			"correspondence",
			"navigation",
			"validation",
			"errors",
			"users",
			"roles",
			"organization",
			"lookups",
			"dashboard",
			"employees",
			// "holidays", // TODO: Uncomment when holidays module is merged
			"inventory",
			"rewards",
			"weapons",
			"salary-scale",
			"salary-management",
		],
		interpolation: {
			escapeValue: false,
		},
		detection: {
			order: ["localStorage", "navigator"],
			lookupLocalStorage: STORAGE_KEYS.locale,
			caches: ["localStorage"],
		},
	});

export { i18n };
