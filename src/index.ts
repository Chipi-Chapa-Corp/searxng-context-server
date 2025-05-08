#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
	CallToolRequestSchema,
	ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { searchWeb } from "./searxng.js";

const server = new Server(
	{
		name: "searxng-context-server",
		version: "1.0.0",
	},
	{
		capabilities: {
			tools: {},
		},
	},
);

const apiUrl = process.env.API_URL;
if (typeof apiUrl === "undefined" || apiUrl.trim().length === 0) {
	console.error("Please provide a API_URL environment variable");
	process.exit(1);
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
	return {
		tools: [
			{
				name: "search",
				description: "Search the web for information",
				inputSchema: {
					type: "object",
					properties: {
						query: {
							type: "string",
							description: "The search query",
						},
					},
					required: ["query"],
				},
			},
		],
	};
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
	if (request.params.name === "search") {
		const query = request.params.arguments?.query;

		if (typeof query !== "string" || query.trim().length === 0) {
			throw new Error("Invalid query: query must be a non-empty string");
		}

		const response = await searchWeb(query);

		if (!response.ok) {
			throw new Error(`Search failed: ${response.error}`);
		}

		return {
			content: [
				{
					type: "text",
					text: JSON.stringify(response.result, undefined, 2),
				},
			],
		};
	}

	throw new Error(`Tool not found: ${request.params.name}`);
});

async function runServer() {
	const transport = new StdioServerTransport();
	await server.connect(transport);
}

runServer().catch((error) => {
	console.error(error);
	process.exit(1);
});
