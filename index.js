const {
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
} = require("discord.js");

require("dotenv").config();

const botToken = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;

if (!botToken) {
    throw new Error("Missing DISCORD_BOT_TOKEN. Add it in Replit Secrets before starting the bot.");
}

if (!clientId) {
    throw new Error("Missing DISCORD_CLIENT_ID. Add it in the project environment settings.");
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

let activeGame = null;

const commands = [
    new SlashCommandBuilder().setName("start").setDescription("Start a new draft game"),
    new SlashCommandBuilder().setName("join").setDescription("Join the draft game"),
    new SlashCommandBuilder().setName("end").setDescription("End the current draft game"),
    new SlashCommandBuilder().setName("startsolo").setDescription("Start a solo draft game against the computer"),
].map((command) => command.toJSON());

async function registerCommands() {
    const rest = new REST({ version: "10" }).setToken(botToken);
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log("Commands registered.");
}

client.once("clientReady", (readyClient) => {
    console.log(`Logged in as ${readyClient.user.tag}.`);
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand() && !interaction.isStringSelectMenu()) return;

    // /start
    if (interaction.commandName === "start") {
        if (activeGame) {
            const embed = new EmbedBuilder()
                .setColor(0xff5555)
                .setTitle("⚠️ A game is already running!")
                .setDescription("Please wait until the current game finishes before starting a new one.")
                .setFooter({ text: "osu!draft bot" })
                .setTimestamp();
            return interaction.reply({ embeds: [embed] });
        }

        activeGame = {
            host: interaction.user.id,
            players: [interaction.user.id],
            status: "waiting",
            mode: null,
        };

        const embed = new EmbedBuilder()
            .setColor(0x00ae86)
            .setTitle("🎮 osu!draft Game Started")
            .setDescription(`Game started by <@${interaction.user.id}>.\nWaiting for player 2 to type **/join**...`)
            .setFooter({ text: "osu!draft bot" })
            .setTimestamp();

        const modeMenu = new StringSelectMenuBuilder()
            .setCustomId("select_mode")
            .setPlaceholder("Select a game mode")
            .addOptions([
                {
                    label: "4K MWC 2026",
                    description: "Official 4-Key World Cup 2026 mode",
                    value: "4k_mwc_2026",
                },
            ]);

        const row = new ActionRowBuilder().addComponents(modeMenu);
        return interaction.reply({ embeds: [embed], components: [row] });
    }

    // /startsolo
    if (interaction.commandName === "startsolo") {
        if (activeGame) {
            const embed = new EmbedBuilder()
                .setColor(0xff5555)
                .setTitle("⚠️ A game is already running!")
                .setDescription("Please end the current game before starting a solo match.")
                .setFooter({ text: "osu!draft bot" })
                .setTimestamp();
            return interaction.reply({ embeds: [embed] });
        }

        activeGame = {
            host: interaction.user.id,
            players: [interaction.user.id, "Computer"],
            status: "solo",
            mode: "4k_mwc_2026",
        };

        const embed = new EmbedBuilder()
            .setColor(0x00ae86)
            .setTitle("🎮 osu!draft Solo Game Started")
            .setDescription(
                `Solo match started by <@${interaction.user.id}>!\nYou’re playing against **Computer 🤖** in **4K MWC 2026** mode.\nLet the draft begin!`
            )
            .setFooter({ text: "osu!draft bot" })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }

    // Mode selection
    if (interaction.isStringSelectMenu() && interaction.customId === "select_mode") {
        if (!activeGame) {
            return interaction.update({ content: "There is no active game.", embeds: [], components: [] });
        }

        const selectedMode = interaction.values[0];
        activeGame.mode = selectedMode;

        const embed = new EmbedBuilder()
            .setColor(0xffd700)
            .setTitle("✅ Game Mode Selected")
            .setDescription(`You selected **${selectedMode.replace(/_/g, " ").toUpperCase()}**!\nWaiting for player 2 to join...`)
            .setFooter({ text: "osu!draft bot" })
            .setTimestamp();

        return interaction.update({ embeds: [embed], components: [] });
    }

    // /join
    if (interaction.commandName === "join") {
        if (!activeGame) {
            const embed = new EmbedBuilder()
                .setColor(0xff5555)
                .setTitle("❌ No active game!")
                .setDescription("Use **/start** to begin a new game.")
                .setFooter({ text: "osu!draft bot" })
                .setTimestamp();
            return interaction.reply({ embeds: [embed] });
        }

        if (activeGame.players.includes(interaction.user.id)) {
            const embed = new EmbedBuilder()
                .setColor(0xff5555)
                .setTitle("⚠️ You are already in the game!")
                .setFooter({ text: "osu!draft bot" })
                .setTimestamp();
            return interaction.reply({ embeds: [embed] });
        }

        if (activeGame.players.length >= 2) {
            const embed = new EmbedBuilder()
                .setColor(0xff5555)
                .setTitle("🚫 Game is full!")
                .setDescription("There are already 2 players in this game.")
                .setFooter({ text: "osu!draft bot" })
                .setTimestamp();
            return interaction.reply({ embeds: [embed] });
        }

        activeGame.players.push(interaction.user.id);
        activeGame.status = "ready";

        const embed = new EmbedBuilder()
            .setColor(0xffd700)
            .setTitle("✅ Player 2 Joined!")
            .setDescription(`Player 2 (<@${interaction.user.id}>) has joined.\nThe draft begins now!`)
            .setFooter({ text: "osu!draft bot" })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }

    // /end
    if (interaction.commandName === "end") {
        if (!activeGame) {
            const embed = new EmbedBuilder()
                .setColor(0xff5555)
                .setTitle("❌ No active game to end!")
                .setDescription("Start a game with **/start**.")
                .setFooter({ text: "osu!draft bot" })
                .setTimestamp();
            return interaction.reply({ embeds: [embed] });
        }

        if (interaction.user.id !== activeGame.host) {
            const embed = new EmbedBuilder()
                .setColor(0xff5555)
                .setTitle("🚫 You are not the host!")
                .setDescription("Only the player who started the game can end it.")
                .setFooter({ text: "osu!draft bot" })
                .setTimestamp();
            return interaction.reply({ embeds: [embed] });
        }

        activeGame = null;

        const embed = new EmbedBuilder()
            .setColor(0x00ae86)
            .setTitle("🛑 Game Ended")
            .setDescription("The current osu!draft game has been ended.")
            .setFooter({ text: "osu!draft bot" })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
});

async function start() {
    await registerCommands();
    await client.login(botToken);
}

async function shutdown(signal) {
    console.log(`${signal} received. Shutting down Discord client.`);
    client.destroy();
    process.exit(0);
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

start().catch((error) => {
    console.error("Discord bot failed to start:", error);
    process.exit(1);
});
