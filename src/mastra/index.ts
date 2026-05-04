import { Mastra } from '@mastra/core';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { LangSmithExporter } from '@mastra/langsmith';
import { Observability } from '@mastra/observability';
import { chatAgent } from './agents/chatAgent';
import { reasoningAgent } from './agents/reasoningAgent';
import { weatherAgent } from './agents/weather-agent';

export const mastra = new Mastra({
  agents: { chatAgent, reasoningAgent, weatherAgent },
  storage: new LibSQLStore({
    id: "mastra-storage",
    url: "file:./mastra.db",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: (process.env.LOG_LEVEL as any) || 'info',
  }),
  observability: new Observability({
    configs: {
      langsmith: {
        serviceName: 'agentic-mastra-bot',
        exporters: [
          new LangSmithExporter({
            apiKey: process.env.LANGSMITH_API_KEY,
          }),
        ],
      },
    },
  })
});
