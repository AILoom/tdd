import { Command } from "commander";
import { checkbox } from "@inquirer/prompts";
import { initProject, getAvailableTools } from "../core/init.js";
import { findProjectRoot } from "../utils/paths.js";
import { success, info } from "../ui/format.js";

export const updateCommand = new Command("update")
  .description("Regenerate AI tool integrations")
  .option("--tools <tools>", "Comma-separated tool IDs (or 'all')")
  .action(async (options) => {
    const projectRoot = findProjectRoot();

    let tools: string[];
    if (options.tools) {
      if (options.tools === "all") {
        tools = getAvailableTools().map((t) => t.id);
      } else {
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

    initProject(projectRoot, { tools });
    console.log(success("Regenerated AI tool integrations."));
    console.log(info(`Tools: ${tools.join(", ")}`));
  });
