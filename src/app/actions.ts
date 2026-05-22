"use server";

export async function sendFeedback(name: string, email: string, message: string) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  
  if (!webhookUrl) {
    throw new Error("Discord webhook URL is not configured.");
  }

  // Generate the exact timestamp on the server
  const timestamp = new Date().toISOString();

  const payload = {
    embeds: [
      {
        title: "New Eid Capsule Feedback",
        color: 3066993, // A nice emerald green color
        fields: [
          { name: "Name", value: name || "Anonymous", inline: true },
          { name: "Email", value: email || "No email provided", inline: true },
          { name: "Message", value: message },
          { name: "Timestamp", value: timestamp }
        ],
      },
    ],
  };

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to send feedback to Discord.");
  }
}
