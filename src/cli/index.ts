import { Command } from "commander";
import { initCommand } from "../commands/init.js";
import {
  changeCommand,
  listCommand,
  showCommand,
  statusCommand,
  validateCommand,
  archiveCommand,
} from "../commands/change.js";
import { schemaCommand } from "../commands/schema.js";
import { updateCommand } from "../commands/update.js";
import { viewCommand } from "../commands/view.js";

const program = new Command()
  .name("tdd")
  .description("Test-driven development framework for AI coding assistants")
  .version("0.1.0");

program.addCommand(initCommand);
program.addCommand(changeCommand);
program.addCommand(listCommand);
program.addCommand(showCommand);
program.addCommand(statusCommand);
program.addCommand(validateCommand);
program.addCommand(archiveCommand);
program.addCommand(schemaCommand);
program.addCommand(updateCommand);
program.addCommand(viewCommand);

program.parse();
