// src/vectorStore.ts
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { Document } from "langchain/document";
import { createEmbeddingsModel } from "./embeddingsUtil";

export async function storeDocuments(documents: Document[]) {
  const embeddings = await createEmbeddingsModel();

  // Store documents in Chroma - this will generate embeddings internally
  const vectorStore = await Chroma.fromDocuments(
    documents, 
    embeddings,
    {
      collectionName: "mtg-rules",
      url: "http://localhost:8000",
    }
  );

  console.log('All documents have been stored in Chroma with their embeddings');
  return vectorStore;
}