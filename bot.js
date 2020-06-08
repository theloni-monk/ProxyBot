const fetch = require('node-fetch');
const Discord = require('discord.js');
const https = require('https');
const fs = require('fs');
const path = require('path');
let filePath = path.join(__dirname, '.creds');

var outDir = process.argv[2]; // directory to write proxied files to
var name = process.argv[3];

var download = (url, dest, cb) => {
    var file = fs.createWriteStream(dest);
    var request = https.get(url, function (response) {
        response.pipe(file); // pipe after handler set up
        file.on('finish', function() {
            file.close(cb);  // close() is async, call cb after close completes.
        });

    }).on('error', function (err) { // Handle errors
        fs.unlink(dest); // Delete the file async. (But we don't check the result)
        cb(err);
    });
};

// Initialize Discord Bot
var bot = new Discord.Client();

bot.on('ready', () => {
    console.log(`Logged in as ${bot.user.tag}!`);
    let channelID = '719599089884332086';
    bot.channels.fetch(channelID).then((channel) => channel.send('ProxyBot up and running on ' + name))
});

bot.on('message', msg => {
    msg.attachments.forEach(async (attachment) => {
        console.log('Recieved attachment');
        let url = attachment.url;
        let res = await fetch(url);

        if (res.ok) {
            download(url, outDir + url.split('/').slice(-1)[0], function (err) {
                if(err){
                    console.log(err);
                    msg.channel.send('ERROR! Unable to write file!');
                }
                else{
                    console.log("The file was saved!");
                    msg.channel.send('SUCCESS!')
                }
            });
        }
        else {
            console.log('unable to access url ' + url);
            msg.channel.send('ERROR! Unable to fetch file!')
            return;
        }
    });
});


var token;
fs.readFile(filePath, {encoding: 'utf-8'}, function (err, data) {
    if (!err) {
        token = data; // read auth token from creds file 
        bot.login(token).catch((err) => {
            console.log('invalid token')
        }); // login if valid
        console.log(token);
    } else {
        console.log(err);
    }
})