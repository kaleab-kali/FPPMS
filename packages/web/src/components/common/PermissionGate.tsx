import React from "react";
import type { PermissionValue, RoleValue } from "#web/constants/permissions";
import { useAuth } from "#web/context/AuthContext";

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
		JSON.stringify(prevProps.permissions) === JSON.stringify(nextProps.permissions) &&
		JSON.stringify(prevProps.roles) === JSON.stringify(nextProps.roles),
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
		JSON.stringify(prevProps.roles) === JSON.stringify(nextProps.roles),
);

RoleGate.displayName = "RoleGate";
