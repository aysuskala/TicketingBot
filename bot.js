const express = require('express');
const app = express();
const PORT = process.env.WEBHOOK_PORT || 3000;

// Handle GET request from TicketsBot
app.get('/ticketsbot-webhook', (req, res) => {
    console.log('Incoming webhook:', req.query);

    // Check if TicketsBot sent a user ID
    if (!req.query.user_id) {
        console.error('❌ Missing user_id parameter in webhook request');
        return res.status(400).json({ error: 'Missing user_id parameter' });
    }

    // Log the received user ID
    console.log(`✅ Received user_id: ${req.query.user_id}`);

    // Respond with success (TicketsBot expects a JSON response)
    res.json({ message: 'Webhook received successfully', user_id: req.query.user_id });
});

// Start the server
app.listen(PORT, () => console.log(`Webhook server running on port ${PORT}`));


//const STAFF_ROLE_ID = "1340489220665376768"; // Replace with the staff role ID
const { Client, GatewayIntentBits, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers]
});

// ID of the channel where this embed should appear
const MIDDLEMAN_CHANNEL_ID = '1340395434908319744';

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    
    // Send the embed message when the bot starts
    const channel = client.channels.cache.get(MIDDLEMAN_CHANNEL_ID);
    if (channel) {
        const embed = new EmbedBuilder()
            .setColor(0x00AE86)
            .setTitle("Middleman")
            .setDescription("• **In need of a middleman?** Follow our [**TOS**](https://discord.com/termsjj) \n • You're **required** to vouch the middleman after the trade. If you fail to do this within **24 hours**, you will be **banned** from using our services\n • Creating a **troll/time-wasting ticket** will result in a middleman ban\n • We are **NOT** responsible for anything that happens after the trade is done. As well as any **duped** items.")
            .setImage("https://media.discordapp.net/attachments/1332606183722188882/1332761976777998367/image.png?ex=67b17590&is=67b02410&hm=669fc5542ee090996d8c9dc5e55b7e89336e0235722c54b82c132b40a20fdfb4&format=webp&quality=lossless&width=470&height=123&")
            .setFooter({
              text: "Powered by ticketsbot.net",
              iconURL: client.user.displayAvatarURL(),
            });

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('middleman_menu')
            .setPlaceholder('Select a topic...')
            .addOptions([
                {
                    label: '🍰 Middleman',
                    value: 'middleman_request',
                },
                {
                    label: '🍰 Report',
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
                .setStyle(TextInputStyle.Short)
                .setRequired(false); // Removes red asterisk

            const privateServerInput = new TextInputBuilder()
                .setCustomId('private_server')
                .setLabel('Can you join a private server?')
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            const tradeInfoInput = new TextInputBuilder()
                .setCustomId('trade_info')
                .setLabel('What is the trade?')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false);

            const firstRow = new ActionRowBuilder().addComponents(devIdInput);
            const secondRow = new ActionRowBuilder().addComponents(privateServerInput);
            const thirdRow = new ActionRowBuilder().addComponents(tradeInfoInput);

            modal.addComponents(firstRow, secondRow, thirdRow);

            await interaction.showModal(modal).catch(console.error);
        } else if (interaction.values[0] === 'report_issue') {
            // Reply with an ephemeral error message
            await interaction.reply({ content: "You don't have permission to report issues.", ephemeral: true });
        }
    }
});


// Login to Discord
client.login(process.env.DISCORD_TOKEN);


