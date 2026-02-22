const TELEMETRY_ENV_VARS = ["TDD_TELEMETRY", "DO_NOT_TRACK"];

let _enabled: boolean | null = null;

export function isTelemetryEnabled(): boolean {
  if (_enabled !== null) return _enabled;

  for (const envVar of TELEMETRY_ENV_VARS) {
    const val = process.env[envVar];
    if (val === "0" || val === "false") {
      _enabled = false;
      return false;
    }
  }

  if (process.env.CI) {
    _enabled = false;
    return false;
  }

  _enabled = true;
  return true;
}

export function trackCommand(command: string, version: string): void {
  if (!isTelemetryEnabled()) return;
  // Placeholder: in production this would send an anonymous event
  // containing only {command, version} — no arguments, paths, or PII.
  void command;
  void version;
}
