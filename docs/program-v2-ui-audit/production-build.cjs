/** @format */
// Те же production-оптимизации, без недоступного в Cloud скачивания Google Fonts.
const { workspaces, logging } = require("@angular-devkit/core");
const { NodeJsSyncHost } = require("@angular-devkit/core/node");
const { Architect } = require("@angular-devkit/architect");
const { WorkspaceNodeModulesArchitectHost } = require("@angular-devkit/architect/node");
(async () => {
  const { workspace } = await workspaces.readWorkspace(
    "./angular.json",
    workspaces.createWorkspaceHost(new NodeJsSyncHost()),
  );
  const architect = new Architect(new WorkspaceNodeModulesArchitectHost(workspace, process.cwd()));
  const logger = new logging.Logger("production-build");
  logger.subscribe(entry => console.log(entry.message));
  const overrides = {
    optimization: {
      scripts: true,
      styles: { minify: true, inlineCritical: true },
      fonts: { inline: false },
    },
  };
  // Только для получения артефакта после отдельного сравнения исходных CSS-budget failures.
  if (process.env.PROGRAM_UI_COMPILE_ONLY === "1") overrides.budgets = [];
  const run = await architect.scheduleTarget(
    { project: "social_platform", target: "build", configuration: "production" },
    overrides,
    { logger },
  );
  const result = await run.result;
  console.log(
    JSON.stringify({
      success: result.success,
      fontInlining: false,
      originalBudgets: !overrides.budgets,
    }),
  );
  await run.stop();
  process.exitCode = result.success ? 0 : 1;
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
