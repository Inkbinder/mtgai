// src/index.ts
import { processDocument } from './documentProcessor';
import { storeDocuments } from './vectorStore';
import { handleQuery } from './queryHandler';
import {createEmbeddingsModel} from "./embeddingsUtil.ts";
import {Chroma} from "@langchain/community/vectorstores/chroma";

async function buildIndex(filePath: string) {
  try {
    // Process the document
    console.log(`Processing document: ${filePath}`);
    const documents = await processDocument(filePath);
    
    // Store documents - embeddings are generated within this function
    await storeDocuments(documents);
    
    console.log('Index built successfully!');
  } catch (error) {
    console.error('Error building index:', error);
  }
}

async function query(question: string) {
  try {
    console.log(`Processing query: "${question}"`);
    const embeddings = await createEmbeddingsModel();
    const vectorStore = await Chroma.fromExistingCollection(
        embeddings,
        {
          collectionName: "mtg-rules",
          url: "http://localhost:8000",
        }
    );
    const result = await handleQuery(question, vectorStore);
    
    console.log('\nQuestion:', question);
    console.log('\nAnswer:', result.answer);
    console.log('\nBased on rules:');
    result.relevantRules.forEach((rule, i) => {
      if (i < 2) console.log(`\n--- Rule ${i+1} ---\n${rule.substring(0, 150)}...`);
    });
  } catch (error) {
    console.error('Error processing query:', error);
  }
}

// Example usage
async function main() {
  const command = process.argv[2];
  
  if (command === 'build') {
    const filePath = process.argv[3] || './data/mtg_comprehensive_rules.txt';
    await buildIndex(filePath);
  } else if (command === 'query') {
    const question = process.argv.slice(3).join(' ');
    if (!question) {
      console.log('Please provide a question.');
      return;
    }
    await query(question);
  } else {
    console.log('Usage:');
    console.log('  npm run start -- build [path/to/rules.txt]');
    console.log('  npm run start -- query "Your question about MTG rules"');
  }
}

main().catch(console.error);