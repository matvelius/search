const { exit } = require('process');
// let readline = require('readline');
// let rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
//   terminal: false
// });

let lineIndex = 0
let numberOfDocuments = 0
let documents = []
let documentsAsArrays = []
let numberOfQueries = 0
let queries = []
let queriesRelevance = [] // DELETE

let searchIndex = null

let documentRelevances = []


// rl.on('line', function (line) {

//   if (lineIndex == 0) {

//     numberOfDocuments = parseInt(line)

//   } else if (lineIndex <= numberOfDocuments) {

//     documents.push(line)

//   } else if (lineIndex == numberOfDocuments + 1) {

//     numberOfQueries = parseInt(line)

//     queriesRelevance = new Array(numberOfQueries).fill(0)

//     documentsAsArrays = new Array(numberOfDocuments)

//     for (let i = 0; i < numberOfDocuments; i++) {
//       documentsAsArrays[i] = documents[i].split(' ')
//     }

//     createSearchIndex()

//     console.log(searchIndex)

//   } else if (lineIndex <= numberOfDocuments + numberOfQueries) {

//     queries.push(line)

//   } else {

//     queries.push(line)

//     calculateRelevance()

//     console.log(queriesRelevance)

//     rl.close()
//     exit(0)

//   }

//   lineIndex += 1

// })


//// for testing: 

// numberOfDocuments = 1
// documents = ["i love coffee"]
// numberOfQueries = 1
// queries = ["i like black coffee without milk"]

// numberOfDocuments = 3
// documents = ["i love coffee", "coffee with milk and sugar", "free tea for everyone"]
// numberOfQueries = 3
// queries = ["i like black coffee without milk", "everyone loves new year", "mary likes black coffee without milk"]

numberOfDocuments = 6
documents = ["buy flat in moscow", "rent flat in moscow", "sell flat in moscow", "want flat in moscow like crazy", "clean flat in moscow on weekends", "renovate flat in moscow"]
numberOfQueries = 1
queries = ["flat in moscow for crazy weekends"]

queriesRelevance = new Array(numberOfQueries).fill(0)

documentsAsArrays = new Array(numberOfDocuments)

for (let i = 0; i < numberOfDocuments; i++) {
  documentsAsArrays[i] = documents[i].split(' ')
}

createSearchIndex()

calculateRelevance()

console.log(documentRelevances)

// sort the documentRelevances arrays for each query
for (let j = 0; j < numberOfQueries; j++) {
  // const mostRelevantDocumentsForQuery = Object.assign({}, documentRelevances[j])
  // console.log(mostRelevantDocumentsForQuery)
  const mostRelevantDocumentsForQuery = new Array(numberOfDocuments)
  const unsortedDocumentRelevancesForQuery = documentRelevances[j]
  for (let k = 0; k < numberOfDocuments; k++) {
    // [doc index, relevance] -- not zero-indexed anymore!
    mostRelevantDocumentsForQuery[k] = [k + 1, unsortedDocumentRelevancesForQuery[k]]
  }
  console.log("")
  console.log("%%% mostRelevantDocumentsForQuery before sorting:", mostRelevantDocumentsForQuery)

  mostRelevantDocumentsForQuery.sort((a, b) => {
    return b[1] - a[1] // sorting by value, which is at index 1
  })

  console.log("%%% mostRelevantDocumentsForQuery after sorting:", mostRelevantDocumentsForQuery)

  const output = []
  // print sorted document indices (1-indexed) for up to 5 most relevant documents (if not zero!)
  for (let l = 0; l < 5; l++) {
    if (mostRelevantDocumentsForQuery[l][1] == 0) { // if value is zero, break out of the loop
      break
    }
    output.push(mostRelevantDocumentsForQuery[l][0])
  }

  console.log("")
  console.log("!!!!! OUTPUT:")
  console.log(output.join(' '))
}

////

function calculateRelevance() {

  documentRelevances = new Array(numberOfQueries)
  for (let h = 0; h < numberOfQueries; h++) {
    documentRelevances[h] = new Array(numberOfDocuments).fill(0)
  }
  console.log("initial documentRelevances:", documentRelevances)

  for (let i = 0; i < numberOfQueries; i++) { // iterate over all queries

    console.log("query number", i, ":", queries[i])

    const queryArray = queries[i].split(' ')
    const queryArraySorted = queryArray.sort((a, b) => b.length - a.length) // THINK ABOUT REPEATED WORDS TOO! 
    // ELIMINATE THEM FROM THE QUERY?

    console.log("queryArraySorted", queryArraySorted)

    for (let j = 0; j < numberOfDocuments; j++) { // for each query, go thru all documents in the search index

      console.log("checking doc #", j, ":", documentsAsArrays[j])

      queryArraySorted.forEach(word => { // for each document, iterate over all words in the query 
        console.log("")
        console.log("** checking word:", word.toUpperCase())
        console.log("")

        const wordHash = hash(word)
        const searchIndexForDoc = searchIndex[j]
        console.log("  in searchIndexForDoc:", searchIndexForDoc)
        console.log("")

        // console.log("  ^^^ sanity check - hash for coffee:", hash("coffee"))
        // console.log("  ^^^ current word:", word)
        // console.log("  ^^^ current wordHash:", wordHash)
        // console.log("  ^^^ current searchIndexForDoc.length:", searchIndexForDoc.length)

        const htSize = Math.round(searchIndexForDoc.length)
        // console.log("  ^^^ current htSize:", htSize)
        const wordLookupIndex = wordHash % htSize
        console.log("    wordLookupIndex:", wordLookupIndex)
        console.log("")


        const wordIndicesInSearchIndex = searchIndexForDoc[wordLookupIndex]

        if (wordIndicesInSearchIndex != null) {
          console.log("      wordIndicesInSearchIndex:", wordIndicesInSearchIndex)
          wordIndicesInSearchIndex.forEach(wordIndex => {
            console.log("      checking wordIndex:", wordIndex)
            console.log("      documentsAsArrays[j][wordIndex]:", documentsAsArrays[j][wordIndex])
            if (documentsAsArrays[j][wordIndex] == word) {
              console.log("        documentsAsArrays[j][wordIndex] == word")
              console.log("        *** before update documentRelevances:", JSON.stringify(documentRelevances))

              console.log("         adding 1 to documentRelevances[", i, "]", "[", j, "]")
              documentRelevances[i][j] += 1

              console.log("        *** updated documentRelevances:", JSON.stringify(documentRelevances))
            }
          })
        } else {
          console.log("      nothing found")
        }

      })
    }
  }
}

function createSearchIndex() {

  searchIndex = new Array(numberOfDocuments)

  for (let i = 0; i < numberOfDocuments; i++) {
    const documentHashTable = createHashTable(documentsAsArrays[i])
    // console.log("hash table for document", documentsAsArrays[i], ":", documentHashTable)
    searchIndex[i] = documentHashTable
  }

  console.log("searchIndex:", searchIndex)

}

function createHashTable(array) {

  const arrayLength = array.length
  // console.log("")
  // console.log("&&& arrayLength:", arrayLength)
  const hashTableSize = Math.round(arrayLength * 1.7)
  const hashTable = new Array(hashTableSize)

  for (let i = 0; i < arrayLength; i++) {

    // console.log("&&& hashing word:", array[i])
    // console.log("&&& hash(array[i]): ", hash(array[i]))
    // console.log("&&& hashTableSize: ", hashTableSize)
    const htIndex = hash(array[i]) % hashTableSize
    // console.log("&&& resulting htIndex: ", htIndex)

    if (hashTable[htIndex] == null) {
      hashTable[htIndex] = [i]
    } else {
      hashTable[htIndex].push(i)
    }

  }

  return hashTable
}

function hash(s) {
  const sLength = s.length
  let hashValue = 0

  const a = 201326611
  const m = 4294967296

  for (let i = 0; i < sLength; i++) {
    if (i < sLength - 1) {
      hashValue = (hashValue + s.charCodeAt(i)) * a % m
    } else {
      hashValue = (hashValue + s.charCodeAt(i)) % m
    }
  }

  return hashValue
}

// const filteredQuadruplets = Array.from(new Set(allQuadruplets.map(JSON.stringify)), JSON.parse)