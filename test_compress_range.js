//https://www.random.org/cgi-bin/randbyte?nbytes=1024&format=b

const Util = require("./util")
const HuffmanEncoder = require("./huffman")
const exec = require('await-exec')
const fs = require('fs');

function buildBitSet(n2Pow, evenOdd) {

	var start = Math.pow(2, n2Pow - 1)
	var end = Math.pow(2, n2Pow)
	var bitSetSize = 0
	var exists = 0
	result = []
	if (n2Pow == 0) start = 0
	for (i = start; i < end; i++) {
		if (evenOdd == "even") {
			if (i % 2 != 0) continue
		}
		if (evenOdd == "odd") {
			if (i % 2 == 0) continue
		}
		result.push(i)
		bitSetSize++ //number of items of this bit set
		if (process.options.indexOf("show_set") != -1)
			console.log(i + " " + i.toByteString())

	}
	console.log("       " + n2Pow + " evenOdd = " + evenOdd + " unique size :" + result.length)
	var resultJson = {
		size: result.length,
		bitSize: Math.ceil(Math.log2(result.length)),
		items: result
	}
	return resultJson
}


function doTest() {

	console.log("\n--------------------------------------------------------------------\n")
	console.log("Options: show_unique_info show_dist show_set")
	var fs = require('fs');

	process.options = process.argv[3] || ""
	if (!process.argv[2]) {
		console.log("Error: Missing target file parameter")
		return
	}
	console.log("Processing " + process.argv[2] + "...");

	var bytes = fs.readFileSync(process.argv[2]);

	console.log("buffer length = " + bytes.length + " bytes")

	if (process.options.indexOf("show_unique_info") != -1) {
		function onlyUnique(value, index, self) {
			return self.indexOf(value) === index;
		}
		var bytes_unique = bytes.filter(onlyUnique)

		console.log("unique_size = " + bytes_unique.length)

		var loop_uniques_count = 0
		var bytes_count = {};
		for (var i = 0; i < bytes.length; i++) {
			bytes_count[bytes[i]] = 1 + (bytes_count[bytes[i]] || 0);
		}

		Object.keys(bytes_count).forEach(key => {
			if (bytes_count[key] > 1) {
				loop_uniques_count++
			}
		}
		);

		console.log("loop_uniques_count = ", loop_uniques_count)
	}

	if (process.options.indexOf("show_dist") != -1) {
		console.log("bytes_count")
		console.log(bytes_count)
	}

	analyzeMinimalBitCostFromDistribution(bytes)
}


//TODO add distribute count

function buildBitSetDatabase() {
	var bitSetList = []

	console.log("build BitSet Database\n")
	for (var k = 8; k >= 0; k--) {
		/*
		var oddList = buildBitSet(k, "odd")
		var evenList = buildBitSet(k, "even")
		bitSetList.push(oddList)
		bitSetList.push(evenList)
		///*/
		//*
		var allList = buildBitSet(k, null)
		bitSetList.push(allList)
		//*/
	}
	return bitSetList
}


async function analyzeMinimalBitCostFromDistribution(bytes) {
	console.log("Analyze minimal bit cost from distribution")
	var shrinkedMap = {}
	var distributeList = []
	var bitSetDistributeList = [] //<byte index -> bitSetID>
	var shrinkedItemList = [] //byte values + bitset info
	var shrinkedValueList = [] //byte values only
	var bitSetDistributeMap = [] //<bitSetID, num of instances>
	var shrinkedValueDistributeMap = [] ///<shrinkedValue, num of instances>

	var bitSetList = buildBitSetDatabase()

	console.log("build distributeList\n")
	console.log("\nbuild distributeList probability map")

	for (var i = 0; i < bytes.length; i++) {
		var byte = bytes[i]
		var foundIndex = -1
		for (var setIndex = 0; setIndex < bitSetList.length; setIndex++) {
			var bitSet = bitSetList[setIndex]

			foundIndex = bitSet.items.indexOf(byte)
			if(foundIndex != -1) {
				shrinkedItemList[i] = {
					originalValue: byte,
					bitSetID: setIndex,
					bitSize: bitSet.bitSize,
					shrinkedValue: foundIndex
				}
				break;
			}
		}
		if(foundIndex == -1) {
			console.error("Item does not belong to any bit set: bytes[" + i + "] = " + byte)
		}
	}

	shrinkedValueList = shrinkedItemList.map(function(item) {
		if(item.bitSize == 0) return null
		return item.shrinkedValue
	})

	shrinkedValueList = shrinkedValueList.filter(function(item){
		return item != null
	})

	bitSetDistributeList = shrinkedItemList.map(function(item) {
		return item.bitSetID
	})

	
	console.log("shrinkedItemList")

	console.log(shrinkedItemList)

	console.log("bitSetDistributeList")

	console.log(bitSetDistributeList)

	bitSetDistributeBytes = bitSetDistributeList
	ShrinkedListBytes = shrinkedValueList

	// var bitsetTypeBitSize = Math.ceil(Math.log2(16))
	// var bitSetDistributeBinaryString = shrinkedItemList.map(function(item) {
	// 	return (item.bitSetID).toByteString(bitsetTypeBitSize)
	// }).join("")
	// console.log("bitSetDistributeBinaryString.length",bitSetDistributeBinaryString.length)
	// bitSetDistributeBytes = Util.toBytes(bitSetDistributeBinaryString)
	// console.log("bitSetDistributeBytes.length",bitSetDistributeBytes.length)


	var ShrinkedListBitString = shrinkedItemList.map(function(item) {
		if(item.bitSize)
		return (item.shrinkedValue).toByteString(item.bitSize)
		return ""
	}).join("")
	console.log("ShrinkedListBitString.length",ShrinkedListBitString.length)
	ShrinkedListBytes = Util.toBytes(ShrinkedListBitString)
	console.log("ShrinkedListBytes.length",ShrinkedListBytes.length)

	for(var value of bitSetDistributeList) {
		bitSetDistributeMap[value] = 1 + (bitSetDistributeMap[value] || 0);
	}

	for(var value of shrinkedValueList) {
		shrinkedValueDistributeMap[value] = 1 + (shrinkedValueDistributeMap[value] || 0);
	}


	console.log("bitSetDistributeMap")

	console.log(Util.toObject(bitSetDistributeMap))

	console.log("shrinkedValueDistributeMap")

	console.log(Util.toObject(shrinkedValueDistributeMap))

	console.log("Build huffman code of bitset distribute list..")

	var bitSizeMapEncodeResult = HuffmanEncoder.encode("", bitSetDistributeMap)
	var tryCount = 10000

	console.log("Retry " + tryCount + " times to find the most optimal encode...")

	while (tryCount--) {
		var newResult = HuffmanEncoder.encode("", bitSetDistributeMap)
		if (newResult.size < bitSizeMapEncodeResult.size) {
			bitSizeMapEncodeResult = newResult
		}
		//console.log(newResult.size)
	}

	console.log("best encodedSize = " + bitSizeMapEncodeResult.size);
	console.log("dict = ");
	console.log(bitSizeMapEncodeResult.dict)

	var bitSetDistributeListHuffmanCodedBitString = bitSetDistributeList.map(function(item) {
		return bitSizeMapEncodeResult.dict[item]
	}).join("")

	console.log("bitSetDistributeListHuffmanCodedBitString.length", bitSetDistributeListHuffmanCodedBitString.length)
	bitSetDistributeBytes = Util.toBytes(bitSetDistributeListHuffmanCodedBitString)
	console.log("bitSetDistributeBytes.length",bitSetDistributeBytes.length)

	var totalBitsAfterShrinkedToFit = ShrinkedListBitString.length;

	var pack_size = bytes.length

	console.log("totalBitsAfterShrinkedToFit = " + totalBitsAfterShrinkedToFit)

	// console.log("try to encode shrinked byte list using huffman code")
	// console.log(shrinkedMap)
	// var shrinkedMapEncodedResult = HuffmanEncoder.encode("", shrinkedMap)
	// tryCount = 10000

	// console.log("Retry " + tryCount + " times to find the most optimal encode...")

	// while (tryCount--) {
	// 	var newResult = HuffmanEncoder.encode("", shrinkedMap)
	// 	if (newResult.size < shrinkedMapEncodedResult.size) {
	// 		shrinkedMapEncodedResult = newResult
	// 	}
	// 	//console.log(newResult.size)
	// }

	// console.log("best encodedSize = " + shrinkedMapEncodedResult.size);
	// // console.log("dict = ");
	// // console.log(shrinkedMapEncodedResult.dict)

	// if (shrinkedMapEncodedResult.size < totalBitsAfterShrinkedToFit) {
	// 	totalBitsAfterShrinkedToFit = shrinkedMapEncodedResult.size
	// 	console.log("Update : totalBitsAfterShrinkedToFit = " + totalBitsAfterShrinkedToFit)

	// }


	console.log("\nTry to compress bitsetDist & shrinkedList using ZPAQ....")

	Util.writeFileSync("./bitsetDist.uz", Buffer.from(bitSetDistributeBytes))
	Util.writeFileSync("./shrinkedList.uz", Buffer.from(ShrinkedListBytes))

	var commands =  "rm -rf ./bitsetDist.zpaq; zpaq a bitsetDist.zpaq ./bitsetDist.uz -method 5"
	commands += ";rm -rf ./shrinkedList.zpaq; zpaq a shrinkedList.zpaq ./shrinkedList.uz -method 5"

	var execResult = await exec(commands)

	bitsetDistZpaqSize = Util.getFilesizeInBytes("./bitsetDist.zpaq")
	console.log("bitsetDist.zpaq size = " +bitsetDistZpaqSize+ " bytes = " + bitsetDistZpaqSize*8 + " bits")
	shrinkedListZpaqSize = Util.getFilesizeInBytes("./shrinkedList.zpaq")
	console.log("shrinkedList.zpaq size = " +shrinkedListZpaqSize+ " bytes = " + shrinkedListZpaqSize*8 + " bits")
	console.log("\n")

	var shrinkedPackSize = totalBitsAfterShrinkedToFit < shrinkedListZpaqSize*8? totalBitsAfterShrinkedToFit : shrinkedListZpaqSize*8
	var bitSetInfoPackSize = bitSizeMapEncodeResult.size < bitsetDistZpaqSize*8? bitSizeMapEncodeResult.size : bitsetDistZpaqSize*8
	console.log("shrinkedPackSize",shrinkedPackSize)
	console.log("shrinkedPackSize",bitSetInfoPackSize)

	var totalBitsize = shrinkedPackSize + bitSetInfoPackSize

	console.log("Original bits size = " + pack_size * 8)
	console.log("Total bits used to encode = " + totalBitsize)

	console.log("Total bits saved = " + ((pack_size * 8) - totalBitsize))

	console.log("Compress ratio = " + (100 - ((totalBitsize / (pack_size * 8)) * 100)).toFixed(3) + " %")
}


doTest()

console.log("\n")

