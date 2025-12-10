import React, { createContext, useContext, useEffect, useState } from "react";
import { STORAGE_KEYS } from "#web/config/constants.ts";
import { api } from "#web/lib/api-client.ts";
import type { AuthUser, LoginRequest, LoginResponse } from "#web/types/auth.ts";

interface AuthContextValue {
	user: AuthUser | undefined;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (credentials: LoginRequest) => Promise<void>;
	logout: () => void;
	updateUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
	children: React.ReactNode;
}

const getStoredUser = (): AuthUser | undefined => {
	const stored = globalThis.localStorage.getItem(STORAGE_KEYS.authStore);
	if (stored) {
		const parsed = JSON.parse(stored) as { user?: AuthUser };
		return parsed.user;
	}
	return undefined;
};

const getStoredToken = (): string | undefined => {
	return globalThis.localStorage.getItem(STORAGE_KEYS.accessToken) ?? undefined;
};

export const AuthProvider = React.memo(
	({ children }: AuthProviderProps) => {
		const [user, setUser] = useState<AuthUser | undefined>(getStoredUser);
		const [isLoading, setIsLoading] = useState(true);

		const isAuthenticated = !!user && !!getStoredToken();

		useEffect(() => {
			const token = getStoredToken();
			if (token && !user) {
				api
					.get<AuthUser>("/auth/me")
					.then((data) => {
						setUser(data);
						globalThis.localStorage.setItem(STORAGE_KEYS.authStore, JSON.stringify({ user: data }));
					})
					.catch(() => {
						globalThis.localStorage.removeItem(STORAGE_KEYS.accessToken);
						globalThis.localStorage.removeItem(STORAGE_KEYS.refreshToken);
						globalThis.localStorage.removeItem(STORAGE_KEYS.authStore);
						setUser(undefined);
					})
					.finally(() => setIsLoading(false));
			} else {
				setIsLoading(false);
			}
		}, [user]);

		const login = React.useCallback(async (credentials: LoginRequest) => {
			const response = await api.post<LoginResponse>("/auth/login", credentials);
			globalThis.localStorage.setItem(STORAGE_KEYS.accessToken, response.accessToken);
			globalThis.localStorage.setItem(STORAGE_KEYS.refreshToken, response.refreshToken);
			globalThis.localStorage.setItem(STORAGE_KEYS.authStore, JSON.stringify({ user: response.user }));
			setUser(response.user);
		}, []);

		const logout = React.useCallback(() => {
			globalThis.localStorage.removeItem(STORAGE_KEYS.accessToken);
			globalThis.localStorage.removeItem(STORAGE_KEYS.refreshToken);
			globalThis.localStorage.removeItem(STORAGE_KEYS.authStore);
			setUser(undefined);
		}, []);

		const updateUser = React.useCallback((updatedUser: AuthUser) => {
			setUser(updatedUser);
			globalThis.localStorage.setItem(STORAGE_KEYS.authStore, JSON.stringify({ user: updatedUser }));
		}, []);

		const value = React.useMemo(
			() => ({
				user,
				isAuthenticated,
				isLoading,
				login,
				logout,
				updateUser,
			}),
			[user, isAuthenticated, isLoading, login, logout, updateUser],
		);

		return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
	},
	(prevProps, nextProps) => prevProps.children === nextProps.children,
);

AuthProvider.displayName = "AuthProvider";

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
