const mongoose = require("mongoose");
const fs = require('fs');
const envFile = fs.readFileSync('.env', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    process.env[key.trim()] = values.join('=').trim().replace(/^"|"/g, '');
  }
});

const extractTextFromTipTap = (node) => {
  if (!node) return "";
  if (node.type === "text") return node.text || "";
  if (Array.isArray(node.content)) {
    return node.content.map(extractTextFromTipTap).join(" ");
  }
  return "";
};

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");
  
  const db = mongoose.connection.db;
  const entries = await db.collection("diaryentries").find({}).toArray();
  
  let updatedCount = 0;
  for (const entry of entries) {
    if (entry.plainTextPreview && entry.plainTextPreview.includes('{"type":"doc"')) {
      const plainText = extractTextFromTipTap(entry.content).substring(0, 300);
      await db.collection("diaryentries").updateOne(
        { _id: entry._id },
        { $set: { plainTextPreview: plainText } }
      );
      updatedCount++;
    }
  }
  
  console.log(`Updated ${updatedCount} entries with malformed previews.`);
  process.exit(0);
}

run().catch(console.error);
