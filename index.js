const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const bot = new Discord.Client();

var prefix = "!";

var commands = ["hello", "ping", "help", "chooseow", "ask", "play", "skip", "stop", "avatar"];
var commandsInfo = ["Greetings message.", "Shows bot's ping", "Shows this message", "Chooses a random overwatch hero", "Ask any question, most questions wil get you a yes, no or maybe answers", "will play the YouTube link after it. If there is already a song playing it will add it to the queue", "Will skip the current song", "Will stop the music and clear the queue", "shows you your avatar"];

function play(connection, message) {
	var server = servers[message.guild.id];

	server.dispatcher = connection.playStream(ytdl(server.queue[0], {filter: "audioonly"}));

	server.queue.shift();

	server.dispatcher.on("end", function() {
		if (server.queue[0]) play(connection, message);
		else connection.disconnect();
	});
}

var servers = {};

bot.on("ready", function(){
	console.log("Zenyatta is here.");
	bot.user.setGame("Overwatch");
})

bot.on("message", function(message){
	if (message.author.equals(bot.user)) return;
	if (!message.content.startsWith(prefix)) return;

	var args = message.content.substring(prefix.length).split(" ");

	switch (args[0].toLowerCase()) {
		//hello
		case commands[0]:
			var hello = ["Greetings.", "Peace be upon you."];
			var randomNum = Math.floor(Math.random() * 2);
			var msg = hello[randomNum];
			message.reply(msg);
			break
		//ping
		case commands[1]:
			message.channel.send("pong " + bot.ping + "ms");
			break;
		//help
		case commands[2]:
			var embed = new Discord.RichEmbed()
			commands.forEach(
			function (item, index) {
				embed.addField('!' + item, commandsInfo[index]);
			});
			embed.setColor(0x66ccff);
			message.channel.sendEmbed(embed);
			break;
		//chooseow
		case commands[3]:
			var owCharacters = ['Genji', 'McCree', 'Pharah', 'Reaper', 'Soldier: 76', 'Sombra', 'Tracer', 'Bastion', 'Hanzo', 'Junkrat', 'Mei', 'Torbjörn', 'Widowmaker', 'D.VA', 'Orisa', 'Reinhardt', 'Roadhog', 'Winston', 'Zarya', 'Ana', 'Lúcio', 'Mercy', 'Symmetra', 'Zenyatta'];
			var randomNum = Math.floor(Math.random() * 24);
			var chooseow = owCharacters[randomNum];
			message.reply("Your hero is " + chooseow);
			break;
		//ask
		case commands[4]:
			var answers = ['Yes', 'No', 'Maybe'];
			var randomNum = Math.floor(Math.random() * 3);
			var answer = answers[randomNum];
			if (message.content == '!ask what time is it?') {
				var d = new Date();
				var h = d.getHours();
				var m = d.getMinutes();
				if (m.toString().length <= 1) {
					m = '0' + m;
				}
				message.channel.send("it's " + h + ":" + m);
			} else {
			if (args[1]) {
				message.channel.send(answer);
			} else {
				message.channel.send("Ask a yes or no question.");
			};}
			break;
		//play
		case commands[5]:
			if (!args[1]) {
				message.channel.send("Provide a link.");
				return;
			}
			if (!message.member.voiceChannel) {
				message.channel.send("You must be in a voice channel.");
				return;
			}
			if (!servers[message.guild.id]) servers[message.guild.id] = {
				queue: []
			};
			var server = servers[message.guild.id];
			server.queue.push(args[1]);
			message.channel.send("Song successfully added to queue!");
			if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection){
				play(connection, message);
			});
			break;
		//skip
		case commands[6]:
			var server = servers[message.guild.id];
			if (server.dispatcher) server.dispatcher.end();
			break;
		//stop
		case commands[7]:
			var server = servers[message.guild.id];
			if (message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
			break;
		//avatar
		case commands[8]:
			message.channel.send(message.author.avatarURL);
			break;

		default:
			message.reply("this command does not exist, try !help");
	}
});

bot.login('MzExNDI3OTU1ODYxNzQ5NzYw.C_MXbw.ggIbW2EV1MyLdWaQ1nj_nf5VzUY');

