import React from "react";
import type { PermissionValue, RoleValue } from "#web/constants/permissions";
import { useAuth } from "#web/context/AuthContext";

const arraysEqual = <T,>(a: T[] | undefined, b: T[] | undefined): boolean => {
	if (a === b) return true;
	if (!a || !b) return a === b;
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return false;
	}
	return true;
};

interface PermissionGateProps {
	children: React.ReactNode;
	fallback?: React.ReactNode;
	permission?: PermissionValue | string;
	permissions?: (PermissionValue | string)[];
	requireAll?: boolean;
	role?: RoleValue | string;
	roles?: (RoleValue | string)[];
	requireAllRoles?: boolean;
}

export const PermissionGate = React.memo(
	({
		children,
		fallback = null,
		permission,
		permissions,
		requireAll = false,
		role,
		roles,
		requireAllRoles = false,
	}: PermissionGateProps) => {
		const { user } = useAuth();

		const hasAccess = React.useMemo(() => {
			if (!user) return false;

			let permissionCheck = true;
			let roleCheck = true;

			if (permission) {
				permissionCheck = user.permissions?.includes(permission) ?? false;
			} else if (permissions && permissions.length > 0) {
				if (requireAll) {
					permissionCheck = permissions.every((p) => user.permissions?.includes(p) ?? false);
				} else {
					permissionCheck = permissions.some((p) => user.permissions?.includes(p) ?? false);
				}
			}

			if (role) {
				roleCheck = user.roles?.includes(role) ?? false;
			} else if (roles && roles.length > 0) {
				if (requireAllRoles) {
					roleCheck = roles.every((r) => user.roles?.includes(r) ?? false);
				} else {
					roleCheck = roles.some((r) => user.roles?.includes(r) ?? false);
				}
			}

			return permissionCheck && roleCheck;
		}, [user, permission, permissions, requireAll, role, roles, requireAllRoles]);

		if (!hasAccess) {
			return <>{fallback}</>;
		}

		return <>{children}</>;
	},
	(prevProps, nextProps) =>
		prevProps.permission === nextProps.permission &&
		prevProps.role === nextProps.role &&
		prevProps.requireAll === nextProps.requireAll &&
		prevProps.requireAllRoles === nextProps.requireAllRoles &&
		arraysEqual(prevProps.permissions, nextProps.permissions) &&
		arraysEqual(prevProps.roles, nextProps.roles),
);

PermissionGate.displayName = "PermissionGate";

interface RoleGateProps {
	children: React.ReactNode;
	fallback?: React.ReactNode;
	role?: RoleValue | string;
	roles?: (RoleValue | string)[];
	requireAll?: boolean;
}

export const RoleGate = React.memo(
	({ children, fallback = null, role, roles, requireAll = false }: RoleGateProps) => {
		const { user } = useAuth();

		const hasAccess = React.useMemo(() => {
			if (!user) return false;

			if (role) {
				return user.roles?.includes(role) ?? false;
			}

			if (roles && roles.length > 0) {
				if (requireAll) {
					return roles.every((r) => user.roles?.includes(r) ?? false);
				}
				return roles.some((r) => user.roles?.includes(r) ?? false);
			}

			return true;
		}, [user, role, roles, requireAll]);

		if (!hasAccess) {
			return <>{fallback}</>;
		}

		return <>{children}</>;
	},
	(prevProps, nextProps) =>
		prevProps.role === nextProps.role &&
		prevProps.requireAll === nextProps.requireAll &&
		arraysEqual(prevProps.roles, nextProps.roles),
);

RoleGate.displayName = "RoleGate";
