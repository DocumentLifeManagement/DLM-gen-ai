const BASE_URL = "http://localhost:8000/api/v1";

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
