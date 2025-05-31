// src/documentProcessor.ts
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import * as fs from 'fs';
import * as path from 'path';
import { Document } from 'langchain/document';

export async function processDocument(filePath: string): Promise<Document[]> {
  // Read the MtG comprehensive rules
  const text = fs.readFileSync(path.resolve(filePath), 'utf-8');
  
  // Create a text splitter
  // The MtG rules have a specific structure with numbered sections
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
    separators: ['\n\n', '\n', ' ', ''] // Try to split on paragraph breaks first
  });
  
  // Split the text into chunks
  const chunks = await splitter.createDocuments([text]);
  console.log(`Document split into ${chunks.length} chunks`);
  
  return chunks;
}