const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const bot = new Discord.Client();

var prefix = "!";

var commands = ["hello", "ping", "help", "chooseow", "ask", "play", "skip", "stop", "avatar"];

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
				message.reply("all comands are: !" + commands.join(', !'));
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
			if (args[1]) {
				message.channel.send(answer);
			} else {
				message.channel.send("Ask a yes or no question.");
			}
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

