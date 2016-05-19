// Carlos Vazquez Perez-Inigo

// Thanks to http://www.textfiles.com/etext/FICTION/
// READ https://docs.nodejitsu.com/articles/file-system/how-to-write-files-in-nodejs/

var N = require('../neuret');
var fs = require('fs');

// var layerLength = [[16,33],[1,50,100],[33,1],[100,8]];
var layerLength = [[16,33],[1,20,16],[33,16],[16,20],[16,1],[20,8]];
var layers = N.E.array(4,0);
layers[0] = [N.L.new(layerLength[0])];
for(var i = 1; i < layerLength.length; i++) {
	layers[i] = N.E.array(layerLength[i-1][layerLength[i-1].length-1], null, function() {
		return N.L.new(layerLength[i]);
	});
}

var learner = N.ML.new(layers);


var set = [];

function toBinary(char) {
	var a = char.charCodeAt(0).toString(2).split('');
	for(i in a) {
		a[i] = parseInt(a[i]);
	}
	var r = N.E.array(8,0);
	for(var j = 0; j < a.length; j++) {
		r[7-j] = a[a.length-j-1];
	}
	return r;
}
function toBinArray(sentence) {
	var a = N.E.array(sentence.length);
	for(var i = 0; i < sentence.length; i++) {
		a[i] = toBinary(sentence.charAt(i));
	}
	return a;
}
function toChar(binary) {
	for(var i in binary) {
		binary[i] = (binary[i] > 0.5 ? 1 : 0);
	}
	return String.fromCharCode(parseInt(binary.toString().split(',').join(''),2));
}

function sentenceToSample(sentence) {
	var trainSet = N.E.array(sentence.length+1);
	trainSet[0] = {inputs: [0,0,0,0,0,0,0,0], outputs: toBinary(sentence.charAt(0))};
	for(var i = 0; i < sentence.length-1; i++) {
		trainSet[i+1] = {inputs: toBinary(sentence.charAt(i)), outputs: toBinary(sentence.charAt(i+1))};
	}
	trainSet[i+1] = {inputs: toBinary(sentence.charAt(i)), outputs: [1,1,1,1,1,1,1,1]};
	return trainSet;
}

function sentencesToSet(sentences) {
	var set = [];
	for(var i in sentences){
		set.push(sentenceToSample(sentences[i]));
	}
	return set;
}

function train(sentences) {
	var set = sentencesToSet(sentences);
	var err, acErr;
	var attrs = {
		threshold: 0.01,
		timeout: 5*60000,
		timeLog: 1000,
		logFunction: function(error, epoch, time) {
			console.log(error + '\t' + epoch + '\t' + time/1000); 
		}
	};
	do {
		acErr = 0;
		err = 0;
		for(var i = 0; i < set.length; i++) {
			learner.clear();
			console.log("training: " + sentences[i]);
			err = learner.trainSet(set[i], 0.02, attrs);
			console.log((err > attrs.threshold ? 'Failed: ' : 'Trained: ') + sentences[i]);
		}
		for(i = 0; i < set.length; i++) {
			acErr += E.module(E.error(ideal,actual))
		}
		console.log(acErr);
	} while(acErr/sentences.length > attrs.threshold);
}

function EOF(x) {
	for(var i = 0; i < 8; i++) {
		if((x[i] > 0.5 ? 1 : 0) != 1) return false;
	}
	return true;
}

function test(prefix, max) {
	learner.clear();
	var binPrefix = toBinArray(prefix);
	var last = N.E.array(8,0);
	learner.setInput([0,0,0,0,0,0,0,0]).run();
	for(var i in binPrefix) {
		learner.setInput(binPrefix[i]).run();
	}
	last = learner.getOutput();

	str = prefix;
	for(i = 0; i < max && !EOF(last); i++) {
		if(!EOF(last)) {
			str += toChar(last);
		}
		last = learner.setInput(last).run().getOutput()
	}	
	return str;
}

function trainStandard() {
	train([
		"Hola, mundo",
		"Me llamo Beeper",
		"Juguemos a un juego",
		"Hasta luego"
	]);
}
function trainAnimals() {
	train([
		"Gato",
		"Perro",
		// "Conejo",
		// "Pato",
		// "Liebre",
		// "Gamo",
		// "Zorro",
		// "Anguila",
		"Gorila",
		"Marmota",
		"Marsopa",
		// "Canguro",
		// "Elefante",
		// "Jirafa",
		// "Zebra",
		// "Caballo",
		// "Cerdo",
		// "Cocodrilo",
		// "Serpiente",
		// "Armadillo",
		// "Rata",
		// "Koala",
		// "Ornitorrinco",
		"Tigre"
	]);
}

function trainDummy() {
	train([
		"ba",
		"be",
		"ci",
		"du"
	]);

	console.log(test("b", 10));
	console.log(test("b", 10));
	console.log(test("c", 10));
	console.log(test("d", 10));
}

// trainDummy();

module.exports = {
	learner: learner,
	trainAnimals: trainAnimals,
	trainStandard: trainStandard,
	train: train,
	test: function(n,p) {console.log(test(n,p));}
};

// learner.trainSet([{inputs:[0,0,0,0,0,0,0,0], outputs:[1,1,1,1,1,1,1,1]}], 0.5, 0.01);
// 
// console.log(learner.setInput([0,0,0,0,0,0,0,0]).run().getOutput());
// 
// fs.readFile('../books/A JOURNEY TO THE CENTER OF T', 'utf8', function (err,data) {
//   if (err) {
//     return console.log(err);
//   }
//   console.log(data);
// });

// function trainSentence(sentence) {
// 	var trainSet = N.E.array(sentence.length-1);
// 	for(var i = 0; i < sentence.length-1; i++) {
// 		trainSet[i] = {inputs: toBinary(sentence.charAt(i)), outputs: toBinary(sentence.charAt(i+1))};
// 	}

// 	console.log('Error\t\t\tEpoch\tTime');
// 	learner.trainSet(trainSet, 0.05, {
// 		threshold: 0.1,
// 		timeout: 600000,
// 		timeLog: 1000,
// 		logFunction: function(error, epoch, time) { console.log(error + '\t' + epoch + '\t' + time/1000); }
// 	});

// 	var str = "";
// 	for(var i = 0; i < trainSet.length; i++) {
// 		str += toChar(learner.setInput(trainSet[i].inputs).run().getOutput());
// 	}
// 	console.log(sentence.charAt(0)+str);
// }
