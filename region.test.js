const { Region, Board } = require('./pentomino')

test('should complain about invalid v region', () => {
  const b = Board.createBoard(5, 5)

  const without = [ // a v, blocking the upper left corner
    b.getSquare(2, 0),
    b.getSquare(2, 1),
    b.getSquare(2, 2),
    b.getSquare(1, 2),
    b.getSquare(0, 2),
  ]
  
  expect(Region.verifyRegions(b, without)).toBe(false)
})

test('should complain about invalid w region', () => {
  const b = Board.createBoard(5, 5)

  const without = [ // a w, blocking off 4, 4
    b.getSquare(4, 3),
    b.getSquare(3, 3),
    b.getSquare(4, 3),
    b.getSquare(2, 4),
    b.getSquare(3, 4),
  ]
  
  expect(Region.verifyRegions(b, without)).toBe(false)
})


test('block of through borders', () => {
  const b = Board.createBoard(5, 5)

  const without = [ // an i, running though the middle
    b.getSquare(2, 0),
    b.getSquare(2, 1),
    b.getSquare(2, 2),
    b.getSquare(2, 3),
    b.getSquare(2, 4),
  ]

  b.getSquare(3,2).properties.push('borderTop')
  b.getSquare(3,2).properties.push('borderRight')
  b.getSquare(3,3).properties.push('borderRight')
  b.getSquare(3,3).properties.push('borderBottom')

  b.finalizeBorders()

  expect(Region.verifyRegions(b, without)).toBe(false)
})
