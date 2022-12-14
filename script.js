const fs = require("fs");
const path = require("path");
const htmldecode = require("html-entities");
const shell = require("shelljs");
const axios = require("axios");
const chalk = require("chalk");

/**    CONFIG    */
//songs data array cant be easily posseseeed using Google Takeout if using YT Music
const SONGS = require("./data/songs_to_download_decoded_html.json");
//api daily rquests limit
const LIMIT = 1;
/**==============*/

(async function () {
	let regex = new RegExp(/(?<=\?v=).*/);

	for (let index = 0; index < LIMIT; index++) {
		const song = SONGS[index];
		const uri = song["URL utworu"].match(regex)[0];

		const options = {
			method: "GET",
			url: "https://youtube-mp36.p.rapidapi.com/dl",
			params: { id: uri },
			headers: {
				"X-RapidAPI-Key": "6a8e9a0cc8msh745b4e3d9ac8591p1b793bjsnd4edb93263b9",
				"X-RapidAPI-Host": "youtube-mp36.p.rapidapi.com",
			},
		};

		try {
			await axios.request(options).then((response) => {
				const songName = `${song["Wykonawca"]} – ${song["Tytuł utworu"]}`;
				console.log(chalk.bold("DOWNLOADING: " + songName));
				shell.exec(
					`bash fetch.sh \"${response.data.link}\" \"${songName}.mp3\"`
				);
				console.log(chalk.bgGreen("OK"));
			});
		} catch (error) {
			console.error(chalk.bold(error.message));
			console.error(chalk.bgRed(error.response.data.message));
			break;
		}
	}
})();

/**
 * If songs list were retrived from html files directly this fn will
 *  decode html entities like eg.: "&nbsp;"
 */
function escape() {
	let temp = [];

	SONGS.forEach((song) => {
		temp.push({
			...song,
			"Tytuł utworu": htmldecode.decode(song["Tytuł utworu"]),
			Wykonawca: htmldecode.decode(song["Wykonawca"]),
		});
	});

	fs.writeFileSync(
		path.join(__dirname, "./songs_to_download_decoded_html.json"),
		JSON.stringify(temp),
		"utf8"
	);
}

/**
 * Utility function used to remove already existing titles from the array
 */
function match() {
	const old_songs = [];

	existing.forEach((element) => {
		const found = new_songs.find(
			(song) => song["Tytuł utworu"] === element["Tytuł utworu"]
		);
		if (found) {
			console.log(found["Tytuł utworu"], element["Tytuł utworu"]);
		}

		if (!found) {
			old_songs.push(element);
		}
	});

	const _new = [...old_songs, ...new_songs];

	fs.writeFileSync(
		path.join(__dirname, "./songs_to_download.json"),
		JSON.stringify(_new),
		"utf8"
	);
}
