import { useCallback, useEffect, useRef } from "react";
import { useAuth } from "#web/context/AuthContext.tsx";

const INACTIVITY_CONFIG = {
	TIMEOUT_MINUTES: 15,
	WARNING_BEFORE_LOGOUT_SECONDS: 60,
	ACTIVITY_EVENTS: ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"] as const,
} as const;

interface UseInactivityLogoutOptions {
	timeoutMinutes?: number;
	onWarning?: (secondsRemaining: number) => void;
	onLogout?: () => void;
	enabled?: boolean;
}

export const useInactivityLogout = (options: UseInactivityLogoutOptions = {}) => {
	const { timeoutMinutes = INACTIVITY_CONFIG.TIMEOUT_MINUTES, onWarning, onLogout, enabled = true } = options;

	const { isAuthenticated, logout } = useAuth();
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const warningIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const lastActivityRef = useRef<number>(Date.now());
	const handleActivityRef = useRef<() => void>(() => {});

	const clearTimers = useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
		if (warningIntervalRef.current) {
			clearInterval(warningIntervalRef.current);
			warningIntervalRef.current = null;
		}
	}, []);

	const handleLogout = useCallback(async () => {
		clearTimers();
		onLogout?.();
		await logout();
	}, [clearTimers, logout, onLogout]);

	const startWarningCountdown = useCallback(() => {
		if (warningIntervalRef.current) return;

		const warningStartTime = Date.now();
		const warningDuration = INACTIVITY_CONFIG.WARNING_BEFORE_LOGOUT_SECONDS * 1000;

		warningIntervalRef.current = setInterval(() => {
			const elapsed = Date.now() - warningStartTime;
			const remaining = Math.ceil((warningDuration - elapsed) / 1000);

			if (remaining <= 0) {
				handleLogout();
			} else {
				onWarning?.(remaining);
			}
		}, 1000);
	}, [handleLogout, onWarning]);

	const resetTimer = useCallback(() => {
		lastActivityRef.current = Date.now();
		clearTimers();

		if (!isAuthenticated || !enabled) return;

		const mainTimeout = (timeoutMinutes * 60 - INACTIVITY_CONFIG.WARNING_BEFORE_LOGOUT_SECONDS) * 1000;

		timeoutRef.current = setTimeout(() => {
			startWarningCountdown();
		}, mainTimeout);
	}, [isAuthenticated, enabled, timeoutMinutes, clearTimers, startWarningCountdown]);

	handleActivityRef.current = useCallback(() => {
		const now = Date.now();
		const timeSinceLastActivity = now - lastActivityRef.current;

		if (timeSinceLastActivity > 1000) {
			resetTimer();
		}
	}, [resetTimer]);

	useEffect(() => {
		if (!isAuthenticated || !enabled) {
			clearTimers();
			return;
		}

		resetTimer();

		const stableHandler = () => {
			handleActivityRef.current();
		};

		for (const event of INACTIVITY_CONFIG.ACTIVITY_EVENTS) {
			globalThis.addEventListener(event, stableHandler, { passive: true });
		}

		return () => {
			clearTimers();
			for (const event of INACTIVITY_CONFIG.ACTIVITY_EVENTS) {
				globalThis.removeEventListener(event, stableHandler);
			}
		};
	}, [isAuthenticated, enabled, clearTimers, resetTimer]);

	const extendSession = useCallback(() => {
		resetTimer();
	}, [resetTimer]);

	return {
		extendSession,
		resetTimer,
	};
};
