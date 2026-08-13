import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { MemWal } from "@mysten-incubation/memwal";

const {
  MEMWAL_PRIVATE_KEY,
  MEMWAL_ACCOUNT_ID,
  MEMWAL_SERVER_URL = "https://relayer.memory.walrus.xyz",
} = process.env;

if (!MEMWAL_PRIVATE_KEY || !/^[0-9a-fA-F]{64}$/.test(MEMWAL_PRIVATE_KEY)) {
  console.error("MEMWAL_PRIVATE_KEY missing or invalid.");
  process.exit(1);
}

if (!MEMWAL_ACCOUNT_ID || !/^0x[0-9a-fA-F]{64}$/.test(MEMWAL_ACCOUNT_ID)) {
  console.error("MEMWAL_ACCOUNT_ID missing or invalid.");
  process.exit(1);
}

const memwal = MemWal.create({
  key: MEMWAL_PRIVATE_KEY,
  accountId: MEMWAL_ACCOUNT_ID,
  serverUrl: MEMWAL_SERVER_URL,
});

const server = new McpServer({
  name: "memwal-sdk-local",
  version: "1.0.0",
});

server.tool(
  "memwal_health",
  "Check Walrus Memory relayer health.",
  {},
  async () => {
    const result = await memwal.health();
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "memwal_recall",
  "Semantic search across Walrus Memory.",
  {
    query: z.string(),
    namespace: z.string().optional(),
    limit: z.number().int().min(1).max(100).optional(),
  },
  async ({ query, namespace, limit }) => {
    const result = await memwal.recall({
      query,
      namespace,
      limit: limit ?? 10,
    });

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "memwal_remember",
  "Save one durable memory to Walrus Memory and wait for completion.",
  {
    text: z.string(),
    namespace: z.string().optional(),
  },
  async ({ text, namespace }) => {
    const result = await memwal.rememberAndWait(text, namespace);

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "memwal_remember_bulk",
  "Save multiple durable memories to Walrus Memory.",
  {
    items: z.array(
      z.object({
        text: z.string(),
        namespace: z.string().optional(),
      })
    ).min(1).max(20),
  },
  async ({ items }) => {
    const result = await memwal.rememberBulkAndWait(items);

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "memwal_analyze",
  "Extract durable facts from text and save them to Walrus Memory.",
  {
    text: z.string(),
    namespace: z.string().optional(),
  },
  async ({ text, namespace }) => {
    const result = await memwal.analyze(text, namespace);

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "memwal_restore",
  "Restore missing indexed entries for a namespace.",
  {
    namespace: z.string(),
    limit: z.number().int().min(1).max(100).optional(),
  },
  async ({ namespace, limit }) => {
    const result = await memwal.restore(namespace, limit ?? 10);

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
