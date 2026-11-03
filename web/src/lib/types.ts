export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface StoredFile {
  id: number;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface GithubProfile {
  login: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string;
  htmlUrl: string;
  location: string | null;
  publicRepos: number;
  followers: number;
  following: number;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface SignUpInput extends Credentials {
  name: string;
}

export interface UpdateMeInput {
  name?: string;
  email?: string;
  password?: string;
}
