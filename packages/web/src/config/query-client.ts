import { QueryClient } from "@tanstack/react-query";

const FIVE_MINUTES = 5 * 60 * 1000;
const TEN_MINUTES = 10 * 60 * 1000;

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: FIVE_MINUTES,
			gcTime: TEN_MINUTES,
			retry: 1,
			refetchOnWindowFocus: false,
		},
		mutations: {
			retry: 0,
		},
	},
});
