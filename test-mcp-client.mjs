import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "/home/aibot/.nvm/versions/node/v24.16.0/bin/node",
  args: ["/home/aibot/walrus-session7/memwal-sdk-mcp.mjs"],
  env: {
    ...process.env,
  },
});

const client = new Client(
  {
    name: "memwal-wrapper-test",
    version: "1.0.0",
  },
  {
    capabilities: {},
  }
);

try {
  console.log("Connecting...");
  await client.connect(transport);

  console.log("Connected.");

  const tools = await client.listTools();

  console.log("Tools:");
  console.dir(tools, { depth: null });

  await client.close();
} catch (err) {
  console.error("MCP client test failed:");
  console.error(err);
  process.exitCode = 1;
}
