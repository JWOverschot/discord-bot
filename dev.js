// specific for dev bot
const keys = require('./6f97a6a13d775ff617e6e9607c65df.js')
const botName = 'Devyatta'
const botToken = keys.devBotKey()
const googleSearch = keys.googleAPIKey()
require('crashreporter').configure({
    outDir: ('./crash_logs_dev'), // default to cwd 
    exitOnCrash: true, // if you want that crash reporter exit(1) for you, default to true, 
    maxCrashFile: 50 // older files will be removed up, default 5 files are kept 
})
// the rest of the code changes
const botVersion = 'Jisbot 1.0.0'
let fs = require('fs')
const Discord = require('discord.js')
const ytdl = require('ytdl-core')
const path = require('path')
const bot = new Discord.Client()
const YouTube = require('youtube-node')
const youTube = new YouTube()
youTube.setKey(googleSearch)
const googleIms = require('google-ims')
let client = googleIms('016227928627283430649:sy5nfspjpus', googleSearch)
const replace = require("replace")
let settings = require('./settings.js')
let defSettings = require('./settings_default.js')
const prefix = '!'

const commands = [
	/*0*/'hello',
	/*1*/'bye',
	/*2*/'ping',
	/*3*/'help',
	/*4*/'chooseow',
	/*5*/'ask',
	/*6*/'say',
	/*7*/'quote',
	/*8*/'sing',
	/*9*/'play',
	/*10*/'skip',
	/*11*/'remove',
	/*12*/'stop',
	/*13*/'queue',
	/*14*/'img',
	/*15*/'soup',
	/*16*/'info',
	/*17*/'settings'
]
const commandsInfo = [
	'Greetings message.', //hello
	'Farewell message', //bye
	'Shows bot\'s ping', //ping
	'Shows this message', //help
	'Chooses a random overwatch hero', //chooseow
	'Ask any question, most questions wil get you a yes, no or maybe answers', //ask
	'Say something to the bot', //say
	'Shows a random Zenyatta quote', //quote
	'Zenyatta will sing a song', //sing
	'Will play the YouTube (video or playlist) link or YouTube search result after it. If there is already a song playing it will add it to the queue', //play
	'Will skip the current song', //skip
	'Write the number corresponding to the song in the queue to remove it', //remove
	'Will stop the music and clear the queue', //stop
	'Shows the songs in the queue', //queue
	'Shows first image of google search', // img
	'Plays soup', //soup
	'Shows info over the bot', //info
	'Change settings for the bot. Use **!settings help** for more info. (only the owner of the server can change the settings)' //settings
]
var songQueue = []
function showTime()
{
	var date = new Date()
	var h = date.getHours().toString()
	var m = date.getMinutes().toString()
	var s = date.getSeconds().toString()
	var d = date.getDate()
	var m = date.getMonth() + 1
	var y = date.getFullYear()
	function str_pad_left(string,pad,length)
	{
	    return (new Array(length+1).join(pad)+string).slice(-length)
	}
	var finalTime = str_pad_left(h,'0',2)+':'+str_pad_left(m,'0',2)+':'+str_pad_left(s,'0',2)
	return  d + '/' + m + '/' + y + ' ' + finalTime
}

var servers = {}//changes only in one server
function play(connection, message)
{
	var server = servers[message.guild.id]

	server.dispatcher = connection.playStream(ytdl(server.queue[0], {filter: 'audioonly'}))

	server.queue.shift()

	server.dispatcher.on('end', function()
	{
		if (server.queue[0])
		{
			play(connection, message)
			console.log(showTime() + ' playing next song')
			bot.user.setPresence({ game: { name: 'Music', type: 0 } })
			songQueue.shift()
		}
		else
		{
			connection.disconnect()
			bot.user.setPresence({ game: { name: settings.gamePlaying, type: 0 } })
			songQueue = []
			console.log(showTime() + ' disconnected from voice channel')
		}
	})
}

bot.login(botToken)

bot.on('ready', function()
{
	console.log(showTime() + ' ' + botName + ' is here. Version ' + botVersion)
	bot.user.setPresence({ game: { name: settings.gamePlaying, type: 0 } })
})
bot.on('message', function(message)
{
	if (message.author.equals(bot.user)) return
	if (!message.content.startsWith(prefix)) return

	var args = message.content.substring(prefix.length).replace(/\s\s+/g, ' ').split(' ')
	
	function playMusic(botAction)
	{
		if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection)
		{
			play(connection, message)
			if (botAction === 'Singing')
			{
				bot.user.setPresence({ game: { name: 'Singing', type: 0 } })
				console.log(showTime() + ' singing in voice channel')	
			}
			else
			{
				bot.user.setPresence({ game: { name: 'Music', type: 0 } })
				console.log(showTime() + ' playing in voice channel')
			}
		})
	}

	function getVideoInfo(yturl)
	{

		return new Promise(function(resolve, reject) {
						
		  if (yturl.includes('https://www.youtube.com/watch?v='))
			{
				var id = yturl.split('https://www.youtube.com/watch?v=').pop()
				if (id.length < 11)
				{
					message.channel.send('Link incomplete.')
					console.log(showTime() + ' link incomplete')
					return
				}
				if (id.length > 11)
				{
					id = id.split('&').shift()
				}
			}
			else if (yturl.includes('youtu.be/'))
			{
				var id = yturl.split('youtu.be/').pop()
			}
			
			ytdl.getInfo(id, function(err, info)
			{
				if (err) throw err
				var title = info.title
				var length = info.length_seconds
				var time = length
				var minutes = Math.floor(time / 60)
				var seconds = time - minutes * 60
				var hours = Math.floor(time / 3600)
				time = time - hours * 3600
				function str_pad_left(string, pad, length)
				{
				    return (new Array(length+1).join(pad)+string).slice(-length)
				}
				var finalTime = str_pad_left(hours,'0',2)+':'+str_pad_left(minutes,'0',2)+':'+str_pad_left(seconds,'0',2)
				resolve('**' + title + '**' + ' [' + finalTime + ']')
				reject(err)
			})
						
		})
	}
	var permis = false
	function hasPermission()
	{
		if (message.author.id === message.guild.owner.id)
		{
				return permis = true
		}
		else
		{
			message.channel.send('You don\'t have permission to use this command!')
			return permis = false
		}
		console.log(message.guild.owner.id + ' <-------> ' + message.author.id)
	}

	switch (args[0].toLowerCase())
	{
		//hello
		case commands[0]:
			const hello = ['Greetings.', 'Peace be upon you.', 'Hello, world!']
			var randomNum = Math.floor(Math.random() * hello.length)
			var msg = hello[randomNum]
			message.reply(msg)
			console.log(showTime() + ' hello msg send')
			break
		//bye
		case commands[1]:
			const bye = ['Darkness falls.', 'Time is an illusion, but the illusion is about to run out.']
			var randomNum = Math.floor(Math.random() * bye.length)
			var msg = bye[randomNum]
			message.reply(msg)
			console.log(showTime() + ' bye message send')
			break
		//ping
		case commands[2]:
			message.channel.send('Pong ' + Math.floor(bot.ping) + ' ms.')
			console.log(showTime() + ' bot ping '  + bot.ping + ' ms')
			break
		//help
		case commands[3]:
			var embed = new Discord.RichEmbed()
			commands.forEach(
			function (item, index)
			{
				embed.addField('!' + item, commandsInfo[index])
			})
			embed.setColor(0xff9c00)
			message.channel.send(embed)
			console.log(showTime() + ' help message send')
			break
		//chooseow
		case commands[4]:
			const owCharacters = [
				'Doomfist',
				'Genji',
				'McCree',
				'Pharah',
				'Reaper',
				'Soldier: 76',
				'Sombra',
				'Tracer',
				'Bastion',
				'Hanzo',
				'Junkrat',
				'Mei',
				'Torbjörn',
				'Widowmaker',
				'D.VA',
				'Orisa',
				'Reinhardt',
				'Roadhog',
				'Winston',
				'Zarya',
				'Ana',
				'Lúcio',
				'Mercy',
				'Moira',
				'Symmetra',
				'Zenyatta'
			]
			var randomNum = Math.floor(Math.random() * owCharacters.length)
			var chooseow = owCharacters[randomNum]
			message.reply('Your hero is ' + chooseow)
			console.log(showTime() + ' ow hero send')
			break
		//ask
		case commands[5]:
			var msgCont = message.content.split('!ask').pop().toLowerCase()
			const answers = ['Yes', 'No', 'Maybe']
			var randomNum = Math.floor(Math.random() * answers.length)
			var answer = answers[randomNum]
			if (msgCont.includes('what time is it') || msgCont.includes('what is the time') || msgCont.includes('time'))
			{
				message.channel.send('It\'s ' + showTime() + '.')
				console.log(showTime() + ' time send')
			}
			else
			{
				if (args[1])
				{
					message.channel.send(answer + '.')
					console.log(showTime() + ' answer send')
				}
				else
				{
					message.channel.send('Ask a yes or no question.')
					console.log(showTime() + ' ask error send')
				}
			}
			break
		//say
		case commands[6]:
			var msgCont = message.content.split('!say').pop().toLowerCase()
			const responses = ['I don\'t know what you mean with ' + msgCont, 'I don\'t have many responses jet']
			var randomNum = Math.floor(Math.random() * responses.length)
			var response = responses[randomNum]
			
			if (msgCont.includes('i need healing'))
			{
				message.channel.send('Come here for healing.')
				console.log(showTime() + ' response send')
			}
			else
			{
				if (args[1])
				{
					message.channel.send(response + '.')
					console.log(showTime() + ' response send')
				}
				else
				{
					message.channel.send('You didn\'t say anything.')
					console.log(showTime() + ' say error send')
				}
			}
			break
		//quote
		case commands[7]:
			const quotes = [
				'We are in harmony.',
				'Death is whimsical today.',
				'Do I think? Does a submarine swim?',
				'Free your mind.', 'Hello, world!',
				'I dreamt I was a butterfly.',
				'I think, therefore I am.',
				'I will not juggle.',
				'Life is more than a series of ones and zeroes.',
				'Peace and blessings be upon you all.',
				'The Iris embraces you.',
				'Always strive for improvement.',
				'Trick or treat?',
				'No snowflake ever falls in the wrong place.',
				'Every rooster crows in its own pen.',
				'Walk along the path to enlightenment.',
				'If you do not change direction, you may end up where you are headed.'
			]
			var randomNum = Math.floor(Math.random() * quotes.length)
			var quote = quotes[randomNum]
			message.channel.send(quote)
			console.log(showTime() + ' quote send')
			break
		//sing
		case commands[8]:
			if (!message.member.voiceChannel)
			{
				message.channel.send('You must be in a voice channel.')
				console.log(showTime() + ' play not in channel error send')
				return
			}
			if (!servers[message.guild.id]) servers[message.guild.id] = { queue: [] }
			const songs = ['https://www.youtube.com/watch?v=aiWA7gO_cnk', 'https://www.youtube.com/watch?v=mRJrXRCq3w8']
			var randomNum = Math.floor(Math.random() * songs.length)
			var song = songs[randomNum]
			var server = servers[message.guild.id]
			server.queue.push(song)
			getVideoInfo(song)
			console.log(showTime() + ' song added to queue')
			playMusic('Singing')
			break
		//play
		case commands[9]:
			if (!args[1])
			{
				message.channel.send('Provide a link or song title and artist.')
				console.log(showTime() + ' play link error send')
				return
			}
			if (!message.member.voiceChannel)
			{
				message.channel.send('You must be in a voice channel.')
				console.log(showTime() + ' play not in channel error send')
				return
			}
			if (!servers[message.guild.id]) servers[message.guild.id] = { queue: [] }
			// YouTube link
			if (args[1].includes('https://') || args[1].includes('y2u.be/') || args[1].includes('youtu.be/'))
			{
				if (args[2])
				{
					message.channel.send('Too many arguments **!play url**')
					console.log(showTime() + ' too many arguments')
					return
				}
				if (args[1].includes('youtube.com/watch?v=') || args[1].includes('y2u.be/') || args[1].includes('youtu.be/'))
				{
					if (args[1].includes('y2u.be/'))
					{
						args[1] = args[1].split('y2u.be/').pop()
						args[1] = 'https://www.youtube.com/watch?v=' + args[1]
					}
					if (!args[1].includes('https://'))
					{
						args[1] = 'https://' + args[1]
					}
					var server = servers[message.guild.id]
					server.queue.push(args[1])
					playMusic()
					console.log(showTime() + ' song added to queue')
					getVideoInfo(args[1])
				}
				//playlists
				else if (args[1].includes('www.youtube.com/playlist?list='))
				{
					var playListID = args[1].split('https://www.youtube.com/playlist?list=').pop()
					if (playListID.length < 34)
					{
						message.channel.send('Link incomplete.')
						console.log(showTime() + ' link incomplete')
						return
					}
					if (playListID.length > 34)
					{
						playListID = playListID.split('&').shift()
					}
					function ytPlayList()
					{

						return new Promise(function(resolve, reject)
						{
							youTube.addParam('maxResults', settings.maxInPlaylist);
							youTube.getPlayListsItemsById(playListID, function(error, result)
							{
								if (error)
								{
									console.log(showTime() + ' ' + error)
									message.channel.send('This playlist is probably private.')
								}
								else
								{
									var playListLength = result.pageInfo.totalResults
									var server = servers[message.guild.id]

									if (playListLength > settings.maxInPlaylist)
									{
										message.channel.send('Playlists with more than ' + settings.maxInPlaylist + ' videos are not allowed.')
										console.log(showTime() + ' surpassed the limit of ' + settings.maxInPlaylist + ' item in a playlist')
										return
									}
									else
									{
										for (var i = 0; i < playListLength; i++)
										{
											var ytVideoId = result.items[i].contentDetails.videoId
											args[1] = 'https://www.youtube.com/watch?v=' + ytVideoId

											server.queue.push(args[1])

											resolve(result)
											reject(error)
											console.log(showTime() + ' song added to queue')
											getVideoInfo(args[1]).then(function(ytinfoName){
												message.channel.send(ytinfoName + ' added to queue!')
												songQueue.push(ytinfoName)
											}).catch(function(err){
												message.channel.send('Couldn\'t get song information.')
												console.log(showTime() + ' error no song information')
											})
										}
									}
								}
							})
						})
					}
					ytPlayList().then(function()
					{
						playMusic()
					}).catch(function(error){
						message.channel.send('Problem with playing music.')
						console.log(showTime() + ' ' + error)
					})
				}
				else
				{
					message.channel.send('Unsupported link, only youtube links work.')
					console.log(showTime() + ' not a youtube link')
					return
				}
			}
			// YouTube serach
			else
			{
				function ytSearch()
				{

					return new Promise(function(resolve, reject)
					{
						youTube.addParam('type', 'video')
						youTube.search(message.content.split('!play').pop(), 1, function(error, result)
						{
							if (error)
							{
								console.log(showTime() + ' ' + error)
								return
							}
							else
							{
								if (result.items[0] == undefined  || result.items[0].id.videoId == undefined)
								{
									message.channel.send('No search results.')
									console.log(showTime() + ' no search results')
								}
								else
								{
									var server = servers[message.guild.id]
									var ytVideoId = result.items[0].id.videoId
									var ytVideo = 'https://www.youtube.com/watch?v=' + ytVideoId

									resolve(result)
									reject(error)

									server.queue.push(ytVideo)

									console.log(showTime() + ' song added to queue')
									getVideoInfo(ytVideo).then(function(ytinfoName){
										message.channel.send(ytinfoName + ' added to queue!')
										songQueue.push(ytinfoName)
									}).catch(function(err){
										message.channel.send('Couldn\'t get song information.')
										console.log(showTime() + ' error no song information')
									})
								}
							}
						})
					})
				}
				ytSearch().then(function()
				{
					playMusic()
				}).catch(function(error){
					message.channel.send('Problem with playing music.')
					console.log(showTime() + ' ' + error)
				})
			}
			break
		//skip
		case commands[10]:
			var server = servers[message.guild.id]
			if (!message.member.voiceChannel)
			{
				message.channel.send('You must be in a voice channel.')
				console.log(showTime() + ' play not in channel error send')
				return
			}
			if (message.guild.voiceConnection)
			{
				if (server.dispatcher)
				{
					server.dispatcher.end()
				}
				console.log(showTime() + ' song skiped')
			}
			else
			{
				message.channel.send('You can\'t stop nothing.')
				console.log(showTime() + ' nothing to stop error send')
				return
			}
			break
		//remove
		case commands[11]:
			var server = servers[message.guild.id]
			if (!args[1])
			{
				message.channel.send('Type the number of the song you want to remove from the queue.')
				console.log(showTime() + ' no queue index selected error send')
				return
			}
			if (args[1] <= 0)
			{
				message.channel.send('Invalid number.')
				console.log(showTime() + ' invalid number error')
				return
			}
			if (!server.queue.length > 0)
			{
				message.channel.send('There are no songs in the queue.')
				console.log(showTime() + ' no queue')
				return
			}
			if (args[1] >= server.queue.length+1)
			{
				message.channel.send('Can\'t remove nothing.')
				console.log(showTime() + ' queue item doesn\'t exsist')
				return
			}
			if (args[1].includes('/') || args[1].includes('*') || args[1].includes('-') || args[1].includes('+'))
			{
				message.channel.send('You\'re not allowed to do that.')
				console.log(showTime() + ' someone tride to use "/", "-", "*", "+"')
				return
			}
			index = parseInt(args[1])
			server.queue.splice(index - 1, 1)
			songQueue.splice(index, 1)
			message.channel.send('Song removed from queue.')
			console.log(showTime() + ' song removed from queue')
			break
		//stop
		case commands[12]:
			var server = servers[message.guild.id]
			if (!message.member.voiceChannel)
			{
				message.channel.send('You must be in a voice channel.')
				console.log(showTime() + ' play not in channel error send')
				return
			}
			if (message.guild.voiceConnection)
			{
				server.queue.splice(0)
				if (server.dispatcher)
				{
					server.dispatcher.end()
				}
				console.log(showTime() + ' music stoped')
			}
			else
			{
				message.channel.send('You can\'t stop nothing.')
				console.log(showTime() + ' nothing to stop error send')
				return
			}
			break
		//queue
		case commands[13]:
			var server = servers[message.guild.id]
			if (!server || !songQueue.length > 0)
			{
				message.channel.send('There are no songs in the queue.')
				console.log(showTime() + ' no queue')
				return
			}
			var embed = new Discord.RichEmbed()
			var i = 0
			songQueue.forEach(
			function (item, index)
			{
				if (index === 0)
				{
					index = 'Now Playing'
				}
				embed.addField(index, songQueue[i])
				i++
			})
			embed.setColor(0x00c3ff)
			message.channel.send(embed)
			console.log(showTime() + ' queue list send')
			break
		//img
		case commands[14]:
			if (!args[1])
			{
				message.channel.send('No search query.')
				console.log(showTime() + ' no search query error')
				return
			}
			client.search(message.content.split('!img').pop(),
			{
				page: 1, // 10 results per page 
				safe: settings.imgSafeSearch, // high, medium, off 
				googlehost: 'google.com', // google domain to use
				num: 1 // number of results per page, default 10 

			}).then(function (images)
			{
				images.forEach(function(i, e, a)
				{
					message.channel.send(images[0].url)
					console.log(showTime() + ' image send')
				})
			}).catch(function(error){
					message.channel.send('No search results.')
					console.log(showTime() + ' no search results for image search')
			})
			break
		//soup
		case commands[15]:
			if (!message.member.voiceChannel)
			{
				message.channel.send('You must be in a voice channel.')
				console.log(showTime() + ' play not in channel error send')
				return
			}
			if (!servers[message.guild.id]) servers[message.guild.id] = { queue: [] }
			var server = servers[message.guild.id]
			const video = 'https://www.youtube.com/watch?v=4kqbKEqzsAI'
			server.queue.push(video)
			getVideoInfo(video)
			console.log(showTime() + ' song added to queue')
			playMusic()
			break
		//info
		case commands[16]:
				var embed = new Discord.RichEmbed()
				embed.setTitle(botVersion)
				embed.setURL('https://github.com/JWOverschot/discord-bot')
				embed.setAuthor('Jis van Overschot', 'https://cdn.discordapp.com/avatars/182166049314177024/d1ecfd5ecea840aef90ebfa89cef1ee8.png?size=2048')
				embed.setDescription('For releases and patch notes visit https://github.com/JWOverschot/discord-bot/releases')
				message.channel.send(embed)
				console.log(showTime() + ' ' + botVersion)
			break

		//only admin enebeld command
		case commands[17]:
			//checking for permission, if command needs permission always use this function and if statement
			hasPermission()
			//everything inside this if statement is only available to the owner of the guild,
			//so everything has to be inside this statment here!!
			if (permis === true)
			{
				if (!args[1])//add description on settings and how to edit!!
				{
					let str = JSON.stringify(settings, null, 1)
					console.log(str)
					return message.channel.send(
						'Max of songs in playlist: **' + settings.maxInPlaylist + '**\n' + 
						'Safe search strength: **' + settings.imgSafeSearch + '**\n' + 
						'The game the bot is playing: **' + settings.gamePlaying + '**' +
						'\n\n Type **!settings help** to see how to set the settings.'
					)
				}
				args[1] = args[1].toLowerCase()
				switch(args[1]) {
					case 'maxinplaylist':
						if (!args[2])
						{
							message.channel.send('maxInPlaylist is currently set to ' + settings.maxInPlaylist + '.')
							console.log(showTime() + ' maxInPlaylist is currently set to ' + settings.maxInPlaylist)
							return
						}
						if (args[2].toLowerCase() === 'reset') {
							args[2] = defSettings.maxInPlaylist
						}
						if (isNaN(parseInt(args[2]), 10) || args[2] < 1 || args[2] > 50)
						{
							message.channel.send('This is an invalid value.')
							console.log(showTime() + ' invalid value')
							return
						}
						if (args[2].includes('/') || args[2].includes('*') || args[2].includes('-') || args[2].includes('+'))
						{
							message.channel.send('You\'re not allowed to use **/** **-** ***** **+**.')
							console.log(showTime() + ' someone tride to use "/", "-", "*", "+"')
							return
						}
						replace({
							regex: 'maxInPlaylist": "' + settings.maxInPlaylist + '"',
							replacement: 'maxInPlaylist": "' + args[2] + '"',
							paths: ['./settings.js'],
							recursive: true,
							silent: true,
						})
						settings.maxInPlaylist = args[2]
						console.log(showTime() + ' settings updated')
						message.channel.send('maxInPlaylist is now changed to ' + args[2])
						console.log(showTime() + ' maxInPlaylist changed to ' + args[2])
						break

					case 'imgsafesearch':
						if (!args[2])
						{
							message.channel.send('imgSafeSearch is currently set to ' + settings.imgSafeSearch + '.')
							console.log(showTime() + ' imgSafeSearch is currently set to ' + settings.imgSafeSearch)
							return
						}
						args[2] = args[2].toLowerCase()
						if (args[2] === 'reset') {
							args[2] = defSettings.imgSafeSearch
						}
						if (args[2] == 'high' || args[2] == 'medium' || args[2] == 'off')
						{
							replace({
							regex: 'imgSafeSearch": "' + settings.imgSafeSearch + '"',
							replacement: 'imgSafeSearch": "' + args[2] + '"',
							paths: ['./settings.js'],
							recursive: true,
							silent: true,
							})
							settings.imgSafeSearch = args[2]
							console.log(showTime() + ' settings updated')
							message.channel.send('imgSafeSearch is now changed to ' + args[2])
							console.log(showTime() + ' imgSafeSearch changed to ' + args[2])
						}
						else {
							message.channel.send('This is an invalid value. You can choose between high, medium and off.')
							console.log(showTime() + ' invalid value')
							return
						}
						break

					case 'gameplaying':
						if (!args[2])
						{
							message.channel.send('gamePlaying is currently set to ' + settings.gamePlaying + '.')
							console.log(showTime() + ' gamePlaying is currently set to ' + settings.gamePlaying)
							return
						}
						if (args[2].toLowerCase() === 'reset') {
							args[2] = defSettings.gamePlaying
						}
						if (args[2].includes('\\') || args[2].includes('"') || args[2].includes('\''))
						{
							message.channel.send('You\'re not allowed to use **\\** **"** **\'**.')
							console.log(showTime() + ' someone tride to use \\, ", \'')
							return
						}
						let gameString = ''
						for (var i = 2; i < args.length; i++) {
							gameString += args[i] + ' '
						}
						gameString = gameString.trim()
						replace({
							regex: 'gamePlaying": "' + settings.gamePlaying + '"',
							replacement: 'gamePlaying": "' + gameString + '"',
							paths: ['./settings.js'],
							recursive: true,
							silent: true,
						})
						
						settings.gamePlaying = gameString
						bot.user.setPresence({ game: { name: settings.gamePlaying, type: 0 } })
						console.log(showTime() + ' settings updated')
						message.channel.send('gamePlaying is now changed to ' + gameString)
						console.log(showTime() + ' gamePlaying changed to ' + gameString)
						break

					case 'reset':
						delete require.cache[path.resolve('./settings_default.js')]
						defSettings = require('./settings_default.js')
						fs.writeFile('./settings.js', 'let settingsObj = ' + JSON.stringify(defSettings, null, 2) + '\nmodule.exports = settingsObj', function(err)
						{
							if(err)
							{
								return console.log(showTime() + ' ' + err)
							}
							delete require.cache[path.resolve('./settings.js')]
							settings = require('./settings.js')
						})
						bot.user.setPresence({ game: { name: defSettings.gamePlaying, type: 0 } })
						message.channel.send('Settings have been reset to default.')
						console.log(showTime() + ' settings reset')
						break

						case 'help':
							var embed = new Discord.RichEmbed()
							embed.addField('MaxInPlaylist', 'can be between 0 and 50')
							embed.addField('imgSafeSearch', 'can be Off, Medium or High')
							embed.addField('gamePlaying', 'can be anything you like')
							embed.setColor(0xff9c00)
							message.channel.send(embed)
							console.log(showTime() + ' settings help message send')
							break

					default:
						message.channel.send('There is no setting called ' + args[1] + '.')
						console.log(showTime() + ' invalid value')
						return
				}
			}
			break

		default:
			message.channel.send('"' + message.content + '"' + ' command does not exist, try !help.')
			console.log(showTime() + ' error command does not exist')
	}
})
