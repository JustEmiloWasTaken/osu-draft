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
    throw new Error("Missing DISCORD_BOT_TOKEN. Add it in environment variables.");
}

if (!clientId) {
    throw new Error("Missing DISCORD_CLIENT_ID. Add it in environment variables.");
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

let activeGame = null;

const DRAFT_CHARACTERS = [
":flag_th: konkawe",":flag_cn :WOEM2436",":flag_us: Minwoo3098",":flag_kr: Naaaad",":flag_cl: Anterex",":flag_kr: imyeeyee",":flag_ca:Sawdust Inhaler",":flag_us:Seitora",
":flag_cl: myucchii",":flag_ru: Rinsresg",":flag_cz: grillroasted",":flag_hk: Kureha_",":flag_au: [LS]sdkl4",":flag_ru: riftoyu",":flag_es: ime",":flag_cn: [GB]ParasolTree",
":flag_th: --Pavin--",":flag_gb: spanner dude",":flag_au: oct4",":flag_mx: [BBC]Senzawa",":flag_ve: yeIo",":flag_sg: Big noob lol",":flag_pe: zinkotripas",":flag_fr: flowerful",
":flag_ca: theman234 tonk",":flag_ca: mae0149",":flag_my: Aepq",":flag_pl: klobuck",":flag_id: _yea",":flag_my: [MY] VASD",":flag_gb: Zoobin4",":flag_qa: Chara Undertale",
"zmxnksjd","Koishi Komeijie","Vixile","JayLye","Miwiki","XxNewson1234xX","snow leopard","stoneworm",
"_dev_","oyama mahiro","Unitori-","henryalexbr","Darkhechiser","-hakitsu","bambi fnf","TriDoanGaming",
"ggeexx1","zidae","Fier","Kalv","yut4a","eiEn_","Lighttt","bili_TYL","-Aishiteru-","borrys",
"maykolmejor","Fejse","lyvet","goodpuppygirl69","MiniEgg_23","AbriI","kapupa","Normai_","Vain_",
"Hawkfrost","ParadigmaticOwl","Naronii","Andoris","Nico777playz","SomeDumbEtDude","DarkMew2",
"KullaiPora","Wishtynite","Zatyuu","cycl1264","senkhyu","achii","Cyaewin","Bei","Znow","Pyn",
"My Angel Brandy","ruka","TMOperaO","MatchaLatte-","cllg","AFOTHER","Rushax","Maxtulini","ashurn",
"Ancuw","Seiong","Tomskuu","JoeyGYGY","kiwibird01","Komasel0","invadey","ItzCuy","madelief013",
"Abyss 0","Selcaan","xShyzDy","omireta","etterna in osu","Brofriendfnf","debuti","bagjettka",
"Rushenality","happergamer","Soyar","Addaamm007","[RUE]Jeunios","Kornjii","Napeace","Stereotype",
"- Croketa -","oliverq","SeiaYurizonoLin","Polygone","elicccc","Illya","icy23","medkit_chan",
"Danet","[Mom] xbob","Naito Mare","cyta_","JustEmilo","MISHASUMSKOY","ZefliN","keppruff",
"CurrenChan","Bl1x3r","djj492","Strachy","[LS]Robi","ibeagoodbed","Drippy Meep","xxxbruhmanxxx",
"- Nira -","Lotex09","nu0","Nubbo123","pofnkul","Tealen","MadSoiled","FroceST","brochyper",
"sintezator","SUNec4_","[Crz]Miyako","WTFrrrrrrr","- Lucy","NeroWye","Pyrin","Psyche03",
"Chicodouille","zwhy135","Emptiness","markzical","PaulIsGaming","Spaaget","Varunaxx","hoshiteru",
"Miyai-","rodrigo721","D_ENA","-Lalito898","thekakapotato","F y S o f t BR","[GS]Antonio","wlim",
"endernubek","ParaLythical","Kopie115","DELAS4","- Stay -","XenicXutron1","Lyscence","sophhhia",
"F1Shie","[UY]Syphoryx","Lemmie","Delphin1","Shynii","better than me","flyerbram002","StupidSnake",
"CosteEDI193","myzu","Aronia-","Fraz3r-","iParacosm","Mortelspawn_","parac0sm","MyAngelGanyu",
"osu playsus","Johnney101","Danksquidboy","ht2","xtopes101","Ticy","iac91","32facts","bisti",
"babah79","TimePass","iKyzher","FunkyDZ09","Spongybit","Theangeloflie","-Molar-","spocs",
"Taksma","volcanic","youku fixer","Alekks_","Hiskon","daniel_torup","CrashSmash","Bogie",
"coolguyplayer","SadWrist","Arctis","re_zacoriginist","Gamtor Games","eis idk","- lucky -",
"itsNotFlames"
];

const MAP_POOL = [
    "🔵 Stage 1: katter - DOPA BRAT",
    "🟠 Stage 2: Juka_Box feat. Souka - Macchi to Donchou",
    "🔴 Stage 3: Nanahoshi Kangengakudan feat. GUMI - FREEDMAN (Cut Ver.)",
    "🔴 Stage 4: seatrus - Kokan Sensou",
    "🟠 Stage 5: seatrus - TEMP3ST",
    "🔵 Stage 6: SAVE THE QUEEN - EX-Termination",
    "🔵 Stage 7: Machine Girl - Psychic Attack (Cut Ver.)"
];

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

client.once("ready", (readyClient) => {
    console.log(`Logged in as ${readyClient.user.tag}.`);
});

// Helper: start a draft round
function startDraftRound(channel) {
    if (!activeGame) return;

    if (activeGame.round > activeGame.maxRounds) {
        endDraft(channel);
        return;
    }

    if (activeGame.draftPool.length === 0) {
        endDraft(channel);
        return;
    }

    const index = Math.floor(Math.random() * activeGame.draftPool.length);
    const character = activeGame.draftPool.splice(index, 1)[0];

    activeGame.currentCharacter = character;
    activeGame.currentBid = 0;
    activeGame.currentBidder = null;
    activeGame.biddingOpen = true;

    if (activeGame.bidTimeout) {
        clearTimeout(activeGame.bidTimeout);
        activeGame.bidTimeout = null;
    }

    const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle(`📢 Round ${activeGame.round} — New Character!`)
        .setDescription(
            `**${character}** is up for bidding!\n\n` +
            `Each side has **$25** total.\n` +
            `Type a number in chat to place your bid.\n` +
            `You can type **pass** or **have it** to end the bidding.\n` +
            `If nobody bids for 10 seconds, the last bidder wins automatically.`
        )
        .setFooter({ text: "osu!draft bot" })
        .setTimestamp();

    channel.send({ embeds: [embed] });
}

// Helper: end draft completely
function endDraft(channel) {
    if (!activeGame) return;

    activeGame.biddingOpen = false;

    const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle("🏁 Draft Finished")
        .setDescription(
            `The draft has ended after **${activeGame.round - 1}** rounds.\n\n` +
            `**Team 1:**\n${activeGame.playerTeam.length ? activeGame.playerTeam.map((c) => `• ${c}`).join("\n") : "No picks"}\n\n` +
            `**Team 2:**\n${activeGame.opponentTeam.length ? activeGame.opponentTeam.map((c) => `• ${c}`).join("\n") : "No picks"}\n\n` +
            `Budgets left:\n` +
            `• Team 1: $${activeGame.playerBudget}\n` +
            `• Team 2: $${activeGame.opponentBudget}`
        )
        .setFooter({ text: "osu!draft bot" })
        .setTimestamp();

    channel.send({ embeds: [embed] });

    startMatchPhase(channel);
}
// --- Stage 2 Match Phase ---
function startMatchPhase(channel) {
    activeGame.matchPhase = true;

    const map = MAP_POOL[Math.floor(Math.random() * MAP_POOL.length)];
    activeGame.selectedMap = map;

    activeGame.playerPicks = [];
    activeGame.opponentPicks = [];
    activeGame.ready = {
        player1: false,
        player2: false
    };

    const embed = new EmbedBuilder()
        .setColor(0x00ae86)
        .setTitle("🎵 Match Phase Started")
        .setDescription(
            `Random map selected:\n**${map}**\n\n` +
            `Both players must select **3 players** from their roster.\n` +
            `You have **20 seconds**.\n` +
            `Use the selection menu below.`
        )
        .setFooter({ text: "osu!draft bot" })
        .setTimestamp();

    channel.send({ embeds: [embed] });

    sendPickMenu(channel);

    // 20 second timer
    setTimeout(() => {
        if (!activeGame.ready.player1 || !activeGame.ready.player2) {
            channel.send("⏱️ Time's up! Match starting with current selections.");
            startMatch(channel);
        }
    }, 20000);
}

function sendPickMenu(channel) {
    const roster1 = activeGame.playerTeam.map(c => ({ label: c, value: c }));
    const roster2 = activeGame.opponentTeam.map(c => ({ label: c, value: c }));

    const menu1 = new StringSelectMenuBuilder()
        .setCustomId("pick_p1")
        .setPlaceholder("Player 1: Select 3 players")
        .setMinValues(3)
        .setMaxValues(3)
        .addOptions(roster1);

    const menu2 = new StringSelectMenuMenuBuilder()
        .setCustomId("pick_p2")
        .setPlaceholder("Player 2: Select 3 players")
        .setMinValues(3)
        .setMaxValues(3)
        .addOptions(roster2);

    const row1 = new ActionRowBuilder().addComponents(menu1);
    const row2 = new ActionRowBuilder().addComponents(menu2);

    channel.send({ components: [row1, row2] });
}

function startMatch(channel) {
    const embed = new EmbedBuilder()
        .setColor(0xffd700)
        .setTitle("🔥 Match Starting!")
        .setDescription(
            `Map: **${activeGame.selectedMap}**\n\n` +
            `**Player 1 picks:**\n${activeGame.playerPicks.join("\n")}\n\n` +
            `**Player 2 picks:**\n${activeGame.opponentPicks.join("\n")}`
        )
        .setFooter({ text: "osu!draft bot" })
        .setTimestamp();

    channel.send({ embeds: [embed] });

    // Stage 3 can be added here later (scoring, winner, etc.)
}

// Helper: finish bidding for current character
function finishBidding(channel, reason) {
    if (!activeGame || !activeGame.biddingOpen) return;

    activeGame.biddingOpen = false;

    if (activeGame.bidTimeout) {
        clearTimeout(activeGame.bidTimeout);
        activeGame.bidTimeout = null;
    }

    if (!activeGame.currentBidder) {
        const embed = new EmbedBuilder()
            .setColor(0xe74c3c)
            .setTitle("⏱️ Bidding ended")
            .setDescription("No valid bids were placed. The character is discarded.")
            .setFooter({ text: "osu!draft bot" })
            .setTimestamp();
        channel.send({ embeds: [embed] });

// Check if either team reached 6 players
// Check if either team reached 6 players OR someone hit $0
const team1Full = activeGame.playerTeam.length >= 6;
const team2Full = activeGame.opponentTeam.length >= 6;
const someoneBroke = activeGame.playerBudget <= 0 || activeGame.opponentBudget <= 0;

// If both teams full → end draft
if (team1Full && team2Full) {
    endDraft(channel);
    return;
}

// If someone hit $0 OR one team is full → enter distribution phase
if (someoneBroke || team1Full || team2Full) {
    activeGame.distributionPhase = true;

    // Determine distributor (the one who still has money)
    if (activeGame.playerBudget > 0 && activeGame.opponentBudget <= 0) {
        activeGame.distributor = activeGame.players[0];
    } else if (activeGame.opponentBudget > 0 && activeGame.playerBudget <= 0) {
        activeGame.distributor = activeGame.players[1];
    } else {
        // If one team is full, the other distributes
        activeGame.distributor = team1Full ? activeGame.players[1] : activeGame.players[0];
    }

    activeGame.remainingPool = [...activeGame.draftPool];
    activeGame.draftPool = [];

    const embed = new EmbedBuilder()
        .setColor(0xffd700)
        .setTitle("⚠️ Distribution Phase Started")
        .setDescription(
            `One side can no longer bid.\n` +
            `The remaining characters must be distributed manually.\n\n` +
            `**Distributor:** <@${activeGame.distributor}>\n\n` +
            `**Remaining characters:**\n${activeGame.remainingPool.map(c => `• ${c}`).join("\n")}\n\n` +
            `Type **take** to claim the next character.\n` +
            `Type **give** to give it to the other player.\n\n` +
            `Continue until both teams reach 6 players.`
        );

    channel.send({ embeds: [embed] });
    return;
}

// Continue normally
activeGame.round += 1;
startDraftRound(channel);


if (team1Full || team2Full) {
    // Give remaining characters to the other team
    while (activeGame.draftPool.length > 0) {
        const leftover = activeGame.draftPool.pop();
        if (!team1Full) {
            activeGame.playerTeam.push(leftover);
        } else {
            activeGame.opponentTeam.push(leftover);
        }
    }

    // End draft immediately
    endDraft(channel);
    return;
}

// Continue normally
activeGame.round += 1;
startDraftRound(channel);

        return;
    }

    const winner = activeGame.currentBidder;
    const amount = activeGame.currentBid;
    const character = activeGame.currentCharacter;

    let winnerLabel = "";
    if (activeGame.status === "solo") {
        if (winner === activeGame.players[0]) {
            winnerLabel = `<@${winner}> (You)`;
            activeGame.playerBudget -= amount;
            activeGame.playerTeam.push(character);
        } else {
            winnerLabel = `Computer 🤖`;
            activeGame.opponentBudget -= amount;
            activeGame.opponentTeam.push(character);
        }
    } else {
        if (winner === activeGame.players[0]) {
            winnerLabel = `<@${winner}> (Player 1)`;
            activeGame.playerBudget -= amount;
            activeGame.playerTeam.push(character);
        } else {
            winnerLabel = `<@${winner}> (Player 2)`;
            activeGame.opponentBudget -= amount;
            activeGame.opponentTeam.push(character);
        }
    }

    const embed = new EmbedBuilder()
        .setColor(0x9b59b6)
        .setTitle("✅ Bidding Finished")
        .setDescription(
    `**${character}** was won by ${winnerLabel} for **$${amount}**.\n\n` +
    `Reason: **${reason === "timeout" ? "No bids for 10 seconds" : "Player ended bidding"}**\n\n` +
    `**Team 1 roster:**\n${activeGame.playerTeam.length ? activeGame.playerTeam.map(c => `• ${c}`).join("\n") : "No picks yet"}\n\n` +
    `**Team 2 roster:**\n${activeGame.opponentTeam.length ? activeGame.opponentTeam.map(c => `• ${c}`).join("\n") : "No picks yet"}\n\n` +
    `**Budgets:**\n` +
    `• Team 1: $${activeGame.playerBudget}\n` +
    `• Team 2: $${activeGame.opponentBudget}`
)
        .setFooter({ text: "osu!draft bot" })
        .setTimestamp();

    channel.send({ embeds: [embed] });

    activeGame.round += 1;
    startDraftRound(channel);
}

// Helper: bot AI bidding (solo mode)
function botAIBid(channel) {
    if (!activeGame || activeGame.status !== "solo") return;
    if (!activeGame.biddingOpen) return;

    const botBudget = activeGame.opponentBudget;
    const currentBid = activeGame.currentBid;

    // Simple AI: sometimes outbids if it can afford
    if (botBudget <= currentBid) {
        // Can't afford to outbid
        const embed = new EmbedBuilder()
            .setColor(0x95a5a6)
            .setTitle("🤖 Computer passes")
            .setDescription("Computer decided not to outbid you.")
            .setFooter({ text: "osu!draft bot" })
            .setTimestamp();
        channel.send({ embeds: [embed] });
        return;
    }

    // Decide whether to bid or pass
    const shouldBid = Math.random() < 0.6; // 60% chance to bid

    if (!shouldBid) {
        const embed = new EmbedBuilder()
            .setColor(0x95a5a6)
            .setTitle("🤖 Computer passes")
            .setDescription("Computer decided to let you have it.")
            .setFooter({ text: "osu!draft bot" })
            .setTimestamp();
        channel.send({ embeds: [embed] });
        return;
    }

    const newBid = currentBid + 1;

    if (newBid > botBudget) {
        const embed = new EmbedBuilder()
            .setColor(0x95a5a6)
            .setTitle("🤖 Computer can't afford higher bid")
            .setDescription("Computer doesn't have enough budget to outbid you.")
            .setFooter({ text: "osu!draft bot" })
            .setTimestamp();
        channel.send({ embeds: [embed] });
        return;
    }

    activeGame.currentBid = newBid;
    activeGame.currentBidder = "Computer";

    const embed = new EmbedBuilder()
        .setColor(0x1abc9c)
        .setTitle("🤖 Computer bids")
        .setDescription(`Computer bids **$${newBid}**!`)
        .setFooter({ text: "osu!draft bot" })
        .setTimestamp();

    channel.send({ embeds: [embed] });

    if (activeGame.bidTimeout) {
        clearTimeout(activeGame.bidTimeout);
    }
    activeGame.bidTimeout = setTimeout(() => {
        finishBidding(channel, "timeout");
    }, 10000);
}

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
            channelId: interaction.channel.id,

            draftPool: [...DRAFT_CHARACTERS],
            playerBudget: 25,
            opponentBudget: 25,
            playerTeam: [],
            opponentTeam: [],
            round: 1,
            maxRounds: 12,
            currentCharacter: null,
            currentBid: 0,
            currentBidder: null,
            biddingOpen: false,
            bidTimeout: null,
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
            channelId: interaction.channel.id,

            draftPool: [...DRAFT_CHARACTERS],
            playerBudget: 25,
            opponentBudget: 25,
            playerTeam: [],
            opponentTeam: [],
            round: 1,
            maxRounds: 12,
            currentCharacter: null,
            currentBid: 0,
            currentBidder: null,
            biddingOpen: false,
            bidTimeout: null,
        };

        const embed = new EmbedBuilder()
            .setColor(0x00ae86)
            .setTitle("🎮 osu!draft Solo Game Started")
            .setDescription(
                `Solo match started by <@${interaction.user.id}>!\n` +
                `You’re playing against **Computer 🤖** in **4K MWC 2026** mode.\n` +
                `Let the draft begin!`
            )
            .setFooter({ text: "osu!draft bot" })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        const channel = interaction.channel;
        startDraftRound(channel);
        return;
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

        await interaction.reply({ embeds: [embed] });

        const channel = interaction.channel;
        startDraftRound(channel);
        return;
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

        const channel = interaction.channel;
        const embed = new EmbedBuilder()
            .setColor(0x00ae86)
            .setTitle("🛑 Game Ended")
            .setDescription("The current osu!draft game has been ended.")
            .setFooter({ text: "osu!draft bot" })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        activeGame = null;
        return;
    }
// --- Stage 2 pick handlers ---
if (interaction.customId === "pick_p1") {
    activeGame.playerPicks = interaction.values;
    activeGame.ready.player1 = true;

    await interaction.reply("Player 1 ready!");

    if (activeGame.ready.player2) {
        startMatch(interaction.channel);
    }
}

if (interaction.customId === "pick_p2") {
    activeGame.opponentPicks = interaction.values;
    activeGame.ready.player2 = true;

    await interaction.reply("Player 2 ready!");

    if (activeGame.ready.player1) {
        startMatch(interaction.channel);
    }
}

    
});

// Message listener for bidding
client.on("messageCreate", async (message) => {
    if (!activeGame) return;
    // Distribution Phase
if (activeGame.distributionPhase) {
    if (message.author.bot) return;

    const pool = activeGame.remainingPool;
    if (pool.length === 0) {
        endDraft(message.channel);
        return;
    }

    const nextChar = pool[0];

    const content = message.content.trim().toLowerCase();

    // Only distributor can assign characters
    if (message.author.id !== activeGame.distributor) {
        message.reply("Only the distributor can assign remaining characters.");
        return;
    }

    if (content !== "take" && content !== "give") {
        message.reply("Type **take** or **give**.");
        return;
    }

    // Distributor takes the character
    if (content === "take") {
        if (activeGame.distributor === activeGame.players[0]) {
            activeGame.playerTeam.push(nextChar);
        } else {
            activeGame.opponentTeam.push(nextChar);
        }
        pool.shift();
    }

    // Distributor gives the character
    if (content === "give") {
        if (activeGame.distributor === activeGame.players[0]) {
            activeGame.opponentTeam.push(nextChar);
        } else {
            activeGame.playerTeam.push(nextChar);
        }
        pool.shift();
    }

    // Check if both teams full
    if (activeGame.playerTeam.length >= 6 && activeGame.opponentTeam.length >= 6) {
        endDraft(message.channel);
        return;
    }

    // Show next character
    if (pool.length > 0) {
        message.channel.send(
            `Next character: **${pool[0]}**\nType **take** or **give**`
        );
    } else {
        endDraft(message.channel);
    }

    return;
}

    if (message.author.bot) return;
    if (message.channel.id !== activeGame.channelId) return;
    if (!activeGame.biddingOpen) return;

    const content = message.content.trim().toLowerCase();

    // End bidding with "pass" or "have it"
    if (content === "pass" || content === "have it") {
        finishBidding(message.channel, "player ended bidding");
        return;
    }

    // Numeric bid
    const bid = Number(content);
    if (isNaN(bid) || !Number.isInteger(bid) || bid < 0) return;

    // Determine which side is bidding
    let isPlayer1 = false;
    let isPlayer2 = false;

    if (activeGame.status === "solo") {
        if (message.author.id !== activeGame.players[0]) {
            // Only the human player can bid in solo
            return;
        }
        isPlayer1 = true;
    } else {
        if (message.author.id === activeGame.players[0]) {
            isPlayer1 = true;
        } else if (message.author.id === activeGame.players[1]) {
            isPlayer2 = true;
        } else {
            // Not part of the game
            return;
        }
    }

    // Check bid higher than current
    if (bid <= activeGame.currentBid) {
        const embed = new EmbedBuilder()
            .setColor(0xe74c3c)
            .setTitle("⚠️ Invalid bid")
            .setDescription(`Your bid must be higher than the current bid (**$${activeGame.currentBid}**).`)
            .setFooter({ text: "osu!draft bot" })
            .setTimestamp();
        message.reply({ embeds: [embed] });
        return;
    }

    // Check budget
    let budget = 0;
    if (isPlayer1) {
        budget = activeGame.playerBudget;
    } else if (isPlayer2) {
        budget = activeGame.opponentBudget;
    }

    if (bid > budget) {
        const embed = new EmbedBuilder()
            .setColor(0xe74c3c)
            .setTitle("⚠️ Not enough budget")
            .setDescription(`You only have **$${budget}** left. You cannot bid **$${bid}**.`)
            .setFooter({ text: "osu!draft bot" })
            .setTimestamp();
        message.reply({ embeds: [embed] });
        return;
    }

    // Accept bid
    activeGame.currentBid = bid;
    activeGame.currentBidder = message.author.id;

    const embed = new EmbedBuilder()
        .setColor(0x2980b9)
        .setTitle("💰 New bid")
        .setDescription(`<@${message.author.id}> bids **$${bid}** for **${activeGame.currentCharacter}**!`)
        .setFooter({ text: "osu!draft bot" })
        .setTimestamp();

    message.channel.send({ embeds: [embed] });

    // Reset timeout
    if (activeGame.bidTimeout) {
        clearTimeout(activeGame.bidTimeout);
    }
    activeGame.bidTimeout = setTimeout(() => {
        finishBidding(message.channel, "timeout");
    }, 10000);

    // If solo, let bot respond
    if (activeGame.status === "solo") {
        setTimeout(() => {
            botAIBid(message.channel);
        }, 2000);
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
