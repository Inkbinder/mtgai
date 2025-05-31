// src/queryHandler.ts
import { Ollama } from "@langchain/ollama";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { createEmbeddingsModel } from "./embeddingsUtil";

export async function handleQuery(query: string) {

  let time = Date.now()
  // Initialize embeddings
  const embeddings = await createEmbeddingsModel();
  console.log('Embeddings initialized in', Date.now() - time, 'ms')

  time = Date.now()
  // Initialize vector store
  const vectorStore = await Chroma.fromExistingCollection(
    embeddings,
    {
      collectionName: "mtg-rules",
      url: "http://localhost:8000",
    }
  );
  console.log('Vector store initialized in', Date.now() - time, 'ms')
  time = Date.now()
  // Retrieve relevant documents
  const relevantDocs = await vectorStore.similaritySearch(query, 5);
  const relevantChunks = relevantDocs.map(doc => doc.pageContent);
  
  // Combine the chunks into a context
  const context = relevantChunks.join('\n\n');

  console.log('Context generated in', Date.now() - time, 'ms')

  time = Date.now()
  // Initialize Ollama LLM
  const llm = new Ollama({
    model: "mistral",
    baseUrl: "http://localhost:11434",
    temperature: 0,
  });
  
  // Generate an answer
  const prompt = `
    You are an expert on Magic: The Gathering rules.
    Answer the following question based on the provided context from the MTG Comprehensive Rules.
    If the answer cannot be found in the context, say "I don't have enough information to answer that question."
    
    Context:
    ${context}
    
    Question: ${query}
    
    Answer:
  `;
  console.log('LLM Init & Prompt generated in', Date.now() - time, 'ms')
  const response = await llm.invoke(prompt);
  return { answer: response, relevantRules: relevantChunks };
}