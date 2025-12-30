import type { TFunction } from "i18next";
import React from "react";
import type { Committee } from "#web/types/committee.ts";

interface UseCommitteeDisplayNamesParams {
	committee: Committee | undefined;
	isAmharic: boolean;
	t: TFunction;
}

interface CommitteeDisplayNames {
	displayName: string;
	typeName: string;
	centerName: string;
}

export const useCommitteeDisplayNames = ({
	committee,
	isAmharic,
	t,
}: UseCommitteeDisplayNamesParams): CommitteeDisplayNames =>
	React.useMemo(() => {
		if (!committee) {
			return { displayName: "", typeName: "", centerName: "" };
		}

		const displayName = isAmharic && committee.nameAm ? committee.nameAm : committee.name;
		const typeName =
			isAmharic && committee.committeeType?.nameAm ? committee.committeeType.nameAm : committee.committeeType?.name;
		const centerName = committee.center
			? isAmharic && committee.center.nameAm
				? committee.center.nameAm
				: committee.center.name
			: t("committee.hqLevel");

		return { displayName, typeName: typeName ?? "", centerName };
	}, [committee, isAmharic, t]);
