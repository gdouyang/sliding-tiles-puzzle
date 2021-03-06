/*
   Developed by Arnaldo Perez Castano
   arnaldo.skywalker@gmail.com
*/

var emptytilePosRow = 1;
var emptytilePosCol = 2;
var cellDisplacement = '69px';

var moveTile = function (e) {
    // Gets the position of the current element
    var pos = $(this).attr('data-pos');
    var posRow = parseInt(pos.split(',')[0]);
    var posCol = parseInt(pos.split(',')[1]);

    // Move Up
    if (posRow + 1 == emptytilePosRow && posCol == emptytilePosCol) {
        $(this).animate({
            'top': "+=" + cellDisplacement //moves up
        }, "fast");

        $('#empty').animate({
            'top': "-=" + cellDisplacement //moves down
        }, "fast");

        emptytilePosRow -= 1;
        $(this).attr('data-pos', (posRow + 1) + "," + posCol);
    }

    // Move Down
    if (posRow - 1 == emptytilePosRow && posCol == emptytilePosCol) {
        $(this).animate({
            'top': "-=" + cellDisplacement //moves down
        }, "fast");

        $('#empty').animate({
            'top': "+=" + cellDisplacement //moves up
        }, "fast");

        emptytilePosRow += 1;
        $(this).attr('data-pos', (posRow - 1) + "," + posCol);
    }

    // Move Left
    if (posRow == emptytilePosRow && posCol + 1 == emptytilePosCol) {
        $(this).animate({
            'right': "-=" + cellDisplacement //moves right
        }, "fast");

        $('#empty').animate({
            'right': "+=" + cellDisplacement //moves left
        }, "fast");

        emptytilePosCol -= 1;
        $(this).attr('data-pos', posRow + "," + (posCol + 1));
    }

    // Move Right
    if (posRow == emptytilePosRow && posCol - 1 == emptytilePosCol) {
        $(this).animate({
            'right': "+=" + cellDisplacement //moves left
        }, "fast");

        $('#empty').animate({
            'right': "-=" + cellDisplacement //moves right
        }, "fast");

        emptytilePosCol += 1;
        $(this).attr('data-pos', posRow + "," + (posCol - 1));
    }

    // Update empty position
    $('#empty').attr('data-pos', emptytilePosRow + "," + emptytilePosCol);
};

function MyNode(value, state, emptyRow, emptyCol, depth) {
    this.value = value;
    this.state = state;
    this.emptyRow = emptyRow;
    this.emptyCol = emptyCol;
    this.depth = depth;
    this.strRepresentation = '';
    this.path = '';

    // String representation of the state in CSV format
    for (var i = 0; i < state.length; i++) {
        // We assume the state is a square
        if (state[i].length !== state.length) {
            alert('Number of rows differs from number of columns');
            return;
        }

        for (var j = 0; j < state[i].length; j++) {
            this.strRepresentation += state[i][j] + ',';
        }
    }
    this.size = this.state.length;
};

var AStar = function (initial, goal, empty) {
    this.initial = initial;
    this.goal = goal;
    this.empty = empty;
    this.queue = new PriorityQueue({
        comparator: function (a, b) {
            if (a.value > b.value) {
                return 1;
            }
            if (a.value < b.value) {
                return -1;
            }
            return 0;
        }
    });
    this.queue.queue(initial);
    this.visited = new HashSet();
};

AStar.prototype.execute = function () {
    // Add current state to visited list
    this.visited.add(this.initial.strRepresentation);

    while (this.queue.length > 0) {
        var current = this.queue.dequeue();

        if (current.strRepresentation === this.goal.strRepresentation) {
            return current;
        }

        this.expandNode(current);
    }
};

AStar.prototype.expandNode = function (node) {
    var temp = '';
    var newState = '';
    var col = node.emptyCol;
    var row = node.emptyRow;
    var newNode = '';

    // Up
    if (row > 0) {
        newState = node.state.clone();
        temp = newState[row - 1][col];
        newState[row - 1][col] = this.empty;
        newState[row][col] = temp;
        newNode = new MyNode(0, newState, row - 1, col, node.depth + 1);

        if (!this.visited.contains(newNode.strRepresentation)) {
            newNode.value = newNode.depth + this.heuristic(newNode);
            newNode.path = node.path + 'U';
            this.queue.queue(newNode);
            this.visited.add(newNode.strRepresentation);
        }
    }

    // Down
    if (row < node.size - 1) {
        newState = node.state.clone();
        temp = newState[row + 1][col];
        newState[row + 1][col] = this.empty;
        newState[row][col] = temp;
        newNode = new MyNode(0, newState, row + 1, col, node.depth + 1);

        if (!this.visited.contains(newNode.strRepresentation)) {
            newNode.value = newNode.depth + this.heuristic(newNode);
            newNode.path = node.path + 'D';
            this.queue.queue(newNode);
            this.visited.add(newNode.strRepresentation);
        }
    }

    // Left
    if (col > 0) {
        newState = node.state.clone();
        temp = newState[row][col - 1];
        newState[row][col - 1] = this.empty;
        newState[row][col] = temp;
        newNode = new MyNode(0, newState, row, col - 1, node.depth + 1);

        if (!this.visited.contains(newNode.strRepresentation)) {
            newNode.value = newNode.depth + this.heuristic(newNode);
            newNode.path = node.path + 'L';
            this.queue.queue(newNode);
            this.visited.add(newNode.strRepresentation);
        }
    }

    // Right
    if (col < node.size - 1) {
        newState = node.state.clone();
        temp = newState[row][col + 1];
        newState[row][col + 1] = this.empty;
        newState[row][col] = temp;
        newNode = new MyNode(0, newState, row, col + 1, node.depth + 1);

        if (!this.visited.contains(newNode.strRepresentation)) {
            newNode.value = newNode.depth + this.heuristic(newNode);
            newNode.path = node.path + 'R';
            this.queue.queue(newNode);
            this.visited.add(newNode.strRepresentation);
        }
    }
};

Array.prototype.clone = function () {
    return JSON.parse(JSON.stringify(this));
};

AStar.prototype.heuristic = function (node) {
    return this.manhattanDistance(node);
};

AStar.prototype.manhattanDistance = function (node) {
    var result = 0;

    for (var i = 0; i < node.state.length; i++) {
        for (var j = 0; j < node.state[i].length; j++) {
            var elem = node.state[i][j];
            var found = false;
            for (var h = 0; h < this.goal.state.length; h++) {
                for (var k = 0; k < this.goal.state[h].length; k++) {
                    if (this.goal.state[h][k] == elem) {
                        result += Math.abs(h - i) + Math.abs(j - k);
                        found = true;
                        break;
                    }
                }
                if (found) {
                    break;
                }
            }
        }
    }

    return result;
};


AStar.prototype.linearConflicts = function (node) {
    var result = 0;
    var state = node.state;

    // Row Conflicts
    for (var i = 0; i < state.length; i++) {
        result += this.findConflicts(state, i, 1)
    }

    // Column Conflicts
    for (var i = 0; i < state[0].length; i++) {
        result += this.findConflicts(state, i, 0)
    }

    return result;
};

AStar.prototype.findConflicts = function (state, i, dimension) {
    var result = 0;
    var tilesRelated = [];

    // Loop foreach pair of elements in the row/column
    for (var h = 0; h < state.length - 1 && tilesRelated.indexOf(h) === -1; h++) {
        for (var k = h + 1; k < state.length && tilesRelated.indexOf(h) === -1; k++) {
            var moves = dimension == 1
                ? this.inConflict(i, state[i][h], state[i][k], h, k, dimension)
                : this.inConflict(i, state[h][i], state[k][i], h, k, dimension);

            if (moves == 0) {
                continue;
            }
            result += 2;
            tilesRelated.push([h, k]);
            break;
        }
    }

    return result;
};

AStar.prototype.inConflict = function (index, a, b, indexA, indexB, dimension) {
    var indexGoalA = -1;
    var indexGoalB = -1;

    for (var c = 0; c < this.goal.state.length; c++) {
        if (dimension == 1 && this.goal.state[index][c] == a) {
            indexGoalA = c;
        } else if (dimension == 1 && this.goal.state[index][c] == b) {
            indexGoalB = c;
        } else if (dimension == 0 && this.goal.state[c][index] == a) {
            indexGoalA = c;
        } else if (dimension == 0 && this.goal.state[c][index] == b) {
            indexGoalB = c;
        }
    }

    return (indexGoalA >= 0 && indexGoalB >= 0) &&
    ((indexA < indexB && indexGoalA > indexGoalB) ||
    (indexA > indexB && indexGoalA < indexGoalB))
        ? 2
        : 0;
};

AStar.prototype.heuristic = function (node) {
    return this.manhattanDistance(node) + this.linearConflicts(node);
};

AStar.prototype.misplacedTiles = function (node) {
    var result = 0;

    for (var i = 0; i < node.state.length; i++) {
        for (var j = 0; j < node.state[i].length; j++) {
            if (node.state[i][j] != this.goal.state[i][j] && node.state[i][j] != this.empty) {
                result++;
            }
        }
    }

    return result;
};


var start = function () {
    var init = window.initNode; // new MyNode(0, [[6, 4, 7], [8, 5, 0], [3, 2, 1]], 1, 2, 0);
    var goal = window.goalNode; //new MyNode(0, [[1, 2, 3], [4, 5, 6], [7, 8, 0]], 2, 2, 0);

    var aStar = new AStar(init, goal, 0);
    // To measure time taken by the algorithm
    var startTime = new Date();
    // Execute AStar
    var result = aStar.execute();
    // To measure time taken by the algorithm
    var endTime = new Date();
    alert('Completed in: ' + (endTime - startTime) + ' milliseconds');
    aStar.visited.forEach((v, k) => {
        if (v == goal.strRepresentation) {
            console.log(v)
        }
    })
    console.log(aStar.visited)

    var panel = document.getElementById('panel');
    panel.innerHTML = 'Solution: ' + result.path + ' Total steps: ' + result.path.length + '';
    window.solution = result.path;
};

var showSolution = function() {
    if (!window.solution) {
        alert('click Solve first')
        return
    }
    var steps = window.solution.split('')
    var list = []
    var panel = document.getElementById('panel');
    var innerHTML = panel.innerHTML

    for (let index = 0; index < steps.length; index++) {
        const element = steps[index];
        list.push('Setp: ' + index + ' -> ' + element)
        var posRow = emptytilePosRow
        var posCol = emptytilePosCol
        if (element == 'D') {
            posRow = emptytilePosRow + 1
        } else if (element == 'U') {
            posRow = emptytilePosRow - 1
        } else if (element == 'L') {
            posCol = emptytilePosCol - 1
        } else if (element == 'R') {
            posCol = emptytilePosCol + 1
        }
        $('div[data-pos="'+ posRow + ',' + posCol +'"]').click()
        panel.innerHTML = innerHTML + '<br>' + list.join(', ');
    }
}

function init () {
    var initRows = []
    var goalRows = []
    
    var row = 3
    var col = 3

    var total = row * col
    var list = []
    var subList = []
    for (let index = 0; index < total; index++) {
        list.push(index);
        if (index != 0) {
            subList.push(index)
        }
        if (index == total -1) {
            subList.push(0)
        }
        if (subList.length == 3) {
            goalRows.push(subList)
            subList = []
        }
    }
    subList = []
    while(list.length > 0) {
        let index = Math.floor((Math.random() * list.length) + 1) - 1;
        const element = list[index];
        list.splice(index, 1)
        subList.push(element)
        if (element == 0) {
            emptytilePosRow = initRows.length
            emptytilePosCol = subList.length - 1
        }
        if (subList.length == 3) {
            initRows.push(subList)
            subList = []
        }
    }
    var html = []
    initRows.forEach((sub, row) => {
        html.push('<div class="row">')
        sub.forEach((s, col) => {
            if (s == 0) {
                html.push('<div class="cell" id="empty" data-pos="'+ row +',' + col +'"></div>')
            } else {
                html.push('<div class="cell" data-pos="'+ row +',' + col +'"><span>'+ s +'</span></div>')
            }
        })
        html.push('</div>')
    })
    $('#initConfig').html(html.join(''))
    var html = []
    goalRows.forEach((sub, row) => {
        html.push('<div class="row">')
        sub.forEach((s, col) => {
            if (s == 0) {
                html.push('<div class="cell"></div>')
            } else {
                html.push('<div class="cell"><span>'+ s +'</span></div>')
            }
        })
        html.push('</div>')
    })
    $('#goalConfig').html(html.join(''))
    window.initNode =  new MyNode(0, initRows, emptytilePosRow, emptytilePosCol, 0);
    window.goalNode = new MyNode(0, goalRows, row - 1, col - 1, 0);
}

$(document).ready(function() {
    init()
    $('div[data-pos]').click(function(e) {
        moveTile.call(this, e)
    })
})