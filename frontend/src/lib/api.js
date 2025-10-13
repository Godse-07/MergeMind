import axiosInstance from "./axios";

export const currUser = async () => {
  const response = await axiosInstance.get("/auth/me");
  return response.data;
};

export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  return response.data;
};

export const signUp = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
  return response.data;
};

export const githubOAth = async () => {
  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI;
  const scope = "repo,read:user,admin:repo_hook";

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(scope)}`;

  window.location.href = githubAuthUrl;
};

export const logOut = async () => {
  const response = await axiosInstance.get("/auth/logout");
  return response.data;
};

export const getDashboardData = async () => {
  const response = await axiosInstance.get("/dashboard/stats");
  return response.data;
};

export const getRepoList = async () => {
  const response = await axiosInstance.get("/repositories/repos");
  return response.data;
};

export const connectRepoManually = async ({ repoId }) => {
    const response = await axiosInstance.post(`/webhooks/register/${repoId}`);
    return response.data;
}

export const repositoryPr = async (repoId) => {
  const response = await axiosInstance.get(`/pr/${repoId}/prs`);
  return response.data;
}
