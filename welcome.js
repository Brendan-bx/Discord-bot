module.exports = client => {
    client.on("guildMemberAdd", member => {

        const channelID = '1125721046486630532';

        console.log(member)

        const message = `**Welcome to the server, <@${member.id}>! **`;

        const channel = member.guild.channels.cache.get(channelID);

        channel.send(message);

        const dmMessage = `Welcome to ${message.guild.name}, ${member}`;

        member.send(dmMessage).catch(err => {
            return;
        })

    })
}