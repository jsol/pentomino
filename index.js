const BG = '\x1b[42m'
const RESET = '\x1b[0m'
  const colors = [
    '\x1b[41m  \x1b[0m',
    '\x1b[42m  \x1b[0m',
    '\x1b[43m  \x1b[0m',
    '\x1b[44m  \x1b[0m',
    '\x1b[45m  \x1b[0m',
    '\x1b[46m  \x1b[0m',
    '\x1b[47m  \x1b[0m',
  ]

  let colorIndex = 0

class Pentomino {
  constructor(letter, shape) {
    this.letter = letter
    this.shape = shape
  }

  getAllVariants() {
    const base = [
      this,
      this.rotate90(),
      this.rotate180(),
      this.rotate270()
    ]
    return base.concat(base.map(p => p.flipVertical()), base.map(p => p.flipHorizontal()))
      .filter((p, pos, arr) => {
        return arr.findIndex(p2 => p.equals(p2)) == pos
      })
  }

  equals(other) {
    if (this.letter != other.letter) {
      return false
    }

    if (this === other) {
      return true
    }

    for (let i = 0; i < 4; i++) {
      let found = false
      for (let j = 0; j < 4; j++) {
        if (this.shape[i].x == other.shape[j].x && this.shape[i].y == other.shape[j].y) {
          found = true
          break;
        }
      }
      if (!found) {
        return false
      }
    }
    return true
  }

  getSquaresCovered(center, board) {
    const squares = this.shape.map(mod => {
      const x = center.x + mod.x
      const y = center.y + mod.y
      const s = board.squares.get(Square.getId(x, y))
      if (s && s.viableSpace(this)) {
        return s
      }
      return null
    }).filter(s => s != null)

    if (squares.length < 4) {
      return false
    }

    squares.push(center)
    return squares
  }

  rotate90() {
    return new Pentomino(this.letter, this.shape.map(pos => {
      return { x: pos.y, y: -pos.x }
    }))
  }

  rotate180() {
    return new Pentomino(this.letter, this.shape.map(pos => {
      return { x: -pos.x, y: -pos.y }
    }))
  }

  rotate270() {
    return new Pentomino(this.letter, this.shape.map(pos => {
      return { x: -pos.y, y: pos.x }
    }))
  }

  flipVertical() {
    return new Pentomino(this.letter, this.shape.map(pos => {
      return { x: -1 * pos.x, y: pos.y }
    }))
  }

  flipHorizontal() {
    return new Pentomino(this.letter, this.shape.map(pos => {
      return { x: pos.x, y:  -1 * pos.y }
    }))
  }

  print() {
    const lines = []
    for (let i = 0; i < 5; i++) {
      lines[i] = []
    }

    lines[2][2] = true

    this.shape.forEach(pos => {
      lines[pos.x + 2][pos.y + 2] = true
    })

    let output = ''

    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (lines[i][j]) {
          output += `${BG}  ${RESET}`
        } else {
          output += '  '
        }
      }
      output += '\n'
    }
    console.log(output)
  }  
  
  getColor() {
    if (this.color) {
      return this.color
    }
    this.color = colors[colorIndex]
    colorIndex++
    colorIndex = colorIndex % colors.length
    return this.color
  }
}

class Region {
  constructor(id, squares = null) {
    if (squares) {
      this.squares = squares
    } else {
      this.squares = new Map()
    }
    this.id = id
  }

  isValid() {
    return this.squares.size % 5 == 0
  }

  addSquare(square) {
    const add = (x, y) => {
      const id = Square.getId(x, y)
      if (this.squares.has(id)) {
        this.squares.set(square.id, square)
      }
    }

    if (this.squares.size > 0) {
      add(square.x + 1, square.y)
      add(square.x - 1, square.y)
      add(square.x, square.y + 1)
      add(square.x, square.y - 1)
    } else {
      this.squares.set(square.id, square)
    }

    return this.squares.has(square.id)
  }

  static merge(id, regions) {
    let merged = regions[0].squares
    for (let i = 1; i < regions.length; i++) {
      merged = new Map([...merged, ...regions[i].squares])
    }
    return new Region(id, merged)
  }
}

class Square {
  constructor(x, y, letter = ' ', coveredBy = null) {
    this.x = x
    this.y = y
    this.id = Square.getId(x, y)
    this.letter = letter
    this.coveredBy = coveredBy
  }

  clone() {
    return new Square(
      this.x,
      this.y,
      this.letter,
      this.coveredBy
    )
  }

  canPlace(p, board) {
    if (!this.viableSpace(p)) {
      return false
    }
    const squares = p.getSquaresCovered(this, board)

    if (!squares) {
      return false
    }

    for (let i = 0; i < squares.length; i++) {
      if (squares[i].hasNeighbourWithLetter(board, p.letter)) {
        return false
      }
    }

    return this.verifyRegions(board, squares)
  }

  verifyRegions(board, without) {
    const squares = new Map(board.squares)
    without.forEach(w => { squares.delete(w.id) })

    const regions = new Map()
    let rId = 0

    squares.forEach(s => {
      if (s.coveredBy) {
        return
      }
      rId++
      const addedTo = []
      for (let r of regions.values()) {
        if (r.addSquare(s)) {
          addedTo.push(r)
        }
      }

      if (addedTo.length == 0) {
        const r = new Region(rId)
        r.addSquare(s)
        regions.set(r.id, r)
      }

      if (addedTo.length > 1) {
        const newRegion = Region.merge(rId, addedTo)
        addedTo.forEach(r => {
          regions.delete(r.id)
        })
        regions.set(newRegion.id, newRegion)
      }
    })

    for (let r of regions.values()) {
      if (!r.isValid()) {
        return false
      }
    }
    return true
  }

  hasNeighbourWithLetter(board, letter) {
    const neighbours = []
    board.addNeighbour(neighbours, this.x - 1, this.y)
    board.addNeighbour(neighbours, this.x + 1, this.y)
    board.addNeighbour(neighbours, this.x, this.y - 1)
    board.addNeighbour(neighbours, this.x, this.y + 1)

    for (let i = 0; i < neighbours.length; i++) {
      if (neighbours[i].coveredBy.letter == letter) {
        return true
      }
    }
    return false
  }

  viableSpace(p) {
    if (this.letter != ' ' && this.letter != p.letter) {
      return false

    }

    if (this.coveredBy != null) {
      return false
    }

    return true
  }

  static getId(x, y) {
    return `${x}|${y}`
  }
}

class Board {
  constructor() {
    this.squares = new Map()
  }

  getNumberOfPieces() {
    return this.squares.size / 5
  }

  addSquare(s) {
    this.squares.set(s.id, s)
  }

  clone() {
    const b = new Board()
    for (let s of this.squares.values()) {
      b.addSquare(s.clone())
    }
    return b
  }

  addPentomino(p, x, y) {
    const shape = [...p.shape]
    shape.push({x: 0, y: 0})
    shape.forEach(pos => {
      const mx = x + pos.x
      const my = y + pos.y
      const id = Square.getId(mx, my)
      this.squares.get(id).coveredBy = p
    })
  }

  addNeighbour(existing, x, y) {
    const id = Square.getId(x, y)
    if (this.squares.has(id) && this.squares.get(id).coveredBy) {
      existing.push(this.squares.get(id))
    }
  }

  isDone() {
    for (let s of this.squares.values()) {
      if (s.coveredBy == null) {
        return false
      }
    }
    return true
  }

  print() {
    const b = []

    for (let s of this.squares.values()) {
      if (!b[s.y]) {
        b[s.y] = []
      }

      if (!s.coveredBy) {
        b[s.y][s.x] = ' ' + s.letter
      } else {
        b[s.y][s.x] = s.coveredBy.getColor()
      }
    }

    for (let i = 0; i < b.length; i++) {
      console.log(b[i].join(''))
    } 
  }

  static createBoard(width, height) {
    const b = new Board()
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        const s = new Square(i, j)
        b.addSquare(s)
      }
    }
    return b
  }
}

class State {
  constructor(pentos, board) {
    const allPentos = {}
    let allPentosArray = []
    Object.keys(pentos).forEach(name => {
      allPentos[name] = pentos[name].getAllVariants()
      allPentosArray = allPentosArray.concat(allPentos[name])
    })
    this.allPentominos = allPentosArray

    this.originalBoard = board
    this.currentBoard = board
  }

  placeObvious (board) {
    let placed = true
    let moves
    while (placed) {
      placed = false
      moves = this.validMoves(board)

      Object.keys(moves).forEach(id => {
        const s = board.squares.get(id)
        if (s.coveredBy) {
          return
        }
        if (moves[id].length == 0) {
          console.log('No valid moves available for ' + id + '!')
          board.print()
          throw new Error()
        }
        if (moves[id].length == 1) {
          const place = moves[id][0].pentomino
          const placeAt = moves[id][0].square
          if (!placeAt.canPlace(place, board)) {
            console.log('No valid moves available for ' + id + '!')
            board.print()
            throw new Error()
          }

          board.addPentomino(place, placeAt.x, placeAt.y)
          placed = true
        }
      })
    }
    return moves
  }

  advanceBoard(board, depth = 0) {
    if (depth > 3) {
      throw new Error('Max search depth reached')
    }

    if (board.isDone()) {
      return true
    }

    const moves = this.placeObvious(board)
    let placed = false

    Object.keys(moves).forEach(id => {
      const s = board.squares.get(id)
      if (s.coveredBy) {
        return
      }
      
      if (moves[id].length <= 4) {
        const ok = []
        for (let i = 0; i < moves[id].length; i++) {
          try {
            const boardClone = board.clone()
            const place = moves[id][i].pentomino
            const placeAt = moves[id][i].square
            boardClone.addPentomino(place, placeAt.x, placeAt.y)
            if (this.advanceBoard(boardClone, depth + 1)) {
              // if the board becomes done by one of the options
              // then choose that one
              ok.length = 0
              ok.push(moves[id][i])
              break
            }
            ok.push(moves[id][i])
          } catch (e) {
            moves[id][i].error = e
          }
        }

        if (ok.length == 0) {
          board.print()
          let err = ''
          for (let i = 0; i < moves[id].length; i++) {
            err += moves[id][i].error.message + '\n'
          }
          
          throw new Error('No possible candidates for id ' + id + '\n' + err)
        }
        if (ok.length == 1) {
          const place = ok[0].pentomino
          const placeAt = ok[0].square
          if (!placeAt.canPlace(place, board)) {
            board.print()
            throw new Error('Possibility for id ' + id + ' dissapeared')
          }
          board.addPentomino(place, placeAt.x, placeAt.y)
          placed = true
        }
      }      
    })
    if (!placed) {
      console.log(moves)
      throw new Error('Could not place anything')
    }
    return board.isDone()
  }

  validMoves(board) {
    const res = {}
    for (let s of board.squares.values()) {
      res[s.id] = []
    }
    for (let s of board.squares.values()) {
      if (s.coveredBy) {
        continue
      }
      this.allPentominos.forEach(p => {
          if (s.canPlace(p, board)) {
            const squares = p.getSquaresCovered(s, board)
            squares.forEach(ok => {
              res[ok.id].push({ square: s, pentomino: p })
            })
          }
      }) 
    }
    return res
  }
}

const pentos = {
  f: new Pentomino('f', [{x: -1, y: 0}, {x: 1, y: 0}, {x: 0, y: -1}, {x: 1, y: 1}]),
  i: new Pentomino('i', [{x: 0, y: -1}, {x: 0, y: -2}, {x: 0, y: 1}, {x: 0, y: 2}]),
  l: new Pentomino('l', [{x: 0, y: -2}, {x: 0, y: -1}, {x: 0, y: 1}, {x: 1, y: 1}]),
  n: new Pentomino('n', [{x: -1, y: -1}, {x: 0, y: -1}, {x: 1, y: 0}, {x: 2, y: 0}]),
  p: new Pentomino('p', [{x: 0, y: -1}, {x: 1, y: -1}, {x: 1, y: 0}, {x: 0, y: 1}]),
  t: new Pentomino('t', [{x: 0, y: -1}, {x: 0, y: 1}, {x: -1, y: 1}, {x: 1, y: 1}]),
  u: new Pentomino('u', [{x: 0, y: -1}, {x: 1, y: -1}, {x: 1, y: 1}, {x: 0, y: 1}]),
  v: new Pentomino('v', [{x: -1, y: 0}, {x: -2, y: 0}, {x: 0, y: -1}, {x: 0, y: -2}]),
  w: new Pentomino('w', [{x: -1, y: -1}, {x: -1, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}]),
  x: new Pentomino('x', [{x: -1, y: 0}, {x: 1, y: 0}, {x: 0, y: -1}, {x: 0, y: 1}]),
  y: new Pentomino('y', [{x: -1, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 0, y: -1}]),
  z: new Pentomino('z', [{x: -1, y: -1}, {x: 0, y: -1}, {x: 0, y: 1}, {x: 1, y: 1}]),
}




const b = Board.createBoard(5, 5)
 b.squares.get(Square.getId(3,2)).letter = 'y'
 b.squares.get(Square.getId(0,3)).letter = 'l'
 b.squares.get(Square.getId(1,3)).letter = 'p'
// b.squares.get(Square.getId(0,0)).letter = 't'
 b.squares.get(Square.getId(4,0)).letter = 'w'

const state = new State(pentos, b)
//const ok = state.validMoves(b)


try {
    while(!state.advanceBoard(b)) {
      b.print()
    }

}catch (err) {
  console.log(err.message)
  console.log('Last position: ')
  b.print()
}
  if (b.isDone() ) {
    console.log('woho')
  }

//b.addPentomino(pentos.i, 4, 2)
//b.addPentomino(pentos.p.rotate90(), 1, 4)


console.log(Object.keys(pentos))
