const Resemble = require('@resemble/node');
const fs = require('fs');
const path = require('path');

/* const texts = [
* 	"The Stork gladly accepted the invitation and arrived in good time and with a very good appetite.",
* 	"Float the soap on top of the bath water",
* 	"He was now in the last stage of a deadly fever",
* 	"My sister stayed with this family for a few days about twelve years ago.",
* 	"A king ruled the state in the early days.",
* 	"The house door stood open, and the rooms were all so empty.",
* 	"Feeling that Peter was on his way back, the Neverland had again woke into life. ",
* 	"I am used to working all night, and sleeping all day.",
* 	"A Wolf had been feasting too greedily, and a bone had stuck crosswise in his throat.",
* 	"The square wooden crate was packed to be shipped.",
* 	"Sometimes it saddens him, sometimes he makes light of it.",
* 	"That was what she must never tell her, not even to make her understand.",
* 	"Who had been watching me through the long night hours?",
* 	"Wipe the grease off his dirty face.",
* 	"She was in charge of the birds and the baby animals.",
* 	"After dinner his wife left the room, as did also the children.",
* 	"The purple tie was ten years old.",
* 	"For two days, Paris has been living on salt meat.",
* 	"The old Frog soon missed the little one and asked his siblings what had become of him.",
* 	"The juice of lemons makes fine punch.",
* 	"The term ended in late june that year.",
* 	"A gold vase is both rare and costly.",
* 	"This rugby season promises to be a very exciting one.",
* 	"Press the pants and sew a button on the vest.",
* 	"The bill was paid every third week.",
* 	"A pound of sugar costs more than eggs.",
* 	"And when they returned next day to look for their own axes, they were nowhere to be found. ",
* 	"Kindly, and without prejudice they give me the best advice.",
* 	"Grape juice and water mix well.",
* 	"What joy there is in living?",
* ];
 *  */


const texts = [
	'This is a test.', 'Hello world.',
	'This is a test.', 'This is a test.',
	'This is a test.', 'This is a test.',
	'This is a test.', 'This is a test.',
	'This is a test.', 'This is a test.',
	'This is a test.', 'This is a test.',
	'This is a test.', 'This is a test.',
	'This is a test.', 'This is a test.',
	'This is a test.', 'This is a test.',
	'This is a test.', 'This is a test.',
	'This is a test.', 'This is a test.',
	'This is a test.', 'This is a test.',
	'This is a test.', 'This is a test.',
	'This is a test.', 'This is a test.',
	'This is a test.', 'This is a test.'
]

const resemble = Resemble('v2', 'ywo6XSMrQ0xmrSCQAzADnQtt');

async function createRecordings(voiceUUID, voiceName) {
	console.log('creating recordings for ', voiceName);
	const voice_dir = path.resolve(`./voice_data/${voiceName}`);
	const files = fs.readdirSync(voice_dir);

	const recordingPromises = files
		.map(path.parse)
		.filter(({ ext }) => ext === ".wav")
		.map(async parsedPath => {
			const file = fs.createReadStream(parsedPath.base);
			const fileName = parsedPath.name;
			const text = texts[fileName];

			const response = await resemble.recordings.create(
				voiceUUID,
				{
					name: voiceName,
					text,
					is_active: true,
					emotion: 'neutral'
				},
				file
			);

			if (response.success === false) {
				console.error("error while creating recording ", text, voiceName);
			}

			console.log('created recording: ', text);
			console.log(response);
		});

	return Promise.all(recordingPromises);
}

async function createVoice(name) {
	const createVoiceRes = await resemble.voices.create({ name });
	const voiceUUID = createVoiceRes.item.uuid;
	console.log("voice uuid=", voiceUUID);
	//await createRecordings(voiceUUID, name)
	//resemble.voices.build(voiceUUID);
	return
}

function main(){
	console.log('START')
	const VOICE_DIR = './voice_data/';
	const voicePromises = fs.readdirSync(VOICE_DIR, { withFileTypes: true })
							.filter(dirEnt => dirEnt.isDirectory())
							.map(dirEnt => dirEnt.name)
							.map(createVoice);
	
	Promise.all(voicePromises)
		   .then(() => { console.log("STOP") });
}

main();

