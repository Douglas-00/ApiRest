import axios from 'axios';

interface GitHubUser {
  login: string;
  name: string;
  bio: string;
}

export async function getUserFromGitHub(username: string): Promise<GitHubUser> {
  const url = `https://api.github.com/users/${username}`;
  const response = await axios.get(url);
  const { login, name, bio } = response.data;
  return { login, name, bio };
}