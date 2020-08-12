const { Pentomino, Board } = require('./pentomino')
const fs = require('fs')

test('should compare two boards correctly', () => {
  const a = Board.createBoard(5, 5)
  const b = Board.createBoard(5, 5)
  const c = Board.createBoard(5, 5)

  const x = Pentomino.getAllTypes().x
  const y = Pentomino.getAllTypes().y
  a.addPentomino(x, 2, 2)
  b.addPentomino(y, 2, 2)
  c.addPentomino(y, 2, 2)

  expect(a.equalState(b)).toBe(false)
  expect(b.equalState(c)).toBe(true)
})

test('import and export JSON', () => {
  const json = fs.readFileSync('./smile.json', 'utf8')
  const data = JSON.parse(json)
  const board = Board.fromJson(data)
  const newJson = board.toJson()
  expect(newJson).toEqual(data)
})

test('places pentomino on board', () => {
  const b = Board.createBoard(5, 5)
  const p = Pentomino.getAllTypes().x
  b.addPentomino(p, 2, 2)
  expect(b.getSquare(2, 2).coveredBy).toBe(p)
  expect(b.getSquare(1, 2).coveredBy).toBe(p)
  expect(b.getSquare(3, 2).coveredBy).toBe(p)
  expect(b.getSquare(1, 2).coveredBy).toBe(p)
  expect(b.getSquare(3, 2).coveredBy).toBe(p)
  expect(b.getSquare(3, 3).coveredBy).toBe(null)
  expect(b.getSquare(1, 1).coveredBy).toBe(null)
})
