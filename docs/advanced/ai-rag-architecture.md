# AI & RAG Intelligence Architecture

This document describes the high-level system design, data flow, token optimization, and horizontal scaling strategies for **ShrFlow's** private, self-hosted AI and Retrieval-Augmented Generation (RAG) system.

---

## 1. System Overview & Core Goals

ShrFlow is designed around a **self-hosted, privacy-first** ethos. To ensure that no customer campaigns, templates, or contact details are leaked to external LLM providers (e.g., OpenAI or Anthropic), ShrFlow utilizes a local, containerized AI pipeline.

### Core Goals:
1.  **Strict Privacy:** All template drafting, contact segment generation, and bounce code debugging remain on the local server.
2.  **Low Resource Footprint:** Capable of running efficiently on mixed consumer hardware (CPU or low-tier GPU).
3.  **Horizontal Scalability:** Decoupled inference processing so bulk AI tasks do not degrade transactional email delivery times.

---

## 2. Two-Stage MCP-RAG Pipeline

Instead of querying a large, expensive external model, ShrFlow splits reasoning and context collection into a decoupled **Local RAG Pipeline** powered by the **Model Context Protocol (MCP)** and a lightweight **1.5B Parameter LLM** (e.g., Qwen-2.5-1.5B-Instruct running via Ollama or llama.cpp).

```
                      ┌─────────────────────────────────┐
                      │        User Query Input         │
                      └────────────────┬────────────────┘
                                       │
                                       ▼
                      ┌─────────────────────────────────┐
                      │     1.5B LLM: Tool Router       │
                      │ (Determines Intent & Tool Args) │
                      └────────────────┬────────────────┘
                                       │ Generates JSON Tool Call
                                       ▼
                      ┌─────────────────────────────────┐
                      │         MCP Server Tool         │
                      │ (Queries DB, pgvector, or Logs) │
                      └────────────────┬────────────────┘
                                       │ Returns Structured JSON Context
                                       ▼
                      ┌─────────────────────────────────┐
                      │     1.5B LLM: Synthesizer       │
                      │ (Translates Context to Answer)  │
                      └────────────────┬────────────────┘
                                       │
                                       ▼
                      ┌─────────────────────────────────┐
                      │     Answer Returned to User     │
                      └─────────────────────────────────┘
```

---

## 3. Token Optimization Strategy

Small 1.5B models have limited context windows and reduced attention spans. To prevent context pollution and OOM (Out of Memory) crashes, ShrFlow implements a multi-tiered **Token Optimization Strategy** at the application and protocol layers:

```
  User Query ──► [System Prompt Pruning] ──► [MCP Vector Cosine Ranking] ──► [JSON Schema Compression] ──► LLM Context
```

### 3.1. System Prompt Pruning
*   Instead of massive system prompts with generic behavioral rules, ShrFlow uses short, high-density instructions containing only the available tool definitions and active schema boundaries.

### 3.2. Vector Cosine-Similarity Ranking
*   When executing semantic searches on historical campaigns or template libraries using `pgvector`, the RAG engine retrieves only the **top-K most relevant records** (typically $K=3$).
*   Only the core text blocks (subject lines, headers) are embedded and retrieved, avoiding injecting full HTML files into the LLM context.

### 3.3. JSON Compression & Schema Stripping
*   Before database rows retrieved by the MCP server are sent back to the LLM, the data is compacted:
    *   **Keys Mapping:** Long column names are stripped or mapped to short aliases (e.g., `campaign_id` $\rightarrow$ `id`, `click_rate` $\rightarrow$ `ctr`).
    *   **Field Stripping:** Unused fields (metadata, timestamps, tenant_ids, audit logs) are discarded.
    *   **Compacted JSON:** Raw JSON payload whitespace and nested arrays are minified before being injected into the final prompt.

### 3.4. Token-Aware Chunking & Fallbacks
*   The MCP client measures the context size before invoking the LLM. If the payload exceeds a strict threshold (e.g., 4,000 tokens), the client automatically truncates historical records, keeping only the most recent user messages and aggregate metrics.

---

## 4. Scaling Strategy & Resource Management

AI inference is computationally expensive. ShrFlow isolates and scales RAG execution through the following strategies:

### 4.1. Decoupled, Stateless Inference Nodes
*   The LLM serving engine (Ollama/vLLM) runs in a separate stateless container.
*   **Horizontal Scaling:** Multiple replicas of the LLM container can be deployed behind a load balancer. If AI usage spikes, more inference nodes can be provisioned without affecting the FastAPI API Gateway or Celery/RabbitMQ sending workers.

### 4.2. Asynchronous Queue-Based Ingestion
*   **Ingestion Pipeline:** When a campaign finishes sending, its content is embedded and indexed asynchronously. This is handled by a background Celery worker pushing tasks to a dedicated RabbitMQ queue (`embeddings_queue`).
*   **Decoupling:** This prevents the high-priority campaign dispatch worker from waiting on model inference, keeping email throughput consistently fast.

### 4.3. Quantized Model Deployments
*   ShrFlow recommends **4-bit quantized GGUF/AWQ models** for self-hosted instances. 
*   **Memory Efficiency:** A 4-bit quantized 1.5B model fits within **1.2 GB of VRAM/RAM**, allowing deployment on low-spec server CPUs or shared virtual machines.
