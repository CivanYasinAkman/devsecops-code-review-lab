// ruleid: no-eval-usage
const result = eval(userInput)

// ruleid: no-eval-usage
const answer = eval(expression).toString()

// ok: no-eval-usage
const result = JSON.parse(userInput)

// ok: no-eval-usage
const sum = Number(a) + Number(b)