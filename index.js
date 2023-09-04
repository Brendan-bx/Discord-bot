const { TOKEN } = require("./config.js")
const { ActivityType, interaction, Client, GatewayIntentBits, partials, Partials, Embed, EmbedBuilder, PermissionsBitField, MessageFlags, Collection, VoiceChannel } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { createAudioPlayer, createAudioResource, joinVoiceChannel, NoSubscriberBehavior, StreamType } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const PREFIX = ">";


channelID = '434688628271087626';
const { Player } = require("discord-player");

// Define your YouTube API key (replace 'YOUR_YOUTUBE_API_KEY' with your actual key)
const YOUTUBE_API_KEY = 'AIzaSyAYy9jtpNkqy0xUF-bwmoMuG9u1gfbo7dI';
const search = require('youtube-search');

// Configure the YouTube search options
const searchOptions = {
    maxResults: 5, // Number of search results to retrieve
    key: YOUTUBE_API_KEY,
};



// On crée une instance du client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages, // Nous autorisons à accéder aux messages
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [
        Partials.Message,
        Partials.Reaction,
        Partials.User,
        Partials.GuildMember
    ]
});
const player = new Player(client);
client.player = player;

// On agit quand le bot est "pret"
client.on("ready", () => {
    console.log("Bot connecté en tant que " + client.user.tag);



    client.user.setPresence({
        activities: [{
            name: "Please use prefix '>'",
            type: ActivityType.Playing
        }],
        status: "dnd"
    })
});

const queue = new Map();


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
                        { name: 'untimeout', value: 'Untimeout @person-name Reason' },
                        { name: 'play', value: 'Play <link> or query for listening music in a voice channel' },
                        { name: 'skip', value: 'For skipping the current song' },
                        { name: 'stop', value: 'Disconnect the bot and clear queue' },
                        { name: 'queue', value: 'Take a look to the current queue' }
                    )


                    .setFooter({ text: 'Use prefix ">"' })
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
                    console.error(err)
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
                    .then(bans => {
                        if (bans.size = 0) return message.channel.send(`There is no one banned from this server.`);

                        let bannedID = bans.find(ban => ban.user.id == unbanMember);
                        if (!bannedID) return message.channel.send(`The ID stated is not banned from this server.`);

                        message.guild.bans.remove(unbanMember, unbanReason).catch(err => {
                            console.error(err)
                            return message.channel.send("There was an error unbanning this member.")
                        })

                        message.channel.send({ embeds: [unbanEmbed] });
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
                    console.error(err)
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
                    console.error(err)
                })
                break;
            case 'play':
                executePlayCommand(argument, message);
                break;
            case 'stop':
                executeStopCommand(message);
                break;
            case 'skip':
                executeSkipCommand(message);
                break;
            case 'queue':
                displayQueue(message);
                break;
            default:
                message.reply("Cette commande n'existe pas")
        }
    }
});


async function executePlayCommand(args, message) {
    if (args.length < 1) {
        message.channel.send('Please provide a YouTube link or a search query.');
        return;
    }

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
        message.channel.send('You must be in a voice channel to use this command.');
        return;
    }

    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator
    });

    let serverQueue = queue.get(message.guild.id);

    if (!serverQueue) {
        serverQueue = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: connection,
            songs: [],
            playing: false,
            currentSong: null
        };

        queue.set(message.guild.id, serverQueue);
    }

    // Check if the argument is a YouTube link or a search query
    const isLink = args[0].startsWith('https://www.youtube.com/watch?v=');

    if (isLink) {
        // It's a YouTube link, add it directly to the queue
        const songInfo = await ytdl.getInfo(args[0]);
        const song = {
            title: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url
        };

        serverQueue.songs.push(song);

        if (!serverQueue.playing) {
            playNextSong(message.guild.id);
        } else {
            message.channel.send(`Added to the queue: ${song.title}`);
        }
    } else {
        // It's a search query, perform the search
        search(args.join(' '), searchOptions, async (error, results) => {
            if (error) {
                console.error(error);
                message.channel.send('An error occurred while searching for videos.');
                return;
            }

            if (results.length === 0) {
                message.channel.send('No search results found.');
                return;
            }

            const topResult = results[0];

            const songInfo = await ytdl.getInfo(topResult.link);

            const song = {
                title: songInfo.videoDetails.title,
                url: topResult.link
            };

            serverQueue.songs.push(song);

            if (!serverQueue.playing) {
                playNextSong(message.guild.id);
            } else {
                message.channel.send(`Added to the queue: ${song.title}`);
            }
        });
    }
}



// Fonction pour passer la musique suivante
function playNextSong(guildId) {
    const serverQueue = queue.get(guildId);

    if (!serverQueue || serverQueue.songs.length === 0) {
        serverQueue.voiceChannel.leave();
        queue.delete(guildId);
        return;
    }

    const song = serverQueue.songs[0];

    const stream = ytdl(song.url, { filter: 'audioonly' });
    const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });
    const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Play } });

    player.play(resource);
    serverQueue.connection.subscribe(player);

    serverQueue.textChannel.send(`Lecture en cours : ${song.title}`);

    player.on('stateChange', (state) => {
        if (state.status === 'idle') {
            serverQueue.songs.shift();
            playNextSong(guildId);
        }
    });

    serverQueue.playing = true;
    player.on('stateChange', (state) => {
        if (state.status === 'idle') {
            serverQueue.songs.shift();
            playNextSong(guildId);
        }
    });
}

// Pour stopper le bot
function executeStopCommand(message) {
    const serverQueue = queue.get(message.guild.id);
    if (!serverQueue) return;

    serverQueue.songs = [];
    serverQueue.connection.destroy();
    queue.delete(message.guild.id);

    message.channel.send('Stopping playback and clearing the queue.');
}

// For skip the current song
function executeSkipCommand(message) {
    const serverQueue = queue.get(message.guild.id);
    if (!serverQueue) return;

    if (!serverQueue.playing) {
        message.channel.send('There is no song currently playing.');
        return;
    }

    // Remove the current song from the queue
    serverQueue.songs.shift();

    // Check if there are more songs in the queue
    if (serverQueue.songs.length > 0) {
        // Play the next song
        playNextSong(message.guild.id);
    } else {
        // If there are no more songs, stop playback and clear the queue
        serverQueue.connection.destroy();
        queue.delete(message.guild.id);
    }
}


function displayQueue(message) {
    const serverQueue = queue.get(message.guild.id);
    if (!serverQueue || serverQueue.songs.length === 0) {
        message.channel.send('The queue is empty.');
        return;
    }

    const queueEmbed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("Current Queue")
        .setDescription(
            serverQueue.songs.map((song, index) => `${index + 1}. ${song.title}`).join('\n')
        );

    message.channel.send({ embeds: [queueEmbed] });
}




// On répond aux réactions 
client.on("messageReactionAdd", async (reaction, user) => {
    if (reaction.emoji.name === "👍") {
        console.log("signalé");

        let channel = reaction.message.guild.channels.cache.get("1125794283203604500");
        channel.send("Un message à été signalé par <@" + user.id + "> voici le message : " + reaction.message.url);
    }
});


client.on("guildMemberRemove", member => {
    console.log(member)

    const channel = member.guild.channels.cache.get(channelID);

    channel.send(`**${member.user.username} just leave the server.**`);
});

client.on("guildMemberAdd", member => {
    console.log(member)

    const channel = member.guild.channels.cache.get(channelID);

    channel.send(`**Welcome to the server, <@${member.id}>! **`);

    member.send(`Welcome to ${member.guild.name}, ${member}`)
});



// Pour connecter le bot
client.login(TOKEN);
