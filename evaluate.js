const {Board, State} = require('./pentomino')
const readline = require('readline')
const { performance } =require('perf_hooks')
const fs = require('fs')

if (process.argv.length != 3) {
  console.log('args: input')
  process.exit()
}

const input = process.argv[2] + '.json'
const output = process.argv[2]

const data = require(input)
const board = Board.fromJson(data)

if (!fs.existsSync(output)){
    fs.mkdirSync(output);
}

const start = performance.now()

const state = new State(board, (msg, s) => {
  readline.clearLine(process.stdout)
  readline.cursorTo(process.stdout, 0)
  for (let i = 0; i <= state.branches.length; i++) {
    process.stdout.write('█')
  }
})


let count = 0

while (state.moreMoves) {
  state.advanceBoard()
  
  if (state.doneBoards.length > count) {
    console.log('\n === Found a valid board ===')
    fs.writeFileSync(output + '/board' + count + '.json', JSON.stringify(state.doneBoards[count].toJson()))
    count++
    console.log('Total: ' + count)
  }
}
const stop = performance.now()
console.log('\n==== Done ====')
console.log('The run took ' + Math.round((stop - start) / 1000 / 60) + ' minutes.')

state.doneBoards.forEach(b => {
  console.log('Board: ' + b.getStats())
})


