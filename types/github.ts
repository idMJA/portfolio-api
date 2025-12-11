export interface GitHubRepo {
	id: number;
	name: string;
	description: string | null;
	html_url: string;
	homepage: string | null;
	stargazers_count: number;
	forks_count: number;
	language: string | null;
	topics: string[];
	updated_at: string;
	created_at: string;
	pushed_at: string;
	archived: boolean;
	fork: boolean;
}

export interface ProjectSummary {
	id: number;
	name: string;
	description: string;
	githubUrl: string;
	demoUrl: string | null;
	stars: number;
	forks: number;
	language: string;
	topics: string[];
	updatedAt: string;
	createdAt: string;
}

export interface ProjectsResponse {
	success: boolean;
	projects: ProjectSummary[];
	totalCount: number;
	username?: string | null;
	languageColors: Record<string, string>;
}
