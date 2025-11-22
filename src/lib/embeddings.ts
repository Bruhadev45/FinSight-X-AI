import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text.substring(0, 8000), // API limits to 8k tokens
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
};

export const generateEmbeddings = async (
  texts: string[]
): Promise<number[][]> => {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: texts.map((t) => t.substring(0, 8000)),
    });
    // Sort by index to maintain order
    return response.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
  } catch (error) {
    console.error("Error generating embeddings:", error);
    throw error;
  }
};
