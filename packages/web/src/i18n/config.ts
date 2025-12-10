import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { APP_CONFIG, STORAGE_KEYS } from "#web/config/constants.ts";
import amAuth from "#web/i18n/locales/am/auth.json";
import amCommon from "#web/i18n/locales/am/common.json";
import amDashboard from "#web/i18n/locales/am/dashboard.json";
import amErrors from "#web/i18n/locales/am/errors.json";
import amLookups from "#web/i18n/locales/am/lookups.json";
import amNavigation from "#web/i18n/locales/am/navigation.json";
import amOrganization from "#web/i18n/locales/am/organization.json";
import amRoles from "#web/i18n/locales/am/roles.json";
import amUsers from "#web/i18n/locales/am/users.json";
import amValidation from "#web/i18n/locales/am/validation.json";
import enAuth from "#web/i18n/locales/en/auth.json";
import enCommon from "#web/i18n/locales/en/common.json";
import enDashboard from "#web/i18n/locales/en/dashboard.json";
import enErrors from "#web/i18n/locales/en/errors.json";
import enLookups from "#web/i18n/locales/en/lookups.json";
import enNavigation from "#web/i18n/locales/en/navigation.json";
import enOrganization from "#web/i18n/locales/en/organization.json";
import enRoles from "#web/i18n/locales/en/roles.json";
import enUsers from "#web/i18n/locales/en/users.json";
import enValidation from "#web/i18n/locales/en/validation.json";

const resources = {
	en: {
		common: enCommon,
		auth: enAuth,
		navigation: enNavigation,
		validation: enValidation,
		errors: enErrors,
		users: enUsers,
		roles: enRoles,
		organization: enOrganization,
		lookups: enLookups,
		dashboard: enDashboard,
	},
	am: {
		common: amCommon,
		auth: amAuth,
		navigation: amNavigation,
		validation: amValidation,
		errors: amErrors,
		users: amUsers,
		roles: amRoles,
		organization: amOrganization,
		lookups: amLookups,
		dashboard: amDashboard,
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
			"navigation",
			"validation",
			"errors",
			"users",
			"roles",
			"organization",
			"lookups",
			"dashboard",
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
