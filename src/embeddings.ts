// src/embeddings.ts
import { OllamaEmbeddings } from "@langchain/ollama";
import { Document } from 'langchain/document';

export async function generateEmbeddings(chunks: Document[]) {
  // Initialize Ollama embeddings with a suitable model
  // nomic-embed-text is a good choice for embeddings
  const embeddings = new OllamaEmbeddings({
    model: "nomic-embed-text",
    baseUrl: "http://localhost:11434", // Default Ollama server address
  });
  
  console.log('Generating embeddings for chunks...');
  
  // Process chunks in batches
  const batchSize = 50;
  const allEmbeddings = [];
  
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const batchTexts = batch.map(chunk => chunk.pageContent);
    const batchEmbeddings = await embeddings.embedDocuments(batchTexts);
    
    allEmbeddings.push(...batchEmbeddings);
    console.log(`Processed ${i + batch.length} / ${chunks.length} chunks`);
  }
  
  return chunks.map((chunk, i) => ({
    id: `chunk-${i}`,
    values: allEmbeddings[i],
    metadata: {
      text: chunk.pageContent,
      ...chunk.metadata
    }
  }));
}