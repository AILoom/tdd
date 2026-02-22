import { Command } from "commander";
import { checkbox } from "@inquirer/prompts";
import { initProject, getAvailableTools } from "../core/init.js";
import { success, warn, info } from "../ui/format.js";

export const initCommand = new Command("init")
  .description("Initialize TDD in your project")
  .option("--tools <tools>", "Comma-separated tool IDs (or 'all', 'none')")
  .option("--schema <schema>", "Default schema to use", "test-driven")
  .action(async (options) => {
    const projectRoot = process.cwd();

    let tools: string[] = [];
    if (options.tools) {
      if (options.tools === "all") {
        tools = getAvailableTools().map((t) => t.id);
      } else if (options.tools !== "none") {
        tools = options.tools.split(",").map((t: string) => t.trim());
      }
    } else {
      const available = getAvailableTools();
      tools = await checkbox({
        message: "Which AI tools do you use?",
        choices: available.map((t) => ({
          name: t.name,
          value: t.id,
        })),
      });
    }

    const result = initProject(projectRoot, {
      tools,
      schema: options.schema,
    });

    if (result.alreadyExists) {
      console.log(warn("TDD directory already exists. Updated configuration."));
    } else {
      console.log(success("Initialized TDD in your project."));
    }

    console.log();
    console.log("Created:");
    for (const p of result.created) {
      console.log(`  ${info(p)}`);
    }

    if (tools.length > 0) {
      console.log();
      console.log(
        success(`Installed integrations for: ${tools.join(", ")}`),
      );
    }

    console.log();
    console.log("Next steps:");
    console.log("  Tell your AI: /tdd:new <change-name>");
  });
