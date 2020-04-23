var term = new TerminalGrid("terminal", {x: 160, y:90, height: "100vh"})

function sign(n){
    return n?   n < 0 ? -1 : 1   :0
}

const levels = [
    "50,30;80,70;70,10;3,2;0,1;0,0;"
    +"60,60;61,61;61,62;60,62;59,62;50,50;51,51;51,52;50,52;49,52",

    "27,5;110,70;50,2;4,3;0,0;0,0;" +
    "26,12;26,13;27,12;27,13;33,12;33,13;34,12;34,13;30,15;31,15;30,16;31,16;" +//Glider Gun
    "48,21;49,21;51,21;52,21;47,22;47,23;47,24;48,24;49,24;53,22;54,23;53,24;" +
    "52,25;57,23;58,23;57,24;58,24;46,29;47,29;" +
    "100,87;101,87;100,88;101,88"                                               //Bottom Square
]

var keysPressed = []

document.addEventListener("keydown", (e)=>{
    if(e.key == "ArrowLeft"){
        if(!keysPressed.includes("left")) keysPressed.push("left")
        e.preventDefault()
    }
    else if(e.key == "ArrowRight"){
        if(!keysPressed.includes("right")) keysPressed.push("right")
        e.preventDefault()
    } 
    else if(e.key == "ArrowUp"){
        if(!keysPressed.includes("up")) keysPressed.push("up")
        e.preventDefault()
    }
    else if(e.key == "ArrowDown") e.preventDefault()
})

document.addEventListener("keyup", (e)=>{
    if(e.key == "ArrowLeft") 
        keysPressed.splice(keysPressed.indexOf("left"), 1)
    else if(e.key == "ArrowRight") 
        keysPressed.splice(keysPressed.indexOf("right"), 1)
    else if(e.key == "ArrowUp")
        keysPressed.splice(keysPressed.indexOf("up"), 1)
})

function render(grid, player = [0,0], goal = []){
    term.setValue(grid, e=>e?"█":" ")
    term.setCharacter(player[0], player[1], "@")
    term.setCharacter(goal[0], goal[1], "#")
}

function gameOfLifeStep(grid, width, height){
    var futureGrid = []
    for(var i = 0; i < height; i++){
        if(i == 0 || i == height - 1){
            futureGrid.push(Array(width).fill(0))
            continue
        }
        var rowGrid = []
        for(var j = 0; j < width; j++){
            if(j == 0 || j == width - 1){
                rowGrid.push(0)
                continue
            }
            var neighbours = 0
            if(grid[i-1][j-1]) neighbours++
            if(grid[i-1][j]) neighbours++
            if(grid[i-1][j+1]) neighbours++
            if(grid[i][j-1]) neighbours++
            if(grid[i][j+1]) neighbours++
            if(grid[i+1][j-1]) neighbours++
            if(grid[i+1][j]) neighbours++
            if(grid[i+1][j+1]) neighbours++

            if(neighbours == 3) rowGrid.push(1)
            else if(neighbours == 2 && grid[i][j]) rowGrid.push(1)
            else rowGrid.push(0)
        }
        futureGrid.push(rowGrid)
    }
    return futureGrid
}

function loadGrid(str){
    if(!isNaN(Number(str))) str = levels[Number(str)]
    var grid = []
    for(var i = 0; i < 90; i++) grid.push(Array(160).fill(0))
    var coordenates = str.split(";")
        .map(e => [Number(e.split(",")[0]), Number(e.split(",")[1])])
    var player = coordenates[0]
    var goal = coordenates[1]
    var speed = coordenates[2]
    var jumpAndGravity = coordenates[3]
    var solidBlockAndInteract = coordenates[4]
    for(var [x, y] of coordenates.slice(6)) grid[y][x] = 1
    return [grid, player, goal, speed, jumpAndGravity[0], jumpAndGravity[1],
            solidBlockAndInteract[0], solidBlockAndInteract[1]]
}

var interval

function win(){
    clearInterval(interval)
    term.setValue(winScreen, e=>e?"█":" ")
    var levelElement = document.getElementById("level")
    if(!isNaN(Number(levelElement.value))){
        levelElement.value = String(Number(levelElement.value + 1))
        setTimeout(die, 1000)
    }
}

function die(){
    document.getElementById("load").click()
}


document.getElementById("load").addEventListener("click", (e)=>{
    clearInterval(interval)
    var steps = 0
    var [grid, player, goal, speed, jump, gravity, solidBlock, interact] = 
        loadGrid(document.getElementById("level").value)
    var blockIn = [player[0], player[1] + 1]
    var speedY = 0
    var speedX = 0

    interval = setInterval(()=>{
        if(steps % speed[1] == 0){
            if(interact) grid[player[1]][player[0]] = 1
            grid = gameOfLifeStep(grid, 160, 90)
            if(solidBlock) grid[blockIn[1]][blockIn[0]] = 1
            while(grid[player[1]][player[0]]) player[1]--
        }

        if(keysPressed.includes("left") && keysPressed.includes("right")){
            speedX = 0
        }else if(keysPressed.includes("left")) speedX = -1
        else if(keysPressed.includes("right")) speedX = 1
        else speedX = 0

        if(grid[player[1] + 1][player[0]]){                                     // Floor below
            if(keysPressed.includes("up")) speedY = -jump
            else speedY = 0
        }else{                                                                  // In the air
            if(speedY < gravity) speedY++
        }
  
        var yDir = sign(speedY)
        if(yDir){
            for(var i = 0; i < Math.abs(speedY); i++){
                if(player[1] + yDir == 0 || player[1] + yDir == 89) die()
                if(!grid[player[1] + yDir][player[0]]) player[1] += yDir
                if(player[0] == goal[0] && player[1] == goal[1]){
                    win()
                    return
                }
            }
        }

        var xDir = sign(speedX)
        if(xDir){
            for(var i = 0; i < Math.abs(speedX); i++){
                if(player[0] + xDir == 0 || player[0] + xDir == 159) die()
                if(!grid[player[1]][player[0] + xDir]) player[0] += xDir
                if(player[0] == goal[0] && player[1] == goal[1]){
                    win()
                    return
                }
            }
        }

        render(grid, player, goal)
        steps ++
    }, speed[0])
})

document.getElementById("load").click()