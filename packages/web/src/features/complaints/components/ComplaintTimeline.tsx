import { CheckCircle, Circle } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import type { ComplaintTimeline as TimelineType } from "#web/types/complaint.ts";
import { COMPLAINT_STATUS_LABELS } from "#web/types/complaint.ts";

interface ComplaintTimelineProps {
	timeline: TimelineType[];
}

export const ComplaintTimeline = React.memo(
	({ timeline }: ComplaintTimelineProps) => {
		const { t } = useTranslation("complaints");

		if (timeline.length === 0) {
			return <p className="text-muted-foreground text-center py-4">{t("detail.noTimeline")}</p>;
		}

		return (
			<div className="relative">
				<div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
				<div className="space-y-6">
					{timeline.map((entry, index) => {
						const isLast = index === timeline.length - 1;
						return (
							<div key={entry.id} className="relative flex gap-4 pl-10">
								<div className="absolute left-2 flex h-6 w-6 items-center justify-center rounded-full bg-background">
									{isLast ? (
										<CheckCircle className="h-5 w-5 text-primary" />
									) : (
										<Circle className="h-5 w-5 text-muted-foreground" />
									)}
								</div>
								<div className="flex-1 space-y-1">
									<div className="flex items-center justify-between">
										<p className="font-medium text-sm">{entry.action.replace(/_/g, " ")}</p>
										<time className="text-xs text-muted-foreground">
											{new Date(entry.performedAt).toLocaleString()}
										</time>
									</div>
									{entry.fromStatus && entry.toStatus && (
										<p className="text-xs text-muted-foreground">
											{COMPLAINT_STATUS_LABELS[entry.fromStatus]} → {COMPLAINT_STATUS_LABELS[entry.toStatus]}
										</p>
									)}
									{entry.notes && <p className="text-sm text-muted-foreground">{entry.notes}</p>}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		);
	},
	(prevProps, nextProps) => prevProps.timeline.length === nextProps.timeline.length,
);

ComplaintTimeline.displayName = "ComplaintTimeline";
