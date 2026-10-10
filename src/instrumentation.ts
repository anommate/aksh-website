// Runs once when a server instance starts (`next dev`, `next start`), before
// it handles requests, so invalid configuration stops the server instead of
// failing every request. `next build` does not call register(): the same build
// serves preview and production, and APP_MODE is chosen when it starts.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { assertConfigAtStartup } = await import("./lib/config/startup");
    assertConfigAtStartup();
  }
}
