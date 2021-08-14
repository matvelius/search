// ID успешной посылки: 52347256

// ПРИНЦИП РАБОТЫ

// Моя реализация поисковой системы состоит из трёх основных частей: создания индекса
// документов, обработки запросов и подсчёта 5-ти самых релевантных документов.

// Первая часть алгоритма обрабатывает документы, поступающие на вход с помощью двух
// хеш-таблиц: "слово -> документы, в котором оно встречается" и "слово -> кол-во
// раз, которое оно встречается в конкретном документе".

// Вторая часть алгоритма работает с запросами: сначала мы извлекаем список документов,
// в которых встречается данное слово из первой хеш-таблицы, а затем обновляем
// релевантность каждого документа (используя вторую хеш-таблицу) в отдельном массиве.

// Третья часть отвечает за сортировку массива релевантностей документов и вывод данных.

// ДОКАЗАТЕЛЬСТВО КОРРЕКТНОСТИ

// Для каждого документа на входе мой алгоритм использует функцию addDocument, которая
// в свою очередь преобразует строку в массив и использует этот массив для заполнения
// вышеупомянутых хеш-таблиц. Для того, чтобы исключить повторы, используется структура
// данных Set.

// Запросы тоже преобрзуются в массив, а затем в Set для исключения повторяющихся слов.
// Подсчёт релевантности осуществляется только в тех документах, которые попали в первую 
// хеш-таблицу wordsInDocumentsHashTable, что сильно сужает диапазон поиска.

// ID документов сортируются по мере их релевантности, а при равных значениях - по порядку
// их поступления на входе. После сортировки нас интересуют только 5 самых релевантных
// документов, а документы с нулевой релевантностью отбрасываются.

// ВРЕМЕННАЯ СЛОЖНОСТЬ

// Подготовка данных: O(n), так как мы должны обойти все документы 2 раза

// Ответ на запрос: O(1), потому что благодаря подготовке данных, кол-во документов которые 
// нужно требуется обойти сильно снижается, а извлечение из хеш-таблицы происходит мгновенно 

// ПРОСТРАНСТВЕННАЯ СЛОЖНОСТЬ

// O(n), так как мы просто храним все данные и запросы посутпающие не вход

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
  for (const word of documentArray) {
    if (!wordsInDocumentsHashTable.has(word)) { // if this is the 1st time we encounter this word
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
  for (const word of documentArray) {
    if (!wordOccurencesInDocumentHashTable.has(word)) { // if this is the 1st time we encounter this word
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

    for (const word of uniqueQueryWords) {
      const documentsWhichContainWord = wordsInDocumentsHashTable.get(word)
      // continue to next word if the current word doesn't exist in any of the documents
      if (documentsWhichContainWord == null) {
        continue
      }

      for (const documentIndex of documentsWhichContainWord) {
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