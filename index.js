// Carlos Vazquez Perez-Inigo

// Thanks to http://www.textfiles.com/etext/FICTION/
// READ https://docs.nodejitsu.com/articles/file-system/how-to-write-files-in-nodejs/

var N = require('../neuret');
var fs = require('fs');

// var layerLength = [[16,33],[1,50,100],[33,1],[100,8]];
// var layerLength = [[16,33],[1,20,16],[33,16],[16,20],[16,1],[20,8]];
// var layerLength = [[128,50],[1,10,5],[50,10,32],[5,3,1],[32,128]];
var layerLength = [[128,256],[1,1],[256,128]];
var layerLength = [[128,36],[1,8],[36,36],[8,1],[36,128]];
// var layerLength = [[16,33],[1,20,16],[33,16],[16,20],[16,1],[20,8]];

var layers = N.E.array(4,0);
layers[0] = [N.L.new(layerLength[0])];
for(var i = 1; i < layerLength.length; i++) {
	layers[i] = N.E.array(layerLength[i-1][layerLength[i-1].length-1], null, function() {
		return N.L.new(layerLength[i]);
	});
}

// var x = N.E.array(128,null, function(i,F) {
// 	return F.new(1,function(inputs) {
// 			return [inputs[0]>0.5 ? 1 : 0];
// 		},function(delta) {
// 			return [delta[0]-this.inputs[0]];
// 		},1,false);
// },[], N.X);

// layers.push(x);

// layers.push([N.X.new(128,function(inputs) {
// 	return inputs;
// },function(delta) {
// 	return delta;
// },128,false)]);

var maxLengthOfSentenceToGenerate = 30;

var set = [];

function toInput(char) {
	var code = N.E.array(128,0);
	code[char.charCodeAt(0)] = 1;
	return code;
}

function toInputSequence(sentence) {
	var a = N.E.array(sentence.length);
	for(var i = 0; i < sentence.length; i++) {
		a[i] = toInput(sentence.charAt(i));
	}
	return a;
}
function toOutput(code) {
	var argmax = 0;
	for(var i in code) {
		if(code[i] > code[argmax]) argmax = i;
	}
	return String.fromCharCode(argmax);
}

function sentenceToSample(sentence) {
	var trainSet = N.E.array(sentence.length+1);
	trainSet[0] = {inputs: N.E.array(128,0), outputs: toInput(sentence.charAt(0))};
	for(var i = 0; i < sentence.length-1; i++) {
		trainSet[i+1] = {inputs: toInput(sentence.charAt(i)), outputs: toInput(sentence.charAt(i+1))};
	}
	trainSet[i+1] = {inputs: toInput(sentence.charAt(i)), outputs: N.E.array(128,1)};
	return trainSet;
}

function sentencesToSet(sentences) {
	var set = [];
	for(var i in sentences){
		set.push(sentenceToSample(sentences[i]));
	}
	return set;
}

function stopFunc(x, i) {
	if(i > maxLengthOfSentenceToGenerate) return true;
	for(var j in x) {
		if (j < 0.5) return false;
	}
	return true;
}


var learner = N.Seq(N.MFF.new(layers), stopFunc, N.E.array(128,0), N.E.array(128,1));

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
		"Conejo",
		"Pato",
		"Liebre",
		"Gamo",
		"Zorro",
		"Anguila",
		"Gorila",
		"Marmota",
		"Marsopa",
		"Canguro",
		"Elefante",
		"Jirafa",
		"Zebra",
		"Caballo",
		"Cerdo",
		"Cocodrilo",
		"Serpiente",
		"Armadillo",
		"Rata",
		"Koala",
		"Ornitorrinco",
		"Tigre"
	]);
}

function trainDummy() {
	train([
		"belga",
		"dumbo"
	]);

	console.log(test("b", 10));
	console.log(test("be", 10));
	console.log(test("bel", 10));
	console.log(test("belg", 10));
	console.log(test("d", 10));
}

// trainDummy();

module.exports = {
	learner: learner,
	trainAnimals: trainAnimals,
	trainStandard: trainStandard,
	train: train,
	test: function(n,p) {console.log(test(n,p));},
	structure: layerLength
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
// 		trainSet[i] = {inputs: toInput(sentence.charAt(i)), outputs: toInput(sentence.charAt(i+1))};
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
// 		str += toOutput(learner.setInput(trainSet[i].inputs).run().getOutput());
// 	}
// 	console.log(sentence.charAt(0)+str);
// }
