import { Hono } from "hono";
import type {
	GitHubRepo,
	ProjectSummary,
	ProjectsResponse,
} from "../../types/github.js";

const githubRoutes = new Hono().get("/project", async (c) => {
	async function fetchLanguageColors(): Promise<Record<string, string>> {
		try {
			const res = await fetch(
				"https://raw.githubusercontent.com/ozh/github-colors/refs/heads/master/colors.json",
			);
			if (!res.ok) return {};
			const data = await res.json();
			const map: Record<string, string> = {};
			for (const [key, val] of Object.entries(data)) {
				if (val && typeof val === "object" && "color" in val) {
					const v = val as { color?: string };
					if (v.color) map[key] = v.color;
				}
			}
			return map;
		} catch (_e) {
			return {};
		}
	}

	const reposParam = c.req.queries("repos");

	if (reposParam && reposParam.length > 0) {
		const repoUrls = reposParam.flatMap((r: string) =>
			r
				.split(",")
				.map((s: string) => s.trim())
				.filter(Boolean),
		);
		const repoApiUrls = repoUrls
			.map((url: string) => {
				const match = url.match(/github.com\/(.+?)\/(.+?)(?:$|\/|\?)/);
				if (!match) return null;
				const owner = match[1];
				const repo = match[2];
				return `https://api.github.com/repos/${owner}/${repo}`;
			})
			.filter((v: string | null): v is string => typeof v === "string" && !!v);

		const headers: HeadersInit = {
			Accept: "application/vnd.github.v3+json",
			"User-Agent": "Portfolio-App",
		};

		const results = await Promise.all(
			repoApiUrls.map(async (apiUrl: string) => {
				try {
					const res = await fetch(apiUrl, { headers });
					if (!res.ok) return null;
					const repo = await res.json();
					return {
						id: repo.id,
						name: repo.name,
						description: repo.description || "No description available",
						githubUrl: repo.html_url,
						demoUrl: repo.homepage || null,
						stars: repo.stargazers_count,
						forks: repo.forks_count,
						language: repo.language || "Unknown",
						topics: repo.topics || [],
						updatedAt: repo.updated_at,
						createdAt: repo.created_at,
					};
				} catch {
					return null;
				}
			}),
		);

		const projects = results.filter(Boolean) as ProjectSummary[];
		const languageColors = await fetchLanguageColors();

		const fallback = "#6b7280";
		for (const p of projects) {
			const lang = p.language || "Unknown";
			if (!languageColors[lang]) {
				languageColors[lang] = fallback;
			}
		}

		return c.json({
			success: true,
			projects,
			totalCount: projects.length,
			languageColors,
		} satisfies ProjectsResponse);
	}

	const username = c.req.query("username");
	const limit = Number.parseInt(c.req.query("limit") || "10", 10);

	try {
		const headers: HeadersInit = {
			Accept: "application/vnd.github.v3+json",
			"User-Agent": "Portfolio-App",
		};

		const reposResponse = await fetch(
			`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
			{
				headers,
			},
		);

		if (!reposResponse.ok) {
			if (reposResponse.status === 404) {
				return c.json(
					{
						success: false,
						error: `User '${username}' not found`,
						projects: [],
					},
					404,
				);
			}
			throw new Error(`GitHub API error: ${reposResponse.status}`);
		}

		const allRepos: GitHubRepo[] = await reposResponse.json();

		const ownRepos = allRepos.filter((repo) => !repo.fork && !repo.archived);

		const filteredRepos = ownRepos
			.sort(
				(a, b) =>
					new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
			)
			.slice(0, limit);

		const projects: ProjectSummary[] = filteredRepos.map((repo) => ({
			id: repo.id,
			name: repo.name,
			description:
				repo.description || `A ${repo.language || "software"} project`,
			githubUrl: repo.html_url,
			demoUrl: repo.homepage || null,
			stars: repo.stargazers_count,
			forks: repo.forks_count,
			language: repo.language || "Unknown",
			topics: repo.topics || [],
			updatedAt: repo.updated_at,
			createdAt: repo.created_at,
		}));

		const languageColors = await fetchLanguageColors();
		return c.json({
			success: true,
			projects,
			totalCount: projects.length,
			username,
			languageColors,
		} satisfies ProjectsResponse);
	} catch (error) {
		console.error("Error fetching GitHub data:", error);

		return c.json(
			{
				success: false,
				error: "Failed to fetch GitHub data",
				projects: [],
				username,
				languageColors: {},
			},
			500,
		);
	}
});

export default githubRoutes;
