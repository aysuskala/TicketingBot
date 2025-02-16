const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const PORT = process.env.WEBHOOK_PORT || 3000;

const app = express();
const PORT = process.env.WEBHOOK_PORT || 3000;
app.use(bodyParser.json());

const STAFF_ROLE_ID = "YOUR_STAFF_ROLE_ID"; // Replace with the staff role ID
const TICKETS_CHANNEL_ID = "YOUR_TICKETS_CHANNEL_ID"; // Replace with ticket logs channel ID

// Webhook endpoint to handle TicketsBot events
app.get('/ticketsbot-webhook', (req, res) => {
    const userId = req.query.discord; // Extract user ID from request

    if (!userId) {
        return res.status(400).json({ error: 'Missing user_id parameter' });
    }

    // Respond with JSON (Modify this if needed)
    res.json({
        success: true,
        message: `Received request for user ID: ${userId}`,
        assigned_staff: "None (Auto-assignment in progress)"
    });
});

async function mentionAssignedStaff(ticketChannelId, staffMemberId) {
  const channel = client.channels.cache.get(ticketChannelId);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle("Ticket Claimed")
    .setDescription(
      `<@${staffMemberId}> has been assigned to this middleman ticket.`
    )
    .setColor("BLUE");

  await channel.send({ content: `<@${staffMemberId}>`, embeds: [embed] });
}

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);

app.listen(PORT, () => {
  console.log(`Webhook server running on port ${PORT}`);
});
