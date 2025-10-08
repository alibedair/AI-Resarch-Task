import axios from 'axios';
import * as cheerio from 'cheerio';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ResearchResult {
  title: string;
  url: string;
  summary: string;
}

export async function performResearch(query: string): Promise<{ query: string; summary: string; sources: ResearchResult[] }> {
  
  const searchResults = await searchWeb(query);

  const sources: ResearchResult[] = [];
  let allSummaries = '';
  for (const result of searchResults.slice(0, 3)) {
    try {
      const content = await fetchPageContent(result.link);
      const summary = await summarizeWithLLM(content, query);
      sources.push({
        title: result.title,
        url: result.link,
        summary,
      });
      allSummaries += summary + '\n';
    } catch (error) {
      console.error(`SKIP processing this result ${result.link}:`, error);
    }
  }

  const overallSummary = await summarizeOverall(allSummaries, query);

  return { query, summary: overallSummary, sources };
}

async function searchWeb(query: string): Promise<any[]> {
  const response = await axios.get('https://serpapi.com/search', {
    params: {
      q: query,
      api_key: process.env.SERPAPI_API_KEY,
      num: 5,
    },
  });
  return response.data.organic_results || [];
}

async function fetchPageContent(url: string): Promise<string> {
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    },
    timeout: 10000,
  });
  const $ = cheerio.load(response.data);
  $('script, style, nav, header, footer, aside').remove();
  return $('body').text().replace(/\s+/g, ' ').trim().substring(0, 5000);
}

async function summarizeWithLLM(content: string, query: string): Promise<string> {
  const prompt = `Summarize the following content in relation to the query "${query}". Provide a concise summary of key points, focusing on the most relevant information. Limit to 200 words.

Content: ${content}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 300,
  });

  return response.choices[0].message.content?.trim() || 'Summary not available';
}

async function summarizeOverall(summaries: string, query: string): Promise<string> {
  const prompt = `Based on the following individual summaries related to the query "${query}", provide an overall comprehensive summary. Synthesize the key information and insights. Limit to 300 words.

Summaries:
${summaries}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 400,
  });

  return response.choices[0].message.content?.trim() || 'Overall summary not available';
}