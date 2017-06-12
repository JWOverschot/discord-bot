// specific for public bot
const keys = require('./6f97a6a13d775ff617e6e9607c65df.js');
var botName = "Zenyatta";
var botToken = keys.botKey();
var googleSearch = keys.googleAPIKey();
// the rest of the code changes
var botVersion = "Jisbot 0.2.1.1";
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const bot = new Discord.Client();
const YouTube = require('youtube-node');
const youTube = new YouTube();
youTube.setKey(googleSearch);
const googleIms = require('google-ims');
let client = googleIms('016227928627283430649:sy5nfspjpus', googleSearch);
require('crashreporter').configure({
    outDir: ('./crash_logs'), // default to cwd 
    exitOnCrash: true, // if you want that crash reporter exit(1) for you, default to true, 
    maxCrashFile: 50 // older files will be removed up, default 5 files are kept 
});

var prefix = "!";

var commands = [/*0*/"hello", /*1*/"bye", /*2*/"ping", /*3*/"help", /*4*/"chooseow", /*5*/"ask", /*6*/"sing", /*7*/"play", /*8*/"skip", /*9*/"stop", /*10*/"queue", /*11*/"img", /*12*/"soup", /*13*/"info"];
var commandsInfo = [
"Greetings message.", //hello
"Farewell message", //bye
"Shows bot's ping", //ping
"Shows this message", //help
"Chooses a random overwatch hero", //chooseow
"Ask any question, most questions wil get you a yes, no or maybe answers", //ask
"Zenyatta will sing a song", //sing
"Will play the YouTube link or YouTube search result after it. If there is already a song playing it will add it to the queue", //play
"Will skip the current song", //skip
"Will stop the music and clear the queue", //stop
"Shows the songs in the queue", //queue
"Shows first image of google search", // img
"Plays soup", //soup
"Shows info over the bot" //info
];
var queueTitles = [];
var queueLengths = [];

function showTime() {
	var d = new Date();
	var h = d.getHours().toString();
	var m = d.getMinutes().toString();
	var s = d.getSeconds().toString();
	if (h.length <= 1)
	{
		h = '0' + h;
	}
	if (m.length <= 1)
	{
		m = '0' + m;
	}
	if (s.length <= 1)
	{
		s = '0' + s;
	}
	return h + ":" + m + ":" + s;
}

//changes only in one server
var servers = {};
function play(connection, message)
{
	var server = servers[message.guild.id];

	server.dispatcher = connection.playStream(ytdl(server.queue[0], {filter: "audioonly"}));

	server.queue.shift();
	queueTitles.shift();

	server.dispatcher.on("end", function()
	{
		if (server.queue[0]) {play(connection, message); console.log(showTime() + " playing music");}
		else {connection.disconnect();
			bot.user.setGame("Overwatch");
			console.log(showTime() + " disconnected from voice channel");}
	});
}

bot.login(botToken);

bot.on("ready", function()
{
	console.log(showTime() + " " + botName + " is here. Version " + botVersion);
	bot.user.setGame("Overwatch");
});

bot.on("message", function(message)
{
	if (message.author.equals(bot.user)) return;
	if (!message.content.startsWith(prefix)) return;

	var args = message.content.substring(prefix.length).split(" ");

	switch (args[0].toLowerCase())
	{
		//hello
		case commands[0]:
			var hello = ["Greetings.", "Peace be upon you.", "Hello, world!"];
			var randomNum = Math.floor(Math.random() * 3);
			var msg = hello[randomNum];
			message.reply(msg);
			console.log(showTime() + " hello msg send");
			break
		//bye
		case commands[1]:
			var hello = ["Darkness falls.", "Time is an illusion, but the illusion is about to run out."];
			var randomNum = Math.floor(Math.random() * 2);
			var msg = hello[randomNum];
			message.reply(msg);
			console.log(showTime() + " bye message send");
			break
		//ping
		case commands[2]:
			message.channel.send("pong " + bot.ping + " ms");
			console.log(showTime() + " bot ping "  + bot.ping + " ms");
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
			console.log(showTime() + " help message send");
			break;
		//chooseow
		case commands[4]:
			var owCharacters = ['Genji', 'McCree', 'Pharah', 'Reaper', 'Soldier: 76', 'Sombra', 'Tracer', 'Bastion', 'Hanzo', 'Junkrat', 'Mei', 'Torbjörn', 'Widowmaker', 'D.VA', 'Orisa', 'Reinhardt', 'Roadhog', 'Winston', 'Zarya', 'Ana', 'Lúcio', 'Mercy', 'Symmetra', 'Zenyatta'];
			var randomNum = Math.floor(Math.random() * 24);
			var chooseow = owCharacters[randomNum];
			message.reply("Your hero is " + chooseow);
			console.log(showTime() + " ow hero send");
			break;
		//ask
		case commands[5]:
			var answers = ['Yes', 'No', 'Maybe'];
			var randomNum = Math.floor(Math.random() * 3);
			var answer = answers[randomNum];
			if (message.content === '!ask what time is it?' || message.content === '!ask what is the time?' || message.content === '!ask time')
			{
				message.channel.send("it's " + showTime());
				console.log(showTime() + " time send");
			}
			else
			{
				if (args[1])
				{
					message.channel.send(answer);
					console.log(showTime() + " answer send");
				}
				else
				{
					message.channel.send("Ask a yes or no question.");
					console.log(showTime() + " ask error send");
				}
			}
			break;
		//sing
		case commands[6]:
			if (!message.member.voiceChannel)
			{
				message.channel.send("You must be in a voice channel.");
				console.log(showTime() + " play not in channel error send");
				return;
			}
			if (!servers[message.guild.id]) servers[message.guild.id] = { queue: [] };
			var songs = ["https://www.youtube.com/watch?v=aiWA7gO_cnk", "https://www.youtube.com/watch?v=mRJrXRCq3w8"];
			var randomNum = Math.floor(Math.random() * 2);
			var song = songs[randomNum];
			var server = servers[message.guild.id];
			server.queue.push(song);
			console.log(showTime() + " song added to queue");
			bot.user.setGame("Singing");
			if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection)
			{
				play(connection, message);
				bot.user.setGame("Singing");
				console.log(showTime() + " singing in voice channel");
			});
			break;
		//play
		case commands[7]:
		var title = "";
			if (!args[1])
			{
				message.channel.send("Provide a link or song title and artist.");
				console.log(showTime() + " play link error send");
				return;
			}
			if (!message.member.voiceChannel)
			{
				message.channel.send("You must be in a voice channel.");
				console.log(showTime() + " play not in channel error send");
				return;
			}
			if (!servers[message.guild.id]) servers[message.guild.id] = { queue: [] };
			if (args[1].includes("https://") || args[1].includes("y2u.be/") || args[1].includes("youtu.be/"))
			{
				if (args[2])
				{
					message.channel.send("Too many arguments '!play url'");
					console.log(showTime() + " too many arguments");
					return;
				}
				if (args[1].includes('youtube.com/watch?v=') || args[1].includes('y2u.be/') || args[1].includes('youtu.be/'))
				{
					if (args[1].includes('y2u.be/'))
					{
						args[1] = args[1].split("y2u.be/").pop();
						args[1] = "https://www.youtube.com/watch?v=" + args[1];
					}
					if (!args[1].includes('https://'))
					{
						args[1] = "https://" + args[1];
					}
					var server = servers[message.guild.id];
					server.queue.push(args[1]);
					

					if (args[1].includes("https://www.youtube.com/watch?v="))
					{
						var id = args[1].split("https://www.youtube.com/watch?v=").pop();
						if (id.length > 11)
						{
							if (!args[1].includes("&"))
							{
								message.channel.send("Invalid link");
								console.log(showTime() + " invalid link error");
								return;
							}
							else
							{
								id = id.split("&").shift();
							}
						}
					}
					else if (args[1].includes("youtu.be/"))
					{
						var id = args[1].split("youtu.be/").pop();
					}

					ytdl.getInfo(args[1], function(err, info)
					{
						if (err) throw err;
						var title = info.title;
						var length = info.length_seconds;
						message.channel.send("'" + title + "'" + " added to queue!");
						console.log(showTime() + " song added to queue");
						queueTitles.push(title);
						queueLengths.push(length);
					});
					if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection)
					{
						play(connection, message);
						bot.user.setGame("Music");
						console.log(showTime() + " playing in voice channel");
					});
				}
				else
				{
					message.channel.send("unsupported link, only youtube links work.");
					console.log(showTime() + " not a youtube link");
					return;
				}
			}
			else
			{
				youTube.search(message.content.split("!play").pop(), 1, function(error, result)
				{
					if (error)
					{
						console.log(showTime() + " " + error);
						return;
					}
					else
					{
						if (result.items[0] == undefined)
						{
							message.channel.send("No search results");
							console.log(showTime() + " no search results");
						}
						else
						{
							var server = servers[message.guild.id];
							var ytVideoId = result.items[0].id.videoId;
							var ytVideo = "https://www.youtube.com/watch?v=" + ytVideoId;
							server.queue.push(ytVideo);
							if (ytVideoId.includes("https://www.youtube.com/watch?v="))
							{
								ytVideoId = ytVideoId.split("https://www.youtube.com/watch?v=").pop();
							}
							else if (ytVideoId.includes("y2u.be/"))
							{
								ytVideoId = ytVideoId.split("y2u.be/").pop();
							}
							else if (ytVideoId.includes("youtu.be/"))
							{
								ytVideoId = ytVideoId.split("youtu.be/").pop();
							}
							ytdl.getInfo(ytVideoId, function(err, info)
							{
								if (err) throw err;
								var title = info.title;
								var length = info.length_seconds;
								message.channel.send("'" + title + "'" + " added to queue!");
								console.log(showTime() + " song added to queue");
								var time = length;
								var minutes = Math.floor(time / 60);
								var seconds = time - minutes * 60;
								var hours = Math.floor(time / 3600);
								time = time - hours * 3600;
								function str_pad_left(string,pad,length)
								{
								    return (new Array(length+1).join(pad)+string).slice(-length);
								}
								var finalTime = str_pad_left(minutes,'0',2)+':'+str_pad_left(seconds,'0',2);
								queueTitles.push(title);
								queueLengths.push(finalTime);
							});
							if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection)
							{
								play(connection, message);
								bot.user.setGame("Music");
								console.log(showTime() + " playing in voice channel");
							});
						}
					}
				});
			}
			break;
		//skip
		case commands[8]:
			var server = servers[message.guild.id];
			if (server.dispatcher) server.dispatcher.end();
			console.log(showTime() + " song skiped");
			break;
		//stop
		case commands[9]:
			var server = servers[message.guild.id];
			if (message.guild.voiceConnection) for (var i = 0; i < server.queue.length; i++) {server.queue.shift(); queueTitles.shift();} server.dispatcher.end();
			console.log(showTime() + " music stoped");
			break;
		//queue
		case commands[10]:
			var server = servers[message.guild.id];
			if (!server || !server.queue.length > 0)
			{
				message.channel.send("There are no songs in the queue.");
				console.log(showTime() + " no queue");
				return;
			}
			var playlist = "";
			var embed = new Discord.RichEmbed()
			var i = 0;
			queueTitles.forEach(
			function (item, index)
			{
				embed.addField(item, queueLengths[i]);
				i++;
			});
			embed.setColor(0x3399ff);
			message.channel.sendEmbed(embed);
			console.log(showTime() + " queue list send");
			break;
		//img
		case commands[11]:
			if (!args[1])
			{
				message.channel.send("No search query.");
				console.log(showTime() + " no search query error");
				return;
			}
			client.search(message.content.split("!img").pop(),
			{
				page: 1, // 10 results per page 
				safe: 'off', // high, medium, off 
				googlehost: 'google.com', // google domain to use
				num: 1 // number of results per page, default 10 

			}).then(function (images)
			{
				images.forEach(function(i, e, a)
				{
					message.channel.send(images[0].url);
					console.log(showTime() + " image send");
				});
			});
			break;
		//soup
		case commands[12]:
			if (!message.member.voiceChannel)
			{
				message.channel.send("You must be in a voice channel.");
				console.log(showTime() + " play not in channel error send");
				return;
			}
			if (!servers[message.guild.id]) servers[message.guild.id] = { queue: [] };
			var server = servers[message.guild.id];
			server.queue.push("https://www.youtube.com/watch?v=4kqbKEqzsAI");
			console.log(showTime() + " song added to queue");
			if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection)
			{
				play(connection, message);
				console.log(showTime() + " soup in voice channel");
			});
			break;
		//info
		case commands[13]:
				var embed = new Discord.RichEmbed()
				embed.setTitle(botVersion);
				embed.setURL("https://github.com/JWOverschot/discord-bot")
				embed.setAuthor("Jis van Overschot", "https://cdn.discordapp.com/avatars/182166049314177024/d1ecfd5ecea840aef90ebfa89cef1ee8.png?size=2048");
				embed.setDescription("For releases and patch notes visit https://github.com/JWOverschot/discord-bot/releases");
				message.channel.sendEmbed(embed);
				console.log(showTime() + " " + botVersion);
			break;

		default:
			message.channel.send('"' + message.content + '"' + ' command does not exist, try !help');
			console.log(showTime() + " error command does not exist");
	}
});