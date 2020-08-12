const { Pentomino, Board, State } = require('./pentomino')
const fs = require('fs')

const cmp = (a, b) =>  a.hash() < b.hash()

const toJson = boards => {
  return boards.sort(cmp).map(b => b.toJson())
}


/**
test('Should solve correct puzzle', () => {
  const json = fs.readFileSync('./smile.json', 'utf8')
  const answer = JSON.parse(fs.readFileSync('./smile_answer.json', 'utf8'))
  const data = JSON.parse(json)
  const board = Board.fromJson(data)
  const state = new State(board, () => {})
  
  while (state.moreMoves) {
    state.advanceBoard()
  }
  expect(toJson(state.doneBoards)).toEqual(answer)
})
*/

test('Should find all the solutions to an incorrect puzzle', () => {
  const json = fs.readFileSync('./rebel.json', 'utf8')
  const answer = JSON.parse(fs.readFileSync('./rebel_answer.json', 'utf8'))
  const data = JSON.parse(json)
  const board = Board.fromJson(data)
  const state = new State(board, () => {})
  
  while (state.moreMoves) {
    state.advanceBoard()
  }

  expect(toJson(state.doneBoards)).toEqual(answer)
})
