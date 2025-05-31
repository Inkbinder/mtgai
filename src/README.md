# MTG Rules AI Assistant

A locally-hosted RAG (Retrieval-Augmented Generation) system for answering questions about Magic: The Gathering rules using embeddings and vector search.

## Overview

This project provides a command-line tool that lets you ask questions about Magic: The Gathering game rules and get answers based on the official comprehensive rules document. It uses:

- LangChain for document processing and RAG capabilities
- Ollama for locally running embedding and LLM models
- ChromaDB as a vector database to store and query rule embeddings

## Prerequisites

### 1. Node.js and npm

This project requires Node.js (v16 or higher) and npm.

**Windows:**
- Download and install from [Node.js official website](https://nodejs.org/)

**macOS:**
- Via Homebrew: `brew install node`
- Or download from [Node.js official website](https://nodejs.org/)

**Linux:**
- Ubuntu/Debian: `sudo apt install nodejs npm`
- Fedora: `sudo dnf install nodejs`
- Or use [Node Version Manager (nvm)](https://github.com/nvm-sh/nvm)

Verify installation:

```bash
node --version npm --version
```

### 2. Ollama

Ollama is required to run the language models locally.

**Windows:**
- Download and install from [Ollama official website](https://ollama.ai/download)

**macOS:**
- Download and install from [Ollama official website](https://ollama.ai/download)
- Or via Homebrew: `brew install ollama`

**Linux:**
- Run installation script:
```bash
curl -fsSL [https://ollama.ai/install.sh](https://ollama.ai/install.sh) | sh
```
Verify installation:
```bash
ollama --version
```

### 3. Required Models for Ollama

After installing Ollama, you need to download the necessary models:

```bash
ollama pull nomic-embed-text
ollama pull mistral
```

### 4. ChromaDB

ChromaDB runs as a separate service for storing and querying vector embeddings.

**Option 1: Install ChromaDB via Docker (recommended):**

1. [Install Docker](https://docs.docker.com/get-docker/)
2. Run ChromaDB container:
```bash
docker run -p 8000:8000 chromadb/chroma
```
**Option 2: Install ChromaDB Python package:**

1. Ensure Python 3.7+ is installed
2. Install ChromaDB:
```bash
pip install chromadb
```

## Installation

1. Clone this repository:
```bash
git clone [repository-url] cd mtgai
```
2. Install dependencies:
```bash
npm install
```
3. Create a data directory and download the MTG comprehensive rules:
```bash
mkdir -p data curl -o data/mtg_comprehensive_rules.txt [https://media.wizards.com/2025/downloads/MagicCompRules%2020250404.txt](https://media.wizards.com/2025/downloads/MagicCompRules%2020250404.txt)
```
(Note: You may need to update the URL to get the latest version of the rules)

## Usage

Before building the knowledge base or querying, make sure both required services are running:

1. **Start Ollama Service:**
```bash
ollama serve
```

Run ChromaDB server:
```bash
chroma run --host 0.0.0.0 --port 8000
```

### Building the Knowledge Base

Before asking questions, you need to process the rules document and build the vector index:
```bash
npm run start:build
```

This will:
1. Read the MTG comprehensive rules
2. Split them into manageable chunks
3. Generate embeddings using the nomic-embed-text model
4. Store the embeddings in ChromaDB

### Asking Questions

Once the index is built, you can ask questions about MTG rules:

```bash
npm run start:query "How does first strike work in combat?"
```

The system will:
1. Convert your question into an embedding
2. Find the most relevant rule sections
3. Use an LLM to generate a comprehensive answer based on those rules
4. Display the answer along with the relevant rule references

## Troubleshooting

### Ollama Connection Issues

If you encounter errors connecting to Ollama:

1. Ensure Ollama is running:
```bash
ollama list
```
2. Verify the Ollama server is accessible at http://localhost:11434

### ChromaDB Connection Issues

If you encounter errors connecting to ChromaDB:

1. If using Docker, ensure the container is running:
```bash
docker ps | grep chroma
```
2. Verify ChromaDB is accessible at http://localhost:8000

### Model Download Issues

If you encounter model download errors:

1. Check your internet connection
2. Try pulling the models manually with verbose output:
```bash
ollama pull nomic-embed-text -v
```

## Advanced Configuration

### Changing Embedding Models

To use a different embedding model, modify `src/embeddingsUtil.ts`:
```typescript
export function createEmbeddingsModel(): OllamaEmbeddings { 
    return new OllamaEmbeddings({ model: "alternative-model-name", // Change this to your preferred model
                                baseUrl: "http://localhost:11434" }); 
}
```

### Adjusting Text Chunking

To modify how the rules are split into chunks, edit the parameters in `src/documentProcessor.ts`:
```typescript
const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, // Adjust size of each chunk
                    chunkOverlap: 200,// Adjust overlap between chunks 
                    separators: ['\n\n', '\n', ' ', ''] // Adjust split boundaries 
});

```

## License

ISC