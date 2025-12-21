import { Loader2, Search, User } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useEmployeeByEmployeeId } from "#web/api/employees/employees.queries.ts";
import { Button } from "#web/components/ui/button.tsx";
import { Card, CardContent } from "#web/components/ui/card.tsx";
import { Input } from "#web/components/ui/input.tsx";
import { Label } from "#web/components/ui/label.tsx";
import type { Employee } from "#web/types/employee.ts";

interface EmployeeSearchProps {
	onEmployeeFound: (employee: Employee) => void;
	onClear: () => void;
	selectedEmployee: Employee | null;
}

export const EmployeeSearch = React.memo(
	({ onEmployeeFound, onClear, selectedEmployee }: EmployeeSearchProps) => {
		const { t } = useTranslation("employees");
		const { t: tCommon } = useTranslation("common");
		const { i18n } = useTranslation();
		const isAmharic = i18n.language === "am";

		const [searchId, setSearchId] = React.useState("");
		const [searchTriggered, setSearchTriggered] = React.useState(false);

		const { data: employee, isLoading, isError } = useEmployeeByEmployeeId(searchTriggered ? searchId : "");

		React.useEffect(() => {
			if (employee && searchTriggered) {
				onEmployeeFound(employee);
				setSearchTriggered(false);
			}
		}, [employee, searchTriggered, onEmployeeFound]);

		const handleSearch = React.useCallback(() => {
			if (searchId.trim()) {
				setSearchTriggered(true);
			}
		}, [searchId]);

		const handleKeyDown = React.useCallback(
			(e: React.KeyboardEvent<HTMLInputElement>) => {
				if (e.key === "Enter") {
					handleSearch();
				}
			},
			[handleSearch],
		);

		const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
			setSearchId(e.target.value);
		}, []);

		const handleClear = React.useCallback(() => {
			setSearchId("");
			setSearchTriggered(false);
			onClear();
		}, [onClear]);

		const displayName = React.useMemo(() => {
			if (!selectedEmployee) return "";
			return isAmharic && selectedEmployee.fullNameAm ? selectedEmployee.fullNameAm : selectedEmployee.fullName;
		}, [selectedEmployee, isAmharic]);

		return (
			<div className="space-y-4">
				<div className="space-y-2">
					<Label>{t("employeeId")}</Label>
					<div className="flex gap-2">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								value={searchId}
								onChange={handleInputChange}
								onKeyDown={handleKeyDown}
								placeholder={t("employeeId")}
								className="pl-9"
								disabled={!!selectedEmployee}
							/>
						</div>
						{!selectedEmployee ? (
							<Button onClick={handleSearch} disabled={!searchId.trim() || isLoading}>
								{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : tCommon("search")}
							</Button>
						) : (
							<Button variant="outline" onClick={handleClear}>
								{tCommon("clear")}
							</Button>
						)}
					</div>
					{isError && searchTriggered && <p className="text-sm text-destructive">{tCommon("notFound")}</p>}
				</div>

				{selectedEmployee && (
					<Card className="bg-muted/50">
						<CardContent className="pt-4">
							<div className="flex items-start gap-4">
								<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
									<User className="h-6 w-6 text-primary" />
								</div>
								<div className="flex-1 space-y-1">
									<p className="font-medium">{displayName}</p>
									<p className="text-sm text-muted-foreground">
										{t("employeeId")}: {selectedEmployee.employeeId}
									</p>
									<div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
										<span>{t(`types.${selectedEmployee.employeeType}`)}</span>
										{selectedEmployee.departmentName && <span>{selectedEmployee.departmentName}</span>}
										{selectedEmployee.positionName && <span>{selectedEmployee.positionName}</span>}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		);
	},
	(prevProps, nextProps) =>
		prevProps.selectedEmployee?.id === nextProps.selectedEmployee?.id &&
		prevProps.onEmployeeFound === nextProps.onEmployeeFound &&
		prevProps.onClear === nextProps.onClear,
);

EmployeeSearch.displayName = "EmployeeSearch";
