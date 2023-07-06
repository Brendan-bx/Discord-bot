const { TOKEN } = require("./config.js")
const { ActivityType, interaction, Client, GatewayIntentBits, partials, Partials, Embed, EmbedBuilder, PermissionsBitField, MessageFlags } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const PREFIX = "!";
// On crée une instance du client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages, // Nous autorisons à accéder aux messages
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildModeration
    ],
    partials: [
        Partials.Message,
        Partials.Reaction,
        Partials.User,
        Partials.GuildMember
    ]
});

const welcome = require('./welcome.js')


// On agit quand le bot est "pret"
client.on("ready", () => {
    console.log("Bot connecté en tant que " + client.user.tag);

    welcome(client)

    client.user.setPresence({
        activities: [{
            name: "VALORANT",
            type: ActivityType.Streaming
        }],
        status: "dnd"
    })
});


//On répond aux messages
client.on("messageCreate", (message) => {
    if (message.content.startsWith(PREFIX)) {
        // On découpe la commande 
        const input = message.content.slice(PREFIX.length).trim().split(" ");
        const command = input.shift();
        // Messages array
        const messageArray = message.content.split(" ");
        const argument = messageArray.slice(1);
        const cmd = messageArray[0];

        // Commandes du bot
        switch (command) {
            // Help Command
            case "help":
                const helpEmbed = new EmbedBuilder()
                    .setColor("#0099ff")
                    .setThumbnail("https://upload.wikimedia.org/wikipedia/en/9/94/Wheatley.png")
                    .setTitle("Commands list")
                    .addFields(
                        { name: 'help', value: 'Display the command list' },
                        { name: 'ping', value: "Answer 'pong'" },
                        { name: 'ban', value: 'Ban @person-name Reason' },
                        { name: 'unban', value: 'Unban @person-name Reason' },
                        { name: 'timeout', value: 'Timeout @person-name Reason' },
                        { name: 'untimeout', value: 'Untimeout @person-name Reason' }
                    )
                    .setFooter({ text: 'Use prefix "!"' })
                    .setTimestamp()
                message.channel.send({ embeds: [helpEmbed] })
                    .then(() => {
                        message.delete();
                    })
                    .catch(console.log);
                break;
            // Ping Command
            case "ping":
                message.channel.send("pong")
                    .catch(console.log);
                break;
            // Ban Command
            case "ban":
                const member = message.mentions.members.first() || message.guild.members.cache.get(argument[0]) || message.guild.members.cache.find(x => x.user.username.toLowerCase() === argument.slice(0).join(" " || x.user.username === argument[0]));

                if (!member) return message.channel.send("You must specify someone in this channel.")
                if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return message.channel.send("You don't have permission to ban people in this server !")
                if (message.member === member) return message.channel.send("You cannot ban yourself");
                if (!member.kickable) return message.channel.send("You cannot ban this person !");

                if (!argument[0]) return message.channel.send("You must specify someone to ban in this command !");

                let banReason = argument.slice(1).join(" ") || "No reason given."

                const banEmbed = new EmbedBuilder()
                    .setColor("Red")
                    .setDescription(` :white_check_mark: ${member.user.tag} has been **banned** | ${banReason}`)

                const dmBanEmbed = new EmbedBuilder()
                    .setColor("Red")
                    .setDescription(` :White_check_mark: You were **banned** from ${message.guild.name} | ${banReason}`)

                member.send({ embeds: [dmBanEmbed] }).catch(err =>
                    console.log(`${member.user.tag} has their DMs off and cannot receive the ban message.`)
                )

                member.ban().catch(err => {
                    message.channel.send("There was an error banning this member.");
                })

                message.channel.send({ embeds: [banEmbed] });
                break;
            // Unban Command
            case "unban":
                const unbanMember = argument[0];
                let unbanReason = argument.slice(1).join(" ") || "No reason given."

                const unbanEmbed = new EmbedBuilder()
                    .setColor("Red")
                    .setDescription(` :white_check_mark: <@${unbanMember}> has been **unbanned**`)
                message.guild.bans.fetch()
                    .then(async bans => {
                        if (bans.size = 0) return message.channel.send(`There is no one banned from this server.`);

                        let bannedID = bans.find(ban => ban.user.id == unbanMember);
                        if (!bannedID) return await message.channel.send(`The ID stated is not banned from this server.`);

                        await message.guild.bans.remove(unbanMember, unbanReason).catch(err => {
                            return message.channel.send("There was an error unbanning this member.")
                        })

                        await message.channel.send({ embeds: [unbanEmbed] });
                    })
                break;
            // Timeout Command
            case "timeout":
                const timeUser = message.mentions.members.first() || message.guild.members.cache.get(argument[0]) || message.guild.members.cache.find(x => x.user.username.toLowerCase() === argument.slice(0).join(" " || x.user.username === argument[0]));
                const duration = argument[1];

                if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return message.channel.send("You don't have permission to time people out in this server !")
                if (!timeUser) return message.channel.send("Please specify a member to timeout ! ");
                if (message.member === timeUser) return message.channel.send("You cannot time yourself out ! ");
                if (!duration) return message.channel.send("Please specify a duration in which you want the member to be timed out for.");
                if (duration > 604800) return message.channel.send("Please specify a duration between 1 and 604800 (one week) seconds !");

                if (isNaN(duration)) {
                    return message.channel.send("Please specify a valid number in the duration section.");

                }

                let timeoutReason = argument.slice(2).join(" ") || 'No reason given.';

                const timeoutEmbed = new EmbedBuilder()
                    .setColor("Blue")
                    .setDescription(` :white_check_mark: ${timeUser.user.tag} has been **timed out** for ${duration} seconds | ${timeoutReason}`)

                const dmTimeoutEmbed = new EmbedBuilder()
                    .setColor("Blue")
                    .setDescription(` :white_check_mark: You have been **timed out** in ${message.guild.name} for ${duration} seconds | ${timeoutReason}`)


                timeUser.timeout(duration * 1000, timeoutReason);

                message.channel.send({ embeds: [timeoutEmbed] });

                timeUser.send({ embeds: [dmTimeoutEmbed] }).catch(err => {
                    return;
                });

                break;

            //Untimeout Command
            case "untimeout":
                const untimeUser = message.mentions.members.first() | message.guild.members.cache.get(argument[0]) || message.guild.members.cache.find(x => x.user.username.toLowerCase() === argument.slice(0).join(" " || x.user.username === argument[0]));

                if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return message.channel.send("You don't have permission to untime people out in this server.");
                if (!untimeUser) return message.channel.send("Please specify a member to untimeout.");
                if (message.member === untimeUser) return message.channel.send("You cannot untime yourself out.");
                if (!untimeUser.kickable) return message.channel.send("You cannot time this person out.");

                let untimeReason = argument.slice(1).join(" ") || 'No reason given.';

                const untimeEmbed = new EmbedBuilder()
                    .setColor("Blue")
                    .setDescription(` :white_check_mark: ${untimeUser.user.tag} has been **untimed out** | ${untimeReason}`)

                const dmUntimeEmbed = new EmbedBuilder()
                    .setColor("Blue")
                    .setDescription(` :white_check_mark: You have been **untime out** in ${message.guild.name} | ${untimeReason}`)

                untimeUser.timeout(null, reason);

                message.channel.send({ embeds: [timeoutEmbed] });

                untimeUser.send({ embeds: [dmUntimeEmbed] }).catch(err => {
                    return;
                })

            default:
                message.reply("Cette commande n'existe pas")
        }
    }
});

// On répond aux réactions 
client.on("messageReactionAdd", async (reaction, user) => {
    if (reaction.emoji.name === "👍") {
        console.log("signalé");

        let channel = reaction.message.guild.channels.cache.get("1125794283203604500");
        channel.send("Un message à été signalé par <@" + user.id + "> voici le message : " + reaction.message.url);
    }
});

// Slash Commands
module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('This is the test command ! '),
    async execute(interaction, client) {
        await interaction.reply({ content: 'The bot is working' });
    },
};

// Pour connecter le bot
client.login(TOKEN);
