// Semantic Financial Reasoning with RAG
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { SemanticQueryResult, VectorSearchResult } from "@/lib/types/enterprise";

const FINANCIAL_SYSTEM_PROMPT = `You are a financial analysis expert. Answer questions about financial documents with precision and cite sources.

Financial Context:
- Focus on key metrics, ratios, and year-over-year comparisons
- Highlight risks, opportunities, and regulatory concerns
- Always cite document sources and fiscal periods
- If information is ambiguous, acknowledge the limitation

Format responses with:
1. Direct answer to the query
2. Supporting evidence from documents
3. Source attribution (company, document type, fiscal year)
4. Relevant context or caveats`;

export class LangChainRAGService {
  private pineconeClient: Pinecone | null = null;
  private embeddings: OpenAIEmbeddings | null = null;
  private llm: ChatOpenAI | null = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (process.env.PINECONE_API_KEY && process.env.OPENAI_API_KEY) {
      this.pineconeClient = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
      });

      this.embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: "text-embedding-3-small",
      });

      this.llm = new ChatOpenAI({
        modelName: "gpt-4o-mini",
        temperature: 0.3,
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  async getVectorStore() {
    if (!this.pineconeClient || !this.embeddings) {
      throw new Error("Pinecone or embeddings not initialized");
    }

    return PineconeStore.fromExistingIndex(this.embeddings, {
      pineconeIndex: this.pineconeClient.Index(process.env.PINECONE_INDEX_NAME || "financial-docs"),
      namespace: process.env.DOCUMENT_SOURCE_NAMESPACE || "default",
    });
  }

  async addDocuments(
    documents: Document[],
    metadata: {
      companyId: string;
      documentType: string;
      fiscalYear: number;
      source: string;
    }
  ): Promise<string[]> {
    const enrichedDocs = documents.map((doc) => ({
      ...doc,
      metadata: {
        ...doc.metadata,
        ...metadata,
        retrievedAt: new Date().toISOString(),
      },
    }));

    const vectorStore = await this.getVectorStore();
    const ids = await vectorStore.addDocuments(enrichedDocs);
    return ids;
  }

  async semanticSearch(
    query: string,
    filters?: {
      companyId?: string;
      documentType?: string;
      fiscalYear?: number;
    },
    k: number = 5
  ): Promise<VectorSearchResult[]> {
    const vectorStore = await this.getVectorStore();

    const whereFilter = filters
      ? {
          $and: Object.entries(filters)
            .filter(([, v]) => v !== undefined)
            .map(([key, value]) => ({
              [key]: { $eq: value },
            })),
        }
      : undefined;

    const results = await vectorStore.similaritySearch(query, k, whereFilter);

    return results.map((doc) => ({
      content: doc.pageContent,
      metadata: {
        companyId: doc.metadata.companyId || "unknown",
        documentType: doc.metadata.documentType || "unknown",
        fiscalYear: doc.metadata.fiscalYear || 0,
        source: doc.metadata.source || "unknown",
        pageNumber: doc.metadata.pageNumber,
      },
      score: doc.metadata.score || 0,
    }));
  }

  async queryFinancialDocuments(
    query: string,
    filters?: {
      companyId?: string;
      documentType?: string;
      fiscalYear?: number;
    }
  ): Promise<SemanticQueryResult> {
    if (!this.llm) {
      throw new Error("LLM not initialized");
    }

    const relevantDocs = await this.semanticSearch(query, filters, 5);

    if (relevantDocs.length === 0) {
      return {
        answer: "No relevant financial documents found for your query.",
        sources: [],
        confidence: "low",
        reasoning: ["No matching documents in vector database"],
      };
    }

    const context = relevantDocs
      .map(
        (doc) =>
          `[${doc.metadata.source} - ${doc.metadata.documentType}]\n${doc.content}`
      )
      .join("\n\n---\n\n");

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", FINANCIAL_SYSTEM_PROMPT],
      ["user", "Question: {question}\n\nRelevant documents:\n{context}"],
    ]);

    const chain = prompt.pipe(this.llm).pipe(new StringOutputParser());

    const response = await chain.invoke({
      question: query,
      context: context,
    });

    return {
      answer: response,
      sources: relevantDocs,
      confidence: relevantDocs.length >= 3 ? "high" : "medium",
      reasoning: [
        `Retrieved ${relevantDocs.length} relevant documents`,
        `Analyzed context from ${relevantDocs.map(d => d.metadata.source).join(", ")}`,
      ],
    };
  }

  async chunkDocument(content: string, chunkSize: number = 1000): Promise<Document[]> {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap: 200,
      separators: ["\n\n", "\n", ". ", " "],
    });

    return splitter.createDocuments([content]);
  }
}

export const ragService = new LangChainRAGService();