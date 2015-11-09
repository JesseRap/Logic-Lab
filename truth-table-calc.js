var tableList = [];
var tableSet = new Object;
var lang = 'polish';



function submitPropFunction(inputKey) {
    // Adds the proposition on "Enter"
    if(inputKey == '13'){
        submitProp();
    };
};

function checkValid() {
    // Check if the entered statement is valid
    // Get the last row of the truth table
    var lastRow = document.getElementById("truthTable").firstChild.lastElementChild;
    // If any of the cells contain 'F', return false; else, return true
    for (var x=1;x<lastRow.children.length;x++) {
        if (lastRow.children[x].innerHTML === 'F') {
            return false;
        };
    };
    return true;
};

function announceValid() {
    // Announce whether the proposition is valid
    
    if (checkValid()) {
        document.getElementById("resultLine").innerHTML += 
            "<b>VALID!</b>";
    } else {
        document.getElementById("resultLine").innerHTML += 
            "<b>INVALID</b>";
    };
};

function submitProp() {
    // Submit the entered statement and generate the truth table

    var statement = 
        document.getElementById("inputProp").value;
    resetTable();
    document.getElementById("truthTable").style.visibility = "visible";
    // Try to validate the statement in Polish notation
    if (!validateInput(statement)) {
        // Otherwise, try translating to Polish and then validating
        var newPremise = translate(statement);
        if (/undefined/.test(newPremise)) {
            alert("Invalid input");
            resetTable();
            return;
        } else if (!validateInput(newPremise)) {
            alert("Invalid input");
            resetTable();
            return;
        } else {
            convert(statement);
            lang = 'standard';
        };
    } else {
        convertPol(statement);
        lang = 'polish';
    };
    document.getElementById("inputProp").value='';
    // Sort table by length and alphabetic order
    tableList.sort(function(a,b) {
        if (a.length === b.length && b.length === 1) {
            return a < b? -1: a > b? 1: 0;
        } else {
            return a.length - b.length;
        };
    });
    //  Remove duplicates from table
    tableList = tableList.filter(function(item, pos, self) {
        return self.indexOf(item) == pos;
    });
    buildTable();
    fillTable();
    announceValid();
};

function convert(inputString) {
    // Convert the input statement into cells of the truth table
    
    // If the string is an atomic proposition, return the string
    var count = 0;
    if (inputString.length === 1) {
        if (/[a-z]/.test(inputString)) {
            tableList.unshift(inputString);
            return inputString;
        } else {return false;}
    };
    // Trim leading whitespace
    if (/^\s/.test(inputString)) {
        convert(inputString.slice(1));
        return;
    };
    // Trim trailing whitespace
    if (/\s$/.test(inputString)) {
        convert(inputString.slice(0,-1));
        return;
    };
    
    // Trim extra leading or trailing paren
    if (inputString[0] === '(') {
        if (inputString.match(/\)/g) === null) {
            convert(inputString.slice(1));
            return;
        } else if (inputString.match(/\(/g).length === 
                   inputString.match(/\)/g).length+1) {
            convert(inputString.slice(1));
            return;
        };
    };
    if (inputString[-1] === ')') {
        if (inputString.match(/\(/g) === null) {
            convert(inputString.slice(1));
            return;
        } else if (inputString.match(/\)/g).length === 
                   inputString.match(/\(/g).length+1) {
            convert(inputString.slice(0,-1));
            return;
        };
    };
    // Trim unnecessary parens
    if (inputString[0] === '(') {
        var count = 0
        loop1:
            for (var l=0;l<inputString.length;l++) {
                var letter = inputString[l];
                if (letter === '(') {
                    count++;
                } else if (letter === ')') {
                    count--;
                };
                // Check if the opening parantheses close at the end of the statement
                if (count === 0) {
                    if (l === inputString.length-1) {
                        convert(inputString.slice(1,-1));
                        return;
                    };
                    break loop1;
                };
            };
    };
    
	// Convert 'not'
    if (/not/i.test(inputString.slice(0,3))) {
        tableList.unshift(inputString);
        convert(inputString.slice(4));
        return;
    };
    
    // Convert 'if...then'
    if (/if/i.test(inputString.slice(0,2))) {
        var count = 0;
        // Find the operands by checking the parantheses
        for (var l=0;l<inputString.length;l++) {
            var letter = inputString[l];
            if (letter === '(') {
                count++;
            } else if (letter === ')') {
                count--;
            };
            if (count === 0 && inputString.slice(l,l+4) === 'then') {
                tableList.unshift(inputString);
                convert(inputString.slice(3,l-1));
                convert(inputString.slice(l+5));
                return;
            };
        };
    };
    // Convert connectives
    var count = 0;
    for (var l=0;l<inputString.length;l++) {
        var letter = inputString[l];
        if (letter === '(') {
            count++;
        } else if (letter === ')') {
            count--;
        };
        if (count === 0) {
            if (/and/i.test(inputString.slice(l,l+3))) {
                tableList.unshift(inputString);
                convert(inputString.slice(0,l-1));
                convert(inputString.slice(l+4));
                return;
            };
            if (/or/i.test(inputString.slice(l,l+2))) {
                tableList.unshift(inputString);
                convert(inputString.slice(0,l-1));
                convert(inputString.slice(l+3));
                return;
            };
            if (/implies/i.test(inputString.slice(l,l+7))) {
                tableList.unshift(inputString);
                convert(inputString.slice(0,l-1));
                convert(inputString.slice(l+8));
                return;
            };
            if (/only\sif/i.test(inputString.slice(l,l+7))) {
                tableList.unshift(inputString);
                convert(inputString.slice(0,l-1));
                convert(inputString.slice(l+8));
                return;
            };
            if (/iff/i.test(inputString.slice(l,l+3))) {
                tableList.unshift(inputString);
                convert(inputString.slice(0,l-1));
                convert(inputString.slice(l+4));
                return;
            };
            if (/if\sand\sonly\sif/i.test(inputString.slice(l,l+14))) {
                tableList.unshift(inputString);
                convert(inputString.slice(0,l-1));
                convert(inputString.slice(l+15));
                return;
            } else if (/if\s/i.test(inputString.slice(0,l+3))) {
                tableList.unshift(inputString);
                convert(inputString.slice(0,l-1));
                convert(inputString.slice(l+3));
                return;
            };
        };
    };
};

function buildTable() {
    // Create the truth table with one row for each element of the tableList
    tableList.forEach(function(element, index, array) {
        var theTable = document.getElementById("truthTable");
        var newRow = theTable.insertRow(-1);
        var newTD = newRow.insertCell(0);
        newTD.innerHTML = element;
        //newTD.className = 'rowStyle';
        newTD.style.borderBottomWidth = 'medium';
        newTD.style.backgroundColor = 'lightgray';
    });
};



function compute(inputString, state) {
    // Compute the truth values for the non-atomic cells
    
    // If the string is an atomic proposition, return the assigned value
    var count = 0;
    // If the string is atomic, return the value 
    // assigned by the atomic rows in the table
    if (inputString.length === 1) {
        if (/[a-z]/.test(inputString)) {
            var currentVal = tableSet[inputString];
            return tableSet[inputString][state]==='T'?true:false;
        } else {return false;}
    };
    // Trim leading whitespace
    if (/^\s/.test(inputString)) {
        return compute(inputString.slice(1), state);
    };
    // Trim trailing whitespace
    if (/\s$/.test(inputString)) {
        return compute(inputString.slice(0,-1), state);
    };
    // Trim extra leading or trailing paren
    if (inputString[0] === '(') {
        if (inputString.match(/\)/g) === null) {
            return compute(inputString.slice(1),state);
        } else if (inputString.match(/\(/g).length === inputString.match(/\)/g).length+1) {
            return compute(inputString.slice(1),state);
        };
    };
    if (inputString[-1] === ')') {
        if (inputString.match(/\(/g) === null) {
            return compute(inputString.slice(0,-1),state);
        } else if (inputString.match(/\)/g).length === inputString.match(/\(/g).length+1) {
            return compute(inputString.slice(0,-1), state);
        };
    };
    // Trim unnecessary parens
    if (inputString[0] === '(') {
        var count = 0
        loop1:
            for (var l=0;l<inputString.length;l++) {
                var letter = inputString[l];
                if (letter === '(') {
                    count++;
                } else if (letter === ')') {
                    count--;
                };
                if (count === 0) {
                    if (l === inputString.length-1) {
                        return compute(inputString.slice(1,-1),state);
                    };
                    break loop1;
                };
            };
    };
    
    // Compute connectives by recursively calling compute() on the parts
    if (/not/i.test(inputString.slice(0,3))) {
        return !compute(inputString.slice(4),state);
    };
    // Compute 'if...then'
    if (/if/i.test(inputString.slice(0,2))) {
        var count = 0;
        for (var l=0;l<inputString.length;l++) {
            var letter = inputString[l];
            if (letter === '(') {
                count++;
            } else if (letter === ')') {
                count--;
            };
            if (count === 0 && inputString.slice(l,l+4) === 'then') {
                return !compute(inputString.slice(3,l),state) || 
                    compute(inputString.slice(l+5),state);
            };
        };
    };
    // Compute connectives
    var count = 0;
    for (var l=0;l<inputString.length;l++) {
        var letter = inputString[l];
        if (letter === '(') {
            count++;
        } else if (letter === ')') {
            count--;
        };
        if (count === 0) {
            if (/and/i.test(inputString.slice(l,l+3))) {
                return compute(inputString.slice(0,l),state) && 
                    compute(inputString.slice(l+4),state);
            } else if (/or/i.test(inputString.slice(l,l+2))) {
                return compute(inputString.slice(0,l-1),state) || 
                    compute(inputString.slice(l+3),state);
            } else if (/implies/i.test(inputString.slice(l,l+7))) {
                return !compute(inputString.slice(0,l-1),state) || 
                    compute(inputString.slice(l+8),state);
            } else if (/only\sif/i.test(inputString.slice(l,l+7))) {
                return !compute(inputString.slice(0,l-1),state) || 
                    compute(inputString.slice(l+8),state);
            } else if (/iff/i.test(inputString.slice(l,l+3))) {
                return compute(inputString.slice(0,l-1),state) === 
                    compute(inputString.slice(l+4),state);
            } else if (/if\sand\sonly\sif/i.test(inputString.slice(l,l+14))) {
                return compute(inputString.slice(0,l-1),state) === 
                    compute(inputString.slice(l+15),state);
            } else if (/if\s/i.test(inputString.slice(0,l+3))) {
                return !compute(inputString.slice(0,l-1),state) || 
                    compute(inputString.slice(l+3),state);
            };
        };
    };
};

function convertPol(inputString) {
    // If the string is an atomic proposition, return the string
    var count = 0;
    if (inputString.length === 1) {
        if (/[a-z]/.test(inputString)) {
            tableList.unshift(inputString);
            return inputString;
        } else {return false;}
    };
    if (inputString[0] === 'K' || inputString[0] === 'A' ||
       inputString[0] === 'B' || inputString[0] === 'C') {
        tableList.unshift(inputString);
        var ops = getOperands(inputString);
        convertPol(ops[0]);
        convertPol(ops[1]);
        return;
    };
    if (inputString[0] === 'N') {
        tableList.unshift(inputString);
        convertPol(inputString.slice(1));
        return;
    };
};

function computePol(inputString, state) {
    // Compute the values for non-atomic cells in Polish notation
    var count = 0;
    // If the string is atomic, return the value 
    // assigned by the atomic rows in the table
    if (inputString.length === 1) {
        if (/[a-z]/.test(inputString)) {
            var currentVal = tableSet[inputString];
            return tableSet[inputString][state]==='T'?true:false;
        } else {return false;}
    };
    if (inputString[0] === 'K') {
        var ops = getOperands(inputString);
        return computePol(ops[0], state) && computePol(ops[1], state);
    } else if (inputString[0] === 'A') {
        var ops = getOperands(inputString);
        return computePol(ops[0], state) || computePol(ops[1], state);
    } else if (inputString[0] === 'C') {
        var ops = getOperands(inputString);
        return !computePol(ops[0], state) || computePol(ops[1], state);
    } else if (inputString[0] === 'B') {
        var ops = getOperands(inputString);
        return computePol(ops[0], state) === computePol(ops[1], state);
    } else if (inputString[0] === 'N') {
        return !computePol(inputString.slice(1), state);
    };
};
    

function fillTable() {
    // Fill the atomic rows with truth values
    var theTable = document.getElementById('truthTable');
    // Get an array of just the atomic propositions
    var atomicTable = tableList.filter(function(element) {
        return element.length === 1;
    });
    // The number of cells is equal to 2**(# of propositions)
    var n = atomicTable.length;
    var tdSet1 = theTable.getElementsByTagName('td');
    var tdSet = [];
    var nLength = Math.pow(2, n);
    for (var i=0;i<tdSet1.length;i++) {tdSet.push(tdSet1[i])};
    tdSet.forEach(function(el, idx, array) {
        // Fill the atomic cells with 'T'/'F'
        // Start alternating 'T'/'F', then aleternate half as frequently each row
        if (el.innerHTML.length === 1) {
            var result = []
            var m = Math.pow(2,idx);
            for (var x=0;x<nLength;x++) {
                if (x%(2*m)<m) {
                    result.push('T');
                    var newCell = document.createElement("TD");
                    newCell.innerHTML = 'T';
                    el.parentNode.appendChild(newCell);
                } else {
                    result.push('F');
                    var newCell = document.createElement("TD");
                    newCell.innerHTML = 'F';
                    el.parentNode.appendChild(newCell);
                };
            };
            tableSet[el.innerHTML] = result;
            
        } else {
            // Fill the other cells by calling compute() with the current state index
            var result = [];
            for (var x=0;x<nLength;x++) {
                var newCell = document.createElement("TD");
                if (lang === 'polish') {
                    newCell.innerHTML = computePol(el.innerHTML,x)?'T':'F';
                } else {
                    newCell.innerHTML = compute(el.innerHTML,x)?'T':'F';
                };
                el.parentElement.appendChild(newCell);
            };
        };
    });
};



function resetTable() {
    // Resets the elements to initial state

    document.getElementById("truthTable").innerHTML = "";
    document.getElementById("tableDiv").style.width = '100%';
    document.getElementById("truthTable").style.visibility = "hidden";

    tableList = [];
    tableSet = new Object;
    lang = 'polish';
    
    document.getElementById("inputProp").value = '';

    document.getElementById("resultLine").innerHTML = "<b>The proposition is: </b>";

};


$(function() {
    $("#inputProp").on('keydown', function(event) {
        var inputKey = 'which' in event? event.which : event.keyCode;
        submitPropFunction(inputKey);
    })
});

