// src/embeddingsUtil.ts
import { OllamaEmbeddings } from "@langchain/ollama";
import { CacheBackedEmbeddings } from "langchain/embeddings/cache_backed";
import { LocalFileStore } from "langchain/storage/file_system";
import { join } from "path";


export async function createEmbeddingsModel(cacheDir = "./cache/embeddings"
) {
  // Create the underlying embeddings model
  const underlyingEmbeddings = new OllamaEmbeddings({
    model: "nomic-embed-text",
    baseUrl: "http://localhost:11434",
  });

  // Create a local file store for caching embeddings
  const store = await LocalFileStore.fromPath(join(process.cwd(), cacheDir));

  return CacheBackedEmbeddings.fromBytesStore(
    underlyingEmbeddings, store, {
      namespace: underlyingEmbeddings.model
      }
  )
}