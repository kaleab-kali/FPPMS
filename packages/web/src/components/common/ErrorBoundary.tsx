import { AlertTriangle, RefreshCw } from "lucide-react";
import React from "react";
import { Button } from "#web/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "#web/components/ui/card.tsx";

interface ErrorBoundaryProps {
	children: React.ReactNode;
	fallback?: React.ReactNode;
	onReset?: () => void;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

interface ErrorFallbackProps {
	error: Error | null;
	onReset?: () => void;
}

const ErrorFallback = React.memo(
	({ error, onReset }: ErrorFallbackProps) => {
		const handleReset = React.useCallback(() => {
			if (onReset) {
				onReset();
			} else {
				globalThis.location.reload();
			}
		}, [onReset]);

		return (
			<div className="flex min-h-[400px] items-center justify-center p-4">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
							<AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
						</div>
						<CardTitle>Something went wrong</CardTitle>
						<CardDescription>An unexpected error occurred. Please try again.</CardDescription>
					</CardHeader>
					<CardContent>
						{error && (
							<div className="rounded-md bg-muted p-3">
								<p className="text-sm font-mono text-muted-foreground break-all">{error.message}</p>
							</div>
						)}
					</CardContent>
					<CardFooter className="flex justify-center">
						<Button onClick={handleReset} variant="outline">
							<RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
							Try Again
						</Button>
					</CardFooter>
				</Card>
			</div>
		);
	},
	(prev, next) => prev.error?.message === next.error?.message,
);

ErrorFallback.displayName = "ErrorFallback";

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
		console.error("Error caught by ErrorBoundary:", error, errorInfo);
	}

	handleReset = (): void => {
		this.setState({ hasError: false, error: null });
		if (this.props.onReset) {
			this.props.onReset();
		}
	};

	render(): React.ReactNode {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}
			return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
		}

		return this.props.children;
	}
}

export { ErrorFallback };
