const { exit } = require('process');
let readline = require('readline');
let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let lineIndex = 0
let numberOfDocuments = 0
let documentsAsArrays = []
let numberOfQueries = 0
let queries = []

let documentRelevances = []

const wordsInDocumentsHashTable = new Map()
const wordOccurences = []

rl.on('line', function (line) {

  if (lineIndex == 0) {

    numberOfDocuments = parseInt(line)
    documentsAsArrays = new Array(numberOfDocuments)

  } else if (lineIndex <= numberOfDocuments) { // fill the documents array

    addDocument(line, lineIndex - 1)

  } else if (lineIndex == numberOfDocuments + 1) {

    numberOfQueries = parseInt(line)

  } else if (lineIndex <= numberOfDocuments + numberOfQueries) { // fill the queries array

    queries.push(line)

  } else {

    queries.push(line)

    calculateRelevance()

    outputResults()

    rl.close()
    exit(0)

  }

  lineIndex += 1

})

function addDocument(line, documentIndex) {
  const documentArray = line.split(' ')
  documentsAsArrays[documentIndex] = documentArray
  fillWordsInDocumentsHashTable(documentArray, documentIndex)
  getWordOccurencesInDocumentHashTable(documentArray)
}

// word -> documents which contain it
function fillWordsInDocumentsHashTable(documentArray, documentIndex) {
  for (let i = 0; i < documentArray.length; i++) {
    const word = documentArray[i]
    if (wordsInDocumentsHashTable.get(word) == null) { // if this is the 1st time we encounter this word
      const documentIDSet = new Set()
      documentIDSet.add(documentIndex)
      wordsInDocumentsHashTable.set(word, documentIDSet)
    } else { // this word was already mapped previously and we just need to add another document ID
      const existingSet = wordsInDocumentsHashTable.get(word)
      existingSet.add(documentIndex)
    }
  }
}

// word -> number of times it occurs in a specific document
function getWordOccurencesInDocumentHashTable(documentArray) {
  const wordOccurencesInDocumentHashTable = new Map()
  for (let i = 0; i < documentArray.length; i++) {
    const word = documentArray[i]
    if (wordOccurencesInDocumentHashTable.get(word) == null) { // if this is the 1st time we encounter this word
      wordOccurencesInDocumentHashTable.set(word, 1)
    } else { // this word was already mapped previously and we just need to increment the count
      wordOccurencesInDocumentHashTable.set(word, wordOccurencesInDocumentHashTable.get(word) + 1)
    }
  }
  wordOccurences.push(wordOccurencesInDocumentHashTable)
}

function calculateRelevance() {

  documentRelevances = new Array(numberOfQueries)

  for (let i = 0; i < numberOfQueries; i++) { // iterate over all queries

    const queryArray = queries[i].split(' ')
    const uniqueQueryWords = new Set(queryArray)

    const relevantDocuments = new Map()

    for (word of uniqueQueryWords) {
      const documentsWhichContainWord = wordsInDocumentsHashTable.get(word)
      // continue to next word if the current word doesn't exist in any of the documents
      if (documentsWhichContainWord == null) {
        continue
      }

      for (documentIndex of documentsWhichContainWord) {
        const numberOfOccurences = wordOccurences[documentIndex].get(word)
        const currentRelevanceOfDocument = relevantDocuments.get(documentIndex)
        if (currentRelevanceOfDocument == null) { // if this is the 1st time we set relevance of this document
          relevantDocuments.set(documentIndex, numberOfOccurences)
        } else { // this word was already mapped previously and we just need to update the relevance
          relevantDocuments.set(documentIndex, currentRelevanceOfDocument + numberOfOccurences)
        }
      }
    }

    documentRelevances[i] = relevantDocuments
  }
}

function outputResults() {
  for (let j = 0; j < numberOfQueries; j++) {

    const unsortedDocumentRelevancesForQuery = documentRelevances[j] // map ( { documentIndex: relevance })
    const mostRelevantDocumentsForQuery = []

    for (const [documentIndex, relevance] of unsortedDocumentRelevancesForQuery) {
      // [doc index, relevance] -- not zero-indexed anymore!
      mostRelevantDocumentsForQuery.push([documentIndex + 1, relevance])
    }

    mostRelevantDocumentsForQuery.sort((a, b) => {
      if (a[1] == b[1]) {
        return a[0] - b[0]
      }
      return b[1] - a[1]
    })

    const output = []

    // print sorted document indices (1-indexed) for up to 5 most relevant documents (if not zero!)
    for (let l = 0; l < 5; l++) {
      if (mostRelevantDocumentsForQuery[l] == null) {
        break
      }
      if (mostRelevantDocumentsForQuery[l][1] == 0) { // if value is zero, break out of the loop
        break
      }
      output.push(mostRelevantDocumentsForQuery[l][0])
    }

    console.log(output.join(' '))
  }
}