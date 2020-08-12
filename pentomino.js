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
  static getAllTypes() {
    return {
      f: new Pentomino('f', [{x: -1, y: 0}, {x: 1, y: 0}, {x: 0, y: -1}, {x: 1, y: 1}], 'rgb(176, 110, 163)'),
      i: new Pentomino('i', [{x: 0, y: -1}, {x: 0, y: -2}, {x: 0, y: 1}, {x: 0, y: 2}], 'rgb(146, 27, 244)'),
      l: new Pentomino('l', [{x: 0, y: -2}, {x: 0, y: -1}, {x: 0, y: 1}, {x: 1, y: 1}], 'rgb(39, 118, 54)'),
      n: new Pentomino('n', [{x: -1, y: -1}, {x: 0, y: -1}, {x: 1, y: 0}, {x: 2, y: 0}], 'rgb(233, 240, 80)'),
      p: new Pentomino('p', [{x: 0, y: -1}, {x: 1, y: -1}, {x: 1, y: 0}, {x: 0, y: 1}], 'rgb(7, 110, 132)'),
      t: new Pentomino('t', [{x: 0, y: -1}, {x: 0, y: 1}, {x: -1, y: 1}, {x: 1, y: 1}], 'rgb(233, 27, 44)'),
      u: new Pentomino('u', [{x: 0, y: -1}, {x: 1, y: -1}, {x: 1, y: 1}, {x: 0, y: 1}], 'rgb(47, 165, 185)'),
      v: new Pentomino('v', [{x: -1, y: 0}, {x: -2, y: 0}, {x: 0, y: -1}, {x: 0, y: -2}], 'rgb(64, 228, 20)'),
      w: new Pentomino('w', [{x: -1, y: -1}, {x: -1, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}], 'rgb(166, 128, 121)'),
      x: new Pentomino('x', [{x: -1, y: 0}, {x: 1, y: 0}, {x: 0, y: -1}, {x: 0, y: 1}], 'rgb(92, 90, 70)'),
      y: new Pentomino('y', [{x: -1, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 0, y: -1}], 'rgb(18, 84, 244)'),
      z: new Pentomino('z', [{x: -1, y: -1}, {x: 0, y: -1}, {x: 0, y: 1}, {x: 1, y: 1}], 'rgb(124, 176, 226)'),
    }
  }

  constructor(letter, shape, color) {
    this.letter = letter
    this.shape = shape
    this.color = color
    this.id = shape.map(c => '' + c.x + c.y).join('')
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
    }), this.color)
  }

  rotate180() {
    return new Pentomino(this.letter, this.shape.map(pos => {
      return { x: -pos.x, y: -pos.y }
    }), this.color)
  }

  rotate270() {
    return new Pentomino(this.letter, this.shape.map(pos => {
      return { x: -pos.y, y: pos.x }
    }), this.color)
  }

  flipVertical() {
    return new Pentomino(this.letter, this.shape.map(pos => {
      return { x: -1 * pos.x, y: pos.y }
    }), this.color)
  }

  flipHorizontal() {
    return new Pentomino(this.letter, this.shape.map(pos => {
      return { x: pos.x, y:  -1 * pos.y }
    }), this.color)
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

  getHtmlColor() {
    if (this.color) {
      return this.color
    }

    /*
    this.color = 'rgb(' +
      Math.round((Math.random() * 255)) + ', ' +
      Math.round((Math.random() * 255)) + ', ' +
      Math.round((Math.random() * 255)) + ')'
*/
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
    this.options = []
    this.branchCount = 10
  }

  isValid() {
    return this.squares.size % 5 == 0
  }

  isComplete() {
    for (const s of this.squares.values()) {
      if (s.coveredBy == null) {
        return false
      }
    }
    return true
  }

  addSquare(square) {
    // Adds the region only if there is a neighbour present
    const add = (x, y) => {
      const id = Square.getId(x, y)
      if (square.borders.includes(id)) {
        return
      }

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

  static assignToSquares(regions) {
    for (let region of regions) {
      for (let s of region.squares.values()) {
        s.region = region
      }
    }
  }

  static merge(id, regions) {
    let merged = regions[0].squares
    for (let i = 1; i < regions.length; i++) {
      merged = new Map([...merged, ...regions[i].squares])
    }
    return new Region(id, merged)
  }

  static getRegions (squares) {
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
    return Array.from(regions.values())
  }

  static verifyRegions(board, without) {
    const squares = new Map(board.squares)
    without.forEach(w => { squares.delete(w.id) })

    const regions = Region.getRegions(squares)

    for (let r of regions) {
      if (!r.isValid()) {
        return false
      }
    }
    return true
  }
}

class Square {
  constructor(x, y, letter = ' ', properties = [], coveredBy = null, borders = []) {
    this.x = x
    this.y = y
    this.id = Square.getId(x, y)
    this.letter = letter
    this.properties = properties
    this.coveredBy = coveredBy
    this.borders = borders
  }

  clone() {
    return new Square(
      this.x,
      this.y,
      this.letter,
      this.properties,
      this.coveredBy,
      this.borders
    )
  }

  canPlace(p, board, log = false) {
    if (!log) {
      log = () => {}
    }

    if (!this.viableSpace(p)) {
      log('not a viable space')
      return false
    }
    const squares = p.getSquaresCovered(this, board)

    if (!squares) {
      log('Not enough squares')
      return false
    }

    const squareids = squares.map(s => s.id)

    for (let i = 0; i < squares.length; i++) {
      if (squares[i].borderWith(squareids)) {
        log('Due to borders')
        return false
      }

      if (squares[i].hasNeighbourWithLetter(board, p.letter, squareids)) {
        log('Due to neighbours')
        return false
      }
    }

    log('Could fail on regions')
    return Region.verifyRegions(board, squares)
  }

  borderWith(squareids) {
    return this.borders.filter(s => squareids.includes(s)).length > 0
  }


  hasNeighbourWithLetter(board, letter, shapeids) {
    const neighbours = []
    board.addNeighbour(neighbours, this.x - 1, this.y, shapeids)
    board.addNeighbour(neighbours, this.x + 1, this.y, shapeids)
    board.addNeighbour(neighbours, this.x, this.y - 1, shapeids)
    board.addNeighbour(neighbours, this.x, this.y + 1, shapeids)

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

  static propNameMap(b) {
    const m = {
      borderLeft: 'bl',
      borderRight: 'br',
      borderTop: 'bt',
      borderBottom: 'bb',
      bl: 'borderLeft',
      br: 'borderRight',
      bt: 'borderTop',
      bb: 'borderBottom'
    }
    return m[b]
  }

  toJson() {
    const d = {
      x: this.x,
      y: this.y,
      l: this.letter,
      p: this.properties.map(n => Square.propNameMap(n)),
    }

    if (d.l == ' ') {
      d.l = ''
    }

    if (this.coveredBy) {
      d.c = this.coveredBy.id
    }

    return d
  }

  static fromJson(data, pentos) {
    if (data.p.includes('b')) {
      // blank space
      return null
    }
    const s = new Square(data.x, data.y, data.l || ' ', data.p.map(n => Square.propNameMap(n)))
    if (data.c) {
      s.coveredBy = pentos.get(data.c)
    }
    return s
  }
}

class Board {
  constructor() {
    this.squares = new Map()
    this.moves = new Moves(this, {})
  }

  getNumberOfPieces() {
    return this.squares.size / 5
  }

  addSquare(s) {
    this.squares.set(s.id, s)
  }

  getSquare(x, y) {
    return this.squares.get(Square.getId(x, y))
  }
  getSquareId(id) {
    return this.squares.get(id)
  }

  initiateMoves(allPentominos) {
    this.moves = Moves.validMoves(this, allPentominos) 
  }

  finalizeBorders() {
    const add = (s, o) => {
      if (o) {
        s.borders.push(o.id)
        o.borders.push(s.id)
      }
    }

    for (let square of this.squares.values()) {
      if (square.properties.includes('borderLeft')) {
        const other = this.getSquare(square.x - 1, square.y)
        add(square, other)
      }

      if (square.properties.includes('borderRight')) {
        const other = this.getSquare(square.x + 1, square.y)
        add(square, other)
      }

      if (square.properties.includes('borderTop')) {
        const other = this.getSquare(square.x, square.y - 1)
        add(square, other)
      }

      if (square.properties.includes('borderBottom')) {
        const other = this.getSquare(square.x, square.y + 1)
        add(square, other)
      }
    }
  }

  equalState(other) {
    for (let s of this.squares.keys()) {
      if (this.squares.get(s).coveredBy != other.squares.get(s).coveredBy) {
        return false
      }
    }
    return true
  }

  getStats() {
    const stats = {f: 0, i: 0, l: 0, n: 0, p: 0, t:0, u:0, v:0, w: 0, x: 0, y: 0, z: 0}
    for (let s of this.squares.values()) {
      if (s.coveredBy) {
        stats[s.coveredBy.letter]++
      }
    }
    return Object.keys(stats).sort().map(k => k + ': ' + (stats[k] / 5)).join(', ')
  }

  hash() {
    return Array.from(this.squares.values()).map(s => {
      if (s.coveredBy) {
        return s.coveredBy.id
      }
      return ''
    }).join('\n')
  }

  clone() {
    const b = new Board()
    for (let s of this.squares.values()) {
      b.addSquare(s.clone())
    }
    b.moves = this.moves.clone(b)
    return b
  }

  addPentomino(p, x, y) {
    const s = this.getSquare(x, y)
    if (!s.canPlace(p, this)) {
      return false
    }
 
    const shape = p.shape.concat([{x: 0, y: 0}])
    for (let pos of shape) {
      const mx = x + pos.x
      const my = y + pos.y
      const s = this.getSquare(mx, my)
      s.coveredBy = p
      this.moves.placed(s.id)
    }
    return true
  }

  addNeighbour(existing, x, y, exclude) {
    const id = Square.getId(x, y)
    if (exclude.includes(id)) {
      return
    }
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

  toHtml() {
    const display = document.getElementById('display')
    const cells = display.getElementsByTagName('td')
    for (let y = 0, row; row = display.rows[y]; y++) {
      for (let x = 0, cell; cell = row.cells[x]; x++) {
        const s = this.squares.get(Square.getId(x, y))
        if (s) {
          if (s.coveredBy) {
            cell.style.backgroundColor = s.coveredBy.getHtmlColor()
          } else {
            cell.style.backgroundColor = 'white'
          }
        }
      }
    } 
  }

  toJson() {
    let w = 0
    let h = 0

    for (let s of this.squares.values()) {
      if (s.x > w) {
        w = s.x
      }
      if (s.y > h) {
        h = s.y
      }
    }

    const res = {
      width: w + 1,
      height: h + 1,
      cells: Array.from(this.squares.values()).map(s => s.toJson())
    }
    return res
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

  static fromJson(json) {
    const pentos = Object.values(Pentomino.getAllTypes())
    const allPentos = new Map()
    for (const p of pentos) {
      for (const pv of p.getAllVariants()) {
        allPentos.set(pv.id, pv)
      }
    }

    const b = new Board()
    for (let c of json.cells) {
      const s = Square.fromJson(c, allPentos)
      if (s) {
        b.addSquare(s)
      }
    }
    return b 
  }
}

class Moves {
  constructor(board, list) {
    this.board = board
    this.moves = list
  }

  clone(board) {
    const list = {}
    Object.keys(this.moves).forEach(id => {
      list[id] = [...this.moves[id]]
    })
    return new Moves(board, list)
  }

  placed(id) {
    this.moves[id] = []
  }

  get(id) {
    return this.moves[id]
  }

  validate() {
    const ok = {}
    const bad = {}

    for (const id of Object.keys(this.moves)) {
      this.moves[id] = this.moves[id].filter(move => {
        if (ok[move.square + move.pentomino.id]) {
          return true
        }
        if (bad[move.square + move.pentomino.id]) {
          return false
        }
        const square = this.board.getSquareId(move.square)
        if (square.canPlace(move.pentomino, this.board)) {
          ok[move.square + move.pentomino.id] = true
          return true
        } else {
          bad[move.square + move.pentomino.id] = true
          return false
        }
      })
    }
  }

  static validMoves(board, allPentominos) {
    const res = {}
    for (let id of board.squares.keys()) {
      res[id] = []
    }

    for (let s of board.squares.values()) {
      if (s.coveredBy) {
        continue
      }

      allPentominos.forEach(p => {
          if (s.canPlace(p, board)) {
            const squares = p.getSquaresCovered(s, board)
            squares.forEach(ok => {
              res[ok.id].push({ square: s.id, pentomino: p })
            })
          }
      })
    }
    return new Moves(board, res)
  }

}

class Branch {
  constructor(state, moves) {
    this.board = state.board.clone()
    this.state = state
    this.regions = Region.getRegions(this.board.squares)
    Region.assignToSquares(this.regions)
    this.options = this.buildOptions(moves)
  }

  buildOptions(moves) {
    for (let id of this.board.squares.keys()) {
      if (moves.get(id).length == 0) {
        continue
      }
      const r = this.board.squares.get(id).region
      if (moves.get(id).length < r.branchCount) {
        r.branchCount = moves.get(id).length
        r.options = moves.get(id)
        continue
      }
      if (moves.get(id).length == r.branchCount) {
        r.options = r.options.concat(moves.get(id))
      }
    }
    for (let r of this.regions) {
      r.options = r.options.filter((m, pos, arr) => {
        return arr.findIndex(m2 => m.square == m2.square && m.pentomino == m2.pentomino) == pos
      })
    }
  }

  pick() {
    for (let r of this.regions.sort((a, b) => a.squares.size > b.squares.size)) {
      if (r.options.length == 0) {
        continue
      }

      if (this.state.lastPick == null || r.options.length == 1) {
        const opt = r.options.pop()
        this.state.lastPick = this.board.getSquareId(opt.square)
        return opt
      }

      if (r.squares.size == 10) { // Region has space for exactly two Pentominoes, evaluate it first.
        const opt = r.options.pop()
        this.state.lastPick = this.board.getSquareId(opt.square)
        return opt
      }

      let closest = null
      let distance = Infinity

      const x = this.state.lastPick.x
      const y = this.state.lastPick.y
      r.options.forEach((opt, index) => {
        const square = this.board.getSquareId(opt.square)
        const nD = Math.abs(x - square.x) + Math.abs(y - square.y)
        if (nD < distance) {
          distance = nD
          closest = index
        }
      })
      const candidate = r.options[closest]
      r.options.splice(closest, 1)
      this.state.lastPick = this.board.getSquareId(candidate)
      return candidate
    }
    return null
  }

  hasMoves() {
    let verdict = false
    for (let r of this.regions) {
      if (r.options.length == 0 && !r.isComplete()) {
        // One area has no moves left but is not complete,
        // abandon this branch
        return false
      }
      if (r.options.length > 0) {
        // there are moves left in this branch, return true
        // if there are no regions that are screwed.
        verdict = true
      }
    }
    return verdict
  }

  printOptions(log) {
    log('Other options were: ')
    for (let r of this.regions) {
      log('- region size ' + r.squares.size)
      for (let move of r.options) {
        log('-- ' + move.pentomino.letter + ' at ' + move.square)
      }
    }
  }
}

class State {
  constructor( board, log) {
    const pentos = Pentomino.getAllTypes()
    const allPentos = {}
    let allPentosArray = []
    Object.keys(pentos).forEach(name => {
      allPentos[name] = pentos[name].getAllVariants()
      allPentosArray = allPentosArray.concat(allPentos[name])
    })
    this.allPentominos = allPentosArray

    board.finalizeBorders()
    board.initiateMoves(allPentosArray)

    this.board = board
    this.branches = []
    this.lastPick = null

    this.doneBoards = []
    this.moreMoves = true
    this.visitedBoards = new Map()
    this.log = log    
  }

  advanceBoard() {
    this.makeMove()
    if (this.board.isDone()) {
      if (!this.doneBoards.find(board => this.board.equalState(board))) {
        this.doneBoards.push(this.board.clone())
      }
      this.log('Board is done (' + this.doneBoards.length + ' unique)')
    }
    return this.moreMoves
  }

  makeMove() {
    this.board.moves.validate()
    const res = this.placeObvious(this.board)

    if (res.placed && res.errors.length == 0) {
      return
    }

    if (res.errors.length == 0) {
      if (!this.visitedBoards.has(this.board.hash())) {
        this.visitedBoards.set(this.board.hash(), true)
        const branch = new Branch(this, this.board.moves)
        // A nex branch should never have exactly one move, that one should have been
        // placed in the obvious stage
        if (branch.hasMoves()) {
          this.branches.push(branch)
          const move = branch.pick()
          if (move) {
            const square = this.board.getSquareId(move.square)
            this.board.addPentomino(move.pentomino, square.x, square.y)
            this.log('Picked a ' + move.pentomino.letter, square)
            branch.printOptions(this.log)
            return
          }
        }
      }
    } else {
      for (let i = 0; i < res.errors.length; i++) {
        this.log('Could not place anything', res.errors[i])
      }
    }

    if (this.branches.length == 0) {
      this.log('No more moves available')
      this.moreMoves = false
      return
    }
    
    this.log('Backtracking to old branch')
    const oldBranch = this.branches.pop()
    const move = oldBranch.pick()

    if (oldBranch.hasMoves()) {
      this.branches.push(oldBranch)
    }
    if (move) {
      this.board = oldBranch.board.clone()
      const square = this.board.getSquareId(move.square)
      this.board.addPentomino(move.pentomino, square.x, square.y)
      this.log('Picked a ' + move.pentomino.letter, square)
    }
  }

  placeObvious (board) {
    let placed = false
    const errors = []
    for (let s of board.squares.values()) {
      const id = s.id
      if (s.coveredBy) {
          continue
      }
      const moves = board.moves.get(id)

      if (moves.length == 0) {
        errors.push(s)
        continue
      }

      if (moves.length == 1) {
        const move = moves[0]
        const place = move.pentomino
        const placeAt = board.getSquareId(move.square)
        if (board.addPentomino(place, placeAt.x, placeAt.y)) {
          this.log('Placed piece ' +place.letter, placeAt)
          placed = true
        }
      }
    }

    return { placed, errors }
  }
}

/*

const b = Board.createBoard(5, 5)
 b.squares.get(Square.getId(3,2)).letter = 'y'
 b.squares.get(Square.getId(0,3)).letter = 'l'
 b.squares.get(Square.getId(1,3)).letter = 'p'
// b.squares.get(Square.getId(0,0)).letter = 't'
 b.squares.get(Square.getId(4,0)).letter = 'w'

const state = new State(_pentos, b)
//const ok = state.validMoves(b)


try {
    while(!state.advanceBoard(b)) {
      b.toHtml()
    }

}catch (err) {
  console.log(err.message)
  console.log('Last position: ')
  b.toHtml()
}
  if (b.isDone() ) {
    console.log('woho')
  }

//b.addPentomino(pentos.i, 4, 2)
//b.addPentomino(pentos.p.rotate90(), 1, 4)


console.log(Object.keys(pentos))
*/

if (typeof module != 'undefined') {
  module.exports.Pentomino = Pentomino
  module.exports.Square = Square 
  module.exports.Region = Region 
  module.exports.Board = Board
  module.exports.State = State
}

function exportColormap() {
  const positive = p => {
    p.shape.push({x: 0, y: 0})
    for (let s of p.shape) {
      while (s.x < 0) {
        for (let s2 of p.shape) {
          s2.x ++
        }
      }
      while (s.y < 0) {
        for (let s2 of p.shape) {
          s2.y ++
        }
      }
    }
    return p.shape
  }

  const toString = s => {
    return s.map(c => '' + c.x + c.y).join('')
  }
  const compare = (a, b) => {
    if (a.x != b.x) return a.x -b.x
    return a.y - b.y
  }
  const sort = s => {
    return s.sort(compare)
  }
    const pentos = Pentomino.getAllTypes()
    const allPentos = {}
    let allPentosArray = []
    Object.keys(pentos).forEach(name => {
      allPentos[name] = pentos[name].getAllVariants()
      allPentosArray = allPentosArray.concat(allPentos[name])
    })

    const res = {examples: {}}


    allPentosArray.map(positive).map(sort).map(toString).forEach((p, i) => {
      res[p] = allPentosArray[i].color
      if (!res.examples[allPentosArray[i].letter]) {
        res.examples[allPentosArray[i].letter] = {
          shape: allPentosArray[i].shape,
          color: allPentosArray[i].color
        }
      }
    })
    return res
}

