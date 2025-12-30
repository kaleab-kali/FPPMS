import React from "react";
import type { PermissionValue, RoleValue } from "#web/constants/permissions";
import { useAuth } from "#web/context/AuthContext";

export const useHasPermission = (permission: PermissionValue | string): boolean => {
	const { user } = useAuth();

	return React.useMemo(() => {
		if (!user?.permissions) return false;
		return user.permissions.includes(permission);
	}, [user?.permissions, permission]);
};

export const useHasAnyPermission = (permissions: (PermissionValue | string)[]): boolean => {
	const { user } = useAuth();

	return React.useMemo(() => {
		if (!user?.permissions || permissions.length === 0) return false;
		return permissions.some((permission) => user.permissions.includes(permission));
	}, [user?.permissions, permissions]);
};

export const useHasAllPermissions = (permissions: (PermissionValue | string)[]): boolean => {
	const { user } = useAuth();

	return React.useMemo(() => {
		if (!user?.permissions || permissions.length === 0) return false;
		return permissions.every((permission) => user.permissions.includes(permission));
	}, [user?.permissions, permissions]);
};

export const useHasRole = (role: RoleValue | string): boolean => {
	const { user } = useAuth();

	return React.useMemo(() => {
		if (!user?.roles) return false;
		return user.roles.includes(role);
	}, [user?.roles, role]);
};

export const useHasAnyRole = (roles: (RoleValue | string)[]): boolean => {
	const { user } = useAuth();

	return React.useMemo(() => {
		if (!user?.roles || roles.length === 0) return false;
		return roles.some((role) => user.roles.includes(role));
	}, [user?.roles, roles]);
};

export const useUserPermissions = () => {
	const { user } = useAuth();

	const hasPermission = React.useCallback(
		(permission: PermissionValue | string): boolean => {
			if (!user?.permissions) return false;
			return user.permissions.includes(permission);
		},
		[user?.permissions],
	);

	const hasAnyPermission = React.useCallback(
		(permissions: (PermissionValue | string)[]): boolean => {
			if (!user?.permissions || permissions.length === 0) return false;
			return permissions.some((permission) => user.permissions.includes(permission));
		},
		[user?.permissions],
	);

	const hasAllPermissions = React.useCallback(
		(permissions: (PermissionValue | string)[]): boolean => {
			if (!user?.permissions || permissions.length === 0) return false;
			return permissions.every((permission) => user.permissions.includes(permission));
		},
		[user?.permissions],
	);

	const hasRole = React.useCallback(
		(role: RoleValue | string): boolean => {
			if (!user?.roles) return false;
			return user.roles.includes(role);
		},
		[user?.roles],
	);

	const hasAnyRole = React.useCallback(
		(roles: (RoleValue | string)[]): boolean => {
			if (!user?.roles || roles.length === 0) return false;
			return roles.some((role) => user.roles.includes(role));
		},
		[user?.roles],
	);

	return React.useMemo(
		() => ({
			permissions: user?.permissions ?? [],
			roles: user?.roles ?? [],
			hasPermission,
			hasAnyPermission,
			hasAllPermissions,
			hasRole,
			hasAnyRole,
		}),
		[user?.permissions, user?.roles, hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole],
	);
};
