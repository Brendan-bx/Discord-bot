// const { SlashCommandBuilder } = require("@discordjs/builders");
// const { MessageEmbed } = require("discord.js");
// const { QueryType } = require("discord-player");



// module.exports = {
//     data: new SlashCommandBuilder()
//         .setName("play")
//         .setDescription("Plays a song.")
//         .addSubcommand(subcommand => {
//             subcommand
//                 .setName("search")
//                 .setDescription("Searches for a song.")
//                 .addStringOption(option => {
//                     option
//                         .setName("searchterms")
//                         .setDescription("search keywords")
//                         .setRequired(true);
//                 })
//         })
//         .addSubcommand(subcommand => {
//             subcommand
//                 .setName("playlist")
//                 .setDescription("Plays playlist from YT")
//                 .addStringOption(option => {
//                     option
//                         .setName("url")
//                         .setDescription("playlist url")
//                         .setRequired(true);
//                 })
//         })

//         .addSubcommand(subcommand => {
//             subcommand
//                 .setName("song")
//                 .setDescription("Plays song from YT")
//                 .addStringOption(option => {
//                     option
//                         .setName("url")
//                         .setDescription("url of the song")
//                         .setRequired(true);
//                 })
//         })
// };






// //Load all the commands
// const commandsP = [];
// client.commands = new Collection();

// const commandsPath = path.join(__dirname, "commands");
// const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

// // for (const file of commandFiles) {
// //     const filePath = path.join(commandsPath, file);
// //     const commandP = require(filePath);

// //     client.commands.set(commandP.data.name, commandP);
// //     commandsP.push(commandP);
// // }

// client.player = new Player(client, {
//     ytdlOptions: {
//         quality: "highestaudio",
//         highWaterMark: 1 << 25
//     }
// });

// client.on("ready", () => {
//     const guild_ids = client.guilds.cache.map(guild => guild.id);

//     const rest = new REST({ version: "9" }).setToken(TOKEN);
//     for (const guildId of guild_ids) {
//         rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId), {
//             body: commandsP
//         })
//             .then(() => console.log(`Added commands to ${guildId}`))
//             .catch(console.error);
//     }
// });

// client.on("interactionCreate", async interaction => {
//     if (!interaction.isCommand()) return;

//     const command1 = client.commands.get(interaction.commandName);
//     if (!command1) return;

//     try {
//         await command1.execute({ client, interaction });
//     }
//     catch {
//         console.log(error)
//         await interaction.reply("An error occurred while executing that command.")
//     }
// });