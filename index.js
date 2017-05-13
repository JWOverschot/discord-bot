// specific for public bot
var botToken = 'MzExNDI3OTU1ODYxNzQ5NzYw.C_MXbw.ggIbW2EV1MyLdWaQ1nj_nf5VzUY';
var botName = "Zenyatta";
// the rest of the code changes
var botVersion = "Jisbot 0.1.3";
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const bot = new Discord.Client();

var prefix = "!";

var commands = ["hello", "bye", "ping", "help", "chooseow", "ask","sing", "play", "skip", "stop", "queue", "version"];
var commandsInfo = ["Greetings message.", "Farewell message", "Shows bot's ping", "Shows this message", "Chooses a random overwatch hero", "Ask any question, most questions wil get you a yes, no or maybe answers", "Zenyatta will sing a song", "will play the YouTube link after it. If there is already a song playing it will add it to the queue", "Will skip the current song", "Will stop the music and clear the queue", "shows the songs in the queue", "Shows version of bot"];

var servers = {};
function play(connection, message) {
	var server = servers[message.guild.id];

	server.dispatcher = connection.playStream(ytdl(server.queue[0], {filter: "audioonly"}));

	server.queue.shift();

	server.dispatcher.on("end", function() {
		if (server.queue[0]) {play(connection, message); console.log("playing music");}
		else {connection.disconnect();
			bot.user.setGame("Overwatch");
			console.log("disconnected from voice channel");}
	});
}

bot.login(botToken);

bot.on("ready", function(){
	console.log(botName + " is here. Version " + botVersion);
	bot.user.setGame("Overwatch");
})

bot.on("message", function(message){
	if (message.author.equals(bot.user)) return;
	if (!message.content.startsWith(prefix)) return;

	var args = message.content.substring(prefix.length).split(" ");

	switch (args[0].toLowerCase()) {
		//hello
		case commands[0]:
			var hello = ["Greetings.", "Peace be upon you.", "Hello, world!"];
			var randomNum = Math.floor(Math.random() * 3);
			var msg = hello[randomNum];
			message.reply(msg);
			console.log("hello msg send");
			break
		//bye
		case commands[1]:
			var hello = ["Darkness falls.", "Time is an illusion, but the illusion is about to run out."];
			var randomNum = Math.floor(Math.random() * 2);
			var msg = hello[randomNum];
			message.reply(msg);
			console.log("bye message send");
			break
		//ping
		case commands[2]:
			message.channel.send("pong " + bot.ping + "ms");
			console.log("bot ping "  + bot.ping + "ms");
			break;
		//help
		case commands[3]:
			var embed = new Discord.RichEmbed()
			commands.forEach(
			function (item, index) {
				embed.addField('!' + item, commandsInfo[index]);
			});
			embed.setColor(0x66ccff);
			message.channel.sendEmbed(embed);
			console.log("help message send");
			break;
		//chooseow
		case commands[4]:
			var owCharacters = ['Genji', 'McCree', 'Pharah', 'Reaper', 'Soldier: 76', 'Sombra', 'Tracer', 'Bastion', 'Hanzo', 'Junkrat', 'Mei', 'Torbjörn', 'Widowmaker', 'D.VA', 'Orisa', 'Reinhardt', 'Roadhog', 'Winston', 'Zarya', 'Ana', 'Lúcio', 'Mercy', 'Symmetra', 'Zenyatta'];
			var randomNum = Math.floor(Math.random() * 24);
			var chooseow = owCharacters[randomNum];
			message.reply("Your hero is " + chooseow);
			console.log("ow hero send");
			break;
		//ask
		case commands[5]:
			var answers = ['Yes', 'No', 'Maybe'];
			var randomNum = Math.floor(Math.random() * 3);
			var answer = answers[randomNum];
			if (message.content === '!ask what time is it?' || message.content === '!ask what is the time?' || message.content === '!ask time') {
				var d = new Date();
				var h = d.getHours();
				var m = d.getMinutes();
				if (m.toString().length <= 1) {
					m = '0' + m;
				}
				else if (h.toString().length <= 1) {
					h = '0' + h;
				}
				message.channel.send("it's " + h + ":" + m);
				console.log("time send");
			} else {
			if (args[1]) {
				message.channel.send(answer);
				console.log("answer send");
			} else {
				message.channel.send("Ask a yes or no question.");
				console.log("ask error send");
			}}
			break;
		//sing
		case commands[6]:
			if (!message.member.voiceChannel) {
				message.channel.send("You must be in a voice channel.");
				console.log("play not in channel error send");
				return;
			}
			if (!servers[message.guild.id]) servers[message.guild.id] = {
				queue: []
			};
			var songs = ["https://www.youtube.com/watch?v=aiWA7gO_cnk", "https://www.youtube.com/watch?v=mRJrXRCq3w8"];
			var randomNum = Math.floor(Math.random() * 2);
			var song = songs[randomNum];
			var server = servers[message.guild.id];
			server.queue.push(song);
			console.log("song added to queue");
			if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection){
				play(connection, message);
				bot.user.setGame("Singing");
				console.log('Singing in voice channel');
			});
			break;
		//play
		case commands[7]:
			if (!args[1]) {
				message.channel.send("Provide a link.");
				console.log("play link error send");
				return;
			}
			if (args[2]) {
				message.channel.send("Too many arguments '!play url'");
				console.log("Too many arguments");
				return;
			}
			if (!args[1].includes('youtube.com/watch?v=' || 'y2u.be/' || 'youtu.be/')) {
				message.channel.send("unsupported link, only youtube links work.");
				console.log("not a youtube link");
				return;
			}
			if (!message.member.voiceChannel) {
				message.channel.send("You must be in a voice channel.");
				console.log("play not in channel error send");
				return;
			}
			if (!servers[message.guild.id]) servers[message.guild.id] = {
				queue: []
			};
			var server = servers[message.guild.id];
			server.queue.push(args[1]);
			message.channel.send("Song successfully added to queue!");
			console.log("song added to queue");
			if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection){
				play(connection, message);
				bot.user.setGame("Music");
				console.log('playing in voice channel');
			});
			break;
		//skip
		case commands[8]:
			var server = servers[message.guild.id];
			if (server.dispatcher) server.dispatcher.end();
			console.log("song skiped");
			break;
		//stop
		case commands[9]:
			var server = servers[message.guild.id];
			if (message.guild.voiceConnection) for (var i = 0; i < server.queue.length; i++) {server.queue.shift()} server.dispatcher.end();
			console.log("music stoped");
			break;
		queue
		case commands[10]:
			var server = servers[message.guild.id];
			if (!server || !server.queue.length > 0) {
				message.channel.send("There are no songs in the queue.");
				console.log("no queue");
			} else {
				var embed = new Discord.RichEmbed()
				server.queue.forEach(
				function (item, index) {
					embed.addField(item, index);
				});
				embed.setColor(0x66ccff);
				message.channel.sendEmbed(embed);
				console.log("queue list send");
			}
			break;
		//version
		case commands[11]:
				message.channel.send(botVersion);
				console.log(botVersion);
			break;

		default:
			message.channel.send(message.content + " command does not exist, try !help");
			console.log("error command does not exist");
	}
});