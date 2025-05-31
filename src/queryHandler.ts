// src/queryHandler.ts
import { ChatOllama } from "@langchain/ollama";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export async function handleQuery(
  query: string, 
  vectorStore: Chroma
) {
  let time = Date.now()
  
  // Retrieve relevant documents
  const relevantDocs = await vectorStore.similaritySearch(query, 5);
  const relevantChunks = relevantDocs.map(doc => doc.pageContent);
  
  // Combine the chunks into a context
  const context = relevantChunks.join('\n\n');

  console.log('Context generated in', Date.now() - time, 'ms')

  time = Date.now()
  // Initialize ChatOllama LLM
  const chatModel = new ChatOllama({
    model: "mistral",
    baseUrl: "http://localhost:11434",
    temperature: 0,
  });
  
  // Create messages for the chat model
  const systemMessage = new SystemMessage(`
    You are an expert on Magic: The Gathering rules.
    Answer the following question based on the provided context from the MTG Comprehensive Rules.
    If the answer cannot be found in the context, say "I don't have enough information to answer that question."
    
    Context:
    ${context}
  `);
  
  const humanMessage = new HumanMessage(query);
  
  console.log('Chat model Init & Messages generated in', Date.now() - time, 'ms')
  // Invoke the chat model with messages
  const response = await chatModel.invoke([systemMessage, humanMessage]);
  return { answer: response.content, relevantRules: relevantChunks };
}