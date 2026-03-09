export interface LastFmImage {
	size: string;
	"#text": string;
}

export interface LastFmTrack {
	artist: {
		mbid: string;
		"#text": string;
	};
	streamable: string;
	image: LastFmImage[];
	mbid: string;
	album: {
		mbid: string;
		"#text": string;
	};
	name: string;
	url: string;
	date?: {
		uts: string;
		"#text": string;
	};
	"@attr"?: {
		nowplaying?: "true";
	};
}

export interface LastFmRecentTracksResponse {
	recenttracks: {
		track: LastFmTrack[];
		"@attr": {
			user: string;
			totalPages: string;
			page: string;
			perPage: string;
			total: string;
		};
	};
}
