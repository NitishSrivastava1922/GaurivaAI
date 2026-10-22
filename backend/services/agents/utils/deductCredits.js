import axios from "axios";

export const deductCredits = async (userId, agent) => {
  if (!userId || !agent) {
    throw new Error("userId and agent are required to deduct credits");
  }

  if (!process.env.AUTH_SERVICE) {
    throw new Error("AUTH_SERVICE is not configured");
  }

  const { data } = await axios.post(
    `${process.env.AUTH_SERVICE}/deduct-credits`,
    { userId, agent },
  );

  return data;
};
