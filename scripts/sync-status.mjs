import notionSync from "./aurora-notion-sync.mjs";

async function syncStatus() {
  const tasks = await notionSync.getTaskBoard();
  const backendTasks = [
    "Fix main feed post sync",
    "Fix private community posting",
    "Fix subcommunity creation auth"
  ];

  for (const t of tasks) {
    const title = t.properties?.Nombre?.title[0]?.plain_text;
    if (title && (
      title.includes("feed") || 
      title.includes("Private Community") || 
      title.includes("Subcommunities") || 
      title.includes("backend")
    )) {
      console.log("Updating task:", title);
      await notionSync.updateTaskStatus(t.id, "Listo", "Antigravity");
    }
  }
  console.log("Status sync completed.");
}

syncStatus();
