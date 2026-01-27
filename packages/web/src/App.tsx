import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";
import { RouterProvider } from "react-router-dom";
import { ErrorBoundary } from "#web/components/common/ErrorBoundary.tsx";
import { Toaster } from "#web/components/ui/sonner.tsx";
import { queryClient } from "#web/config/query-client.ts";
import { AuthProvider } from "#web/context/AuthContext.tsx";
import { router } from "#web/routes/routes.tsx";
import "#web/i18n/config.ts";

const App = React.memo(() => {
	return (
		<ErrorBoundary>
			<QueryClientProvider client={queryClient}>
				<AuthProvider>
					<RouterProvider router={router} />
					<Toaster position="top-right" />
				</AuthProvider>
				<ReactQueryDevtools initialIsOpen={false} />
			</QueryClientProvider>
		</ErrorBoundary>
	);
});

App.displayName = "App";

export default App;
