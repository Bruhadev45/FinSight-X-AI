import { Pinecone } from "@pinecone-database/pinecone";

let pineconeClient: Pinecone | null = null;

export const getPineconeClient = (): Pinecone => {
  if (!pineconeClient) {
    if (!process.env.PINECONE_API_KEY) {
      throw new Error("PINECONE_API_KEY is not defined in environment variables");
    }
    
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
  }
  return pineconeClient;
};

export const getPineconeIndex = (indexName?: string) => {
  const pc = getPineconeClient();
  const name = indexName || process.env.PINECONE_INDEX_NAME || "finsight-documents";
  return pc.index(name);
};

export const createIndexIfNotExists = async () => {
  try {
    const pc = getPineconeClient();
    const indexName = process.env.PINECONE_INDEX_NAME || "finsight-documents";

    // Check if index exists
    const { indexes } = await pc.listIndexes();
    const indexExists = indexes?.some((index) => index.name === indexName);

    if (!indexExists) {
      console.log(`Creating Pinecone index: ${indexName}`);
      await pc.createIndex({
        name: indexName,
        dimension: 1536, // text-embedding-3-small dimension
        spec: {
          serverless: {
            cloud: "aws",
            region: "us-west-2",
          },
        },
        metric: "cosine",
        suppressConflicts: true,
        waitUntilReady: true,
      });
      console.log(`Index ${indexName} created successfully`);
    } else {
      console.log(`Index ${indexName} already exists`);
    }
  } catch (error) {
    console.error("Error creating Pinecone index:", error);
    throw error;
  }
};
