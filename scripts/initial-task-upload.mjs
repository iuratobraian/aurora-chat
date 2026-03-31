import fs from "fs";
import notionSync from "./aurora-notion-sync.mjs";

async function uploadTasks() {
  const taskFilePath = "C:/Users/iurato/.gemini/antigravity/brain/d596ded8-5ea6-4495-98ec-f67a442efbde/task.md";
  if (!fs.existsSync(taskFilePath)) {
    console.error("Task file not found at:", taskFilePath);
    process.exit(1);
  }

  const content = fs.readFileSync(taskFilePath, "utf8");
  const lines = content.split("\n");
  
  const tasks = [];
  let currentCategory = "General";

  for (const line of lines) {
    if (line.startsWith("###")) {
      currentCategory = line.replace("###", "").trim();
    } else if (line.trim().startsWith("- [ ]")) {
      tasks.push({
        title: line.replace("- [ ]", "").trim(),
        category: currentCategory
      });
    }
  }

  console.log(`Found ${tasks.length} pending tasks to upload.`);

  for (const task of tasks) {
    console.log(`Uploading: ${task.title}...`);
    try {
      await notionSync.createPage(task.title, `Category: ${task.category}`, {
        status: { status: { name: "Sin empezar" } },
        priority: { rich_text: [{ text: { content: "Medium" } }] }
      });
    } catch (err) {
      console.error(`Failed to upload task: ${task.title}`, err.message);
    }
  }

  console.log("Upload completed.");
}

uploadTasks();
