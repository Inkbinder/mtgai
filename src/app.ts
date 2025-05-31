// src/app.ts
import * as readline from 'readline';
import { handleQuery } from './queryHandler';
import { createEmbeddingsModel } from "./embeddingsUtil";
import { Chroma } from "@langchain/community/vectorstores/chroma";

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function startInteractiveSession() {
  console.log('Initializing MTG Rules Assistant...');
  
  // Initialize embeddings and vector store once
  let time = Date.now();
  const embeddings = await createEmbeddingsModel();
  console.log('Embeddings initialized in', Date.now() - time, 'ms');
  
  time = Date.now();
  // Initialize vector store
  const vectorStore = await Chroma.fromExistingCollection(
    embeddings,
    {
      collectionName: "mtg-rules",
      url: "http://localhost:8000",
    }
  );
  console.log('Vector store initialized in', Date.now() - time, 'ms');
  
  console.log('MTG Rules Assistant initialized. Type your question or "exit" to quit.');
  
  // Continue asking for input until user types "exit"
  const askQuestion = () => {
    rl.question('\nYour question: ', async (query) => {
      if (query.toLowerCase() === 'exit') {
        console.log('Exiting MTG Rules Assistant. Goodbye!');
        rl.close();
        return;
      }
      
      try {
        console.log('\nSearching for answer...');
        const result = await handleQuery(query, vectorStore);
        
        console.log('\n======= ANSWER =======');
        console.log(result.answer);
        console.log('\n======= RELEVANT RULES =======');
        result.relevantRules.forEach((rule, index) => {
          console.log(`\n[Rule ${index + 1}]:`);
          console.log(rule);
        });
      } catch (error) {
        console.error('Error processing your question:', error);
      }
      
      // Ask for the next question
      askQuestion();
    });
  };
  
  askQuestion();
}

// Start the interactive session
startInteractiveSession().catch(error => {
  console.error('Failed to start interactive session:', error);
  rl.close();
});