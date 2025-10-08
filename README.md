# AI-Powered Research Assistant Backend

A Node.js TypeScript backend service for an AI-powered research assistant.

## Features

- Receives user queries via API
- Searches the web for relevant articles and papers
- Extracts and summarizes key information using OpenAI LLM
- Returns structured results

## Installation

1. Clone the repository
2. Run `npm install`
3. Create a `.env` file with your API keys:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   SERPAPI_API_KEY=your_serpapi_api_key_here
   ```

## Build

npm run build

## Run

npm start

Then open http://localhost:3000 in your browser for the web interface.

## Development

npm run dev

## API Usage

Send a POST request to `/research` with JSON body:

```json
{
  "query": "Summarize the latest research on quantum computing"
}
```

Response:

```json
{
  "query": "Summarize the latest research on quantum computing",
  "summary": "Quantum computing is a revolutionary technology that...",
  "sources": [
    {
      "title": "Quantum Computing 101",
      "url": "https://example.com",
      "summary": "This article discusses the basics of quantum computing..."
    }
  ]
}
```