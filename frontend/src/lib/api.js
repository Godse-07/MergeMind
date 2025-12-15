import axiosInstance from "./axios";

export const currUser = async () => {
  const response = await axiosInstance.get("/auth/me");
  return response.data;
};

export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  const token = response.data.token;
  localStorage.setItem("token", token); 
  return response.data;
};

export const signUp = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
  const token = response.data.token;
  localStorage.setItem("token", token);
  return response.data;
};

export const githubOAth = async () => {
  const token = localStorage.getItem("token"); 
  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI;
  const scope = "repo,read:user,admin:repo_hook";

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(scope)}&state=${token}`;

  window.location.href = githubAuthUrl;
};

export const logOut = async () => {
  localStorage.removeItem("token");
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

export const getPRanalysis = async (repoId, prNumber) => {
  const response = await axiosInstance.post(`/pr/${repoId}/prs/${prNumber}/analyze`);
  return response.data;
}

export const disConnectGithub = async () => {
  const response = await axiosInstance.get("/auth/disconnectGithub");
  return response.data;
}

export const forgetPassword = async (email) => {
  const response = await axiosInstance.post("/password-forget/forget-password", { email });
  return response.data;
}

export const verifyOTP = async (email, otp) => {
  const response = await axiosInstance.post("/password-forget/verify-otp", { email, otp });
  return response.data;
}

export const resetPassword = async (email, newPassword) => {
  const response = await axiosInstance.post("/password-forget/reset-password", { email, newPassword });
  return response.data;
}

export const addCustomRules = async (rules) => {
  const response = await axiosInstance.post("/rules/setRules", { rules });
  return response.data;
}

export const getCustomRules = async () => {
  const response = await axiosInstance.get("/rules/getRules");
  return response.data;
}