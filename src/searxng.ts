type SearchEntry = {
	url: string;
	title: string;
	content?: string;
	img_src?: string;
};

type SearchApiResponse = {
	results: SearchEntry[];
};

type SearchWebResponse =
	| {
			ok: true;
			error: null;
			result: {
				url: string;
				title: string;
				content?: string;
				image?: string;
			}[];
	  }
	| {
			ok: false;
			error: string;
			result: null;
	  };

export async function searchWeb(query: string): Promise<SearchWebResponse> {
	const uri = `${process.env.API_URL ?? ""}&q=${encodeURIComponent(query)}`;
	try {
		const request = await fetch(uri);
		const response: SearchApiResponse = await request.json();
		const formatted = response.results.map((result) => {
			return {
				url: result.url,
				title: result.title,
				content: result.content,
			};
		});
		return { ok: true, result: formatted, error: null };
	} catch (error) {
		return {
			ok: false,
			result: null,
			error: `${error}`.trim() || "Unknown Error",
		};
	}
}
