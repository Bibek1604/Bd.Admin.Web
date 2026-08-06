export const useNews = () => {
	return {
		news: [],
		loading: false,
		error: null as string | null,
		refetch: async () => {
			return;
		},
	};
};
