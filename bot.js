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

const app = express();
const PORT = process.env.WEBHOOK_PORT || 3000;
app.use(bodyParser.json());

const STAFF_ROLE_ID = "YOUR_STAFF_ROLE_ID"; // Replace with the staff role ID
const TICKETS_CHANNEL_ID = "YOUR_TICKETS_CHANNEL_ID"; // Replace with ticket logs channel ID

// Webhook endpoint to handle TicketsBot events
app.post("/ticketsbot-webhook", async (req, res) => {
  const { event, ticket, user } = req.body;
  if (!event || !ticket) return res.status(400).send("Invalid payload");

  if (event === "ticket_created") {
    const guild = client.guilds.cache.get(ticket.guild_id);
    if (!guild) return res.status(500).send("Guild not found");

    const onlineStaff = guild.members.cache
      .filter(
        (member) =>
          member.roles.cache.has(STAFF_ROLE_ID) &&
          member.presence?.status !== "offline"
      )
      .first();

    if (onlineStaff) {
      // Automatically claim the ticket (TicketsBot API request required here)
      await mentionAssignedStaff(ticket.channel_id, onlineStaff.user.id);
    }
  }

  res.send("Webhook received");
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
