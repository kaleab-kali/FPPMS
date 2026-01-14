import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { APP_CONFIG, STORAGE_KEYS } from "#web/config/constants.ts";
import amAuditLog from "#web/i18n/locales/am/auditLog.json";
import amAuth from "#web/i18n/locales/am/auth.json";
import amCommittees from "#web/i18n/locales/am/committees.json";
import amCommon from "#web/i18n/locales/am/common.json";
import amComplaints from "#web/i18n/locales/am/complaints.json";
import amDashboard from "#web/i18n/locales/am/dashboard.json";
import amEmployees from "#web/i18n/locales/am/employees.json";
import amErrors from "#web/i18n/locales/am/errors.json";
import amInventory from "#web/i18n/locales/am/inventory.json";
import amLookups from "#web/i18n/locales/am/lookups.json";
import amNavigation from "#web/i18n/locales/am/navigation.json";
import amOrganization from "#web/i18n/locales/am/organization.json";
import amRoles from "#web/i18n/locales/am/roles.json";
import amSalaryManagement from "#web/i18n/locales/am/salary-management.json";
import amSalaryScale from "#web/i18n/locales/am/salary-scale.json";
import amUsers from "#web/i18n/locales/am/users.json";
import amValidation from "#web/i18n/locales/am/validation.json";
import enAuditLog from "#web/i18n/locales/en/auditLog.json";
import enAuth from "#web/i18n/locales/en/auth.json";
import enCommittees from "#web/i18n/locales/en/committees.json";
import enCommon from "#web/i18n/locales/en/common.json";
import enComplaints from "#web/i18n/locales/en/complaints.json";
import enDashboard from "#web/i18n/locales/en/dashboard.json";
import enEmployees from "#web/i18n/locales/en/employees.json";
import enErrors from "#web/i18n/locales/en/errors.json";
import enInventory from "#web/i18n/locales/en/inventory.json";
import enLookups from "#web/i18n/locales/en/lookups.json";
import enNavigation from "#web/i18n/locales/en/navigation.json";
import enOrganization from "#web/i18n/locales/en/organization.json";
import enRoles from "#web/i18n/locales/en/roles.json";
import enSalaryManagement from "#web/i18n/locales/en/salary-management.json";
import enSalaryScale from "#web/i18n/locales/en/salary-scale.json";
import enUsers from "#web/i18n/locales/en/users.json";
import enValidation from "#web/i18n/locales/en/validation.json";

const resources = {
	en: {
		common: enCommon,
		auth: enAuth,
		auditLog: enAuditLog,
		committees: enCommittees,
		complaints: enComplaints,
		navigation: enNavigation,
		validation: enValidation,
		errors: enErrors,
		users: enUsers,
		roles: enRoles,
		organization: enOrganization,
		lookups: enLookups,
		dashboard: enDashboard,
		employees: enEmployees,
		inventory: enInventory,
		"salary-scale": enSalaryScale,
		"salary-management": enSalaryManagement,
	},
	am: {
		common: amCommon,
		auth: amAuth,
		auditLog: amAuditLog,
		committees: amCommittees,
		complaints: amComplaints,
		navigation: amNavigation,
		validation: amValidation,
		errors: amErrors,
		users: amUsers,
		roles: amRoles,
		organization: amOrganization,
		lookups: amLookups,
		dashboard: amDashboard,
		employees: amEmployees,
		inventory: amInventory,
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
			"auth",
			"auditLog",
			"committees",
			"complaints",
			"navigation",
			"validation",
			"errors",
			"users",
			"roles",
			"organization",
			"lookups",
			"dashboard",
			"employees",
			"inventory",
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
