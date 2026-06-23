let rawApiUrl = import.meta.env.VITE_API_URL || "https://dlm-gen-ai-production-2f7c.up.railway.app/api/v1";

// Safeguard against the old/incorrect Vercel environment variable setting
if (rawApiUrl.includes("dlm-gen-ai-production.up.railway.app")) {
  rawApiUrl = rawApiUrl.replace("dlm-gen-ai-production.up.railway.app", "dlm-gen-ai-production-2f7c.up.railway.app");
}

export const API_URL = rawApiUrl.endsWith("/api/v1") ? rawApiUrl : `${rawApiUrl}/api/v1`;

const BASE_URL = API_URL;

export const uploadAndAnalyze = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/upload-and-analyze`, {
    method: "POST",
    body: formData,
  });

  return res.json();
};

export const getTextractResults = async (jobId) => {
  const res = await fetch(`${BASE_URL}/results/${jobId}`);
  return res.json();
};
