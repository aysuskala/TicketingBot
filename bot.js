const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.WEBHOOK_PORT || 3000;
app.use(bodyParser.json());

const STAFF_ROLE_ID = "1340489220665376768"; // Replace with the staff role ID
const TICKETS_CHANNEL_ID = "1340395434908319744"; // Replace with ticket logs channel ID

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

const { Client, GatewayIntentBits, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers]
});

// ID of the channel where this embed should appear
const MIDDLEMAN_CHANNEL_ID = 'YOUR_CHANNEL_ID_HERE';

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    
    // Send the embed message when the bot starts
    const channel = client.channels.cache.get(MIDDLEMAN_CHANNEL_ID);
    if (channel) {
        const embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle('Middleman & Reports')
            .setDescription('Select an option below to continue.');

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('middleman_menu')
            .setPlaceholder('Choose an option...')
            .addOptions([
                {
                    label: 'Middleman',
                    description: 'Request a middleman for your trade.',
                    value: 'middleman_request',
                },
                {
                    label: 'Report',
                    description: 'Report a user or issue.',
                    value: 'report_issue',
                }
            ]);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        channel.send({ embeds: [embed], components: [row] });
    } else {
        console.log('Middleman channel not found.');
    }
});

// Handle dropdown interactions
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;

    if (interaction.customId === 'middleman_menu') {
        if (interaction.values[0] === 'middleman_request') {
            // Open the modal for Middleman request
            const modal = new ModalBuilder()
                .setCustomId('middleman_modal')
                .setTitle('Middleman Request');

            const devIdInput = new TextInputBuilder()
                .setCustomId('dev_id')
                .setLabel('Input Dev ID or Tag')
                .setStyle(TextInputStyle.Short);

            const privateServerInput = new TextInputBuilder()
                .setCustomId('private_server')
                .setLabel('Can you join a private server?')
                .setStyle(TextInputStyle.Short);

            const tradeInfoInput = new TextInputBuilder()
                .setCustomId('trade_info')
                .setLabel('What is the trade?')
                .setStyle(TextInputStyle.Paragraph);

            const firstRow = new ActionRowBuilder().addComponents(devIdInput);
            const secondRow = new ActionRowBuilder().addComponents(privateServerInput);
            const thirdRow = new ActionRowBuilder().addComponents(tradeInfoInput);

            modal.addComponents(firstRow, secondRow, thirdRow);

            await interaction.showModal(modal);
        } else if (interaction.values[0] === 'report_issue') {
            // Reply with a permission error
            await interaction.reply({ content: "You don't have permission to report issues.", ephemeral: true });
        }
    }
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);

