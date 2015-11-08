var premises = [],
    conclusion,
    operators = 'NKCAB',
    unaryOperators = 'N',
    binaryOperators = 'KCAB',
    unaryOperatorsLong = ['not'],
    binaryOperatorsLong = ['and','or','implies','if', 'only if']
    tableWidth = 100,
    showList = [],
    lightList = [],
    lineList = [],
    currentLogic ='NM';


function translate(inputString) {
    // Translate standard logic notation into Polish notation
    
    // If the string is an atomic proposition, return the string
    var count = 0;
    if (inputString.length === 1) {
        if (/[a-z]/.test(inputString)) {
            return inputString;
        } else {return false;}
    };
    // Trim leading whitespace
    if (/^\s/.test(inputString)) {
        return translate(inputString.slice(1));
    };
    // Trim trailing whitespace
    if (/\s$/.test(inputString)) {
        return translate(inputString.slice(0,-1));
    };
    // Trim extra leading or trailing paren
    if (inputString[0] === '(') {
        if (inputString.match(/\)/g) === null) {
            return translate(inputString.slice(1));
        } else if (inputString.match(/\(/g).length === 
                   inputString.match(/\)/g).length+1) {
            return translate(inputString.slice(1));
        };
    };
    if (inputString[-1] === ')') {
        if (inputString.match(/\(/g) === null) {
            return translate(inputString.slice(1));
        } else if (inputString.match(/\)/g).length === 
                   inputString.match(/\(/g).length+1) {
            return inputString.slice(0,-1);
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
                        return translate(inputString.slice(1,-1));
                    };
                    break loop1;
                };
            };
    };
    
	// Translate 'not...' to 'N...'
    if (/not/i.test(inputString.slice(0,3))) {
        return 'N'+translate(inputString.slice(4));
    };
    // Translate 'Nec'
    if (/nec/i.test(inputString.slice(0,3))) {
        return 'M'+translate(inputString.slice(4));
    };
    // Translate 'Poss'
    if (/poss/i.test(inputString.slice(0,4))) {
        return 'L'+translate(inputString.slice(5));
    };
    // Translate 'if..then...' to 'C...'
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
                return 'C' + translate(inputString.slice(3,l-1)) + translate(inputString.slice(l+5));
            };
        };
    };
    // Translate other connectives
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
                return 'K' + translate(inputString.slice(0,l-1)) + 
                    translate(inputString.slice(l+4));
            };
            if (/or/i.test(inputString.slice(l,l+2))) {
                return 'A' + translate(inputString.slice(0,l-1)) + 
                    translate(inputString.slice(l+3));
            };
            if (/implies/i.test(inputString.slice(l,l+7))) {
                return 'C' + translate(inputString.slice(0,l-1)) +
                    translate(inputString.slice(l+8));
            };
            if (/only\sif/i.test(inputString.slice(l,l+7))) {
                return 'C' + translate(inputString.slice(0,l-1)) +
                    translate(inputString.slice(l+8));
            };
            if (/iff/i.test(inputString.slice(l,l+3))) {
                return 'B' + translate(inputString.slice(0,l-1)) +
                    translate(inputString.slice(l+4));
            };
            if (/if\sand\sonly\sif/i.test(inputString.slice(l,l+14))) {
                return 'B' + translate(inputString.slice(0,l-1)) +
                    translate(inputString.slice(l+15));
            };
            if (/if\s/i.test(inputString.slice(0,l+3))) {
                return 'C' + translate(inputString.slice(0,l-1)) +
                    translate(inputString.slice(l+3));
            };
        };
    };
};


function tableauObj(parentdiv1) {
    // Creates the main tableau object
    // Pass parentdiv, or set to tableauDiv by default
    this.parentdiv = parentdiv1 || 
        document.getElementById('tableauDiv');
    // The toDoArray keeps track of computations remaining to be done
    this.toDoArray = [];
    // The memoryBank keeps track of previously added propositions
    // for the purpose of checking branch closure
    this.memoryBank = [];
    
    this.checkClosed = function() {
        // Checks whether the table is closed
        // Search through the toDoArray and see if there is a pair of a
        // proposition and its negation.
        for (var f=0;f<this.memoryBank.length;f++) {
            var idx5 = this.memoryBank[f][0];
            var prop5 = this.memoryBank[f][1];
            if ((prop5.length===1) && 
                tableHasProp(this.memoryBank,[idx5,'N'+prop5])) {
                lightList.push([idx5,prop5]);
                lightList.push([idx5,'N'+prop5]);
                return true;
            };
        };
        return false;
    };
    
    this.nonSplittingRulesApply = function(toDoArray5) {
        // Checks to see if non-branching rules apply to the array
        
        for (var u=0;u<toDoArray5.length;u++) {
            var propN = toDoArray5[u][1];
            if (propN[0]==='K' || propN.slice(0,2)==='NC' ||
                propN.slice(0,2)==='NA' || propN.slice(0,2)==='NN' ||
                (propN[0]==='C' && propN[1].match(/[a-z]/)!==null && tableHasProp(toDoArray5,[toDoArray5[u][0], propN.slice(1,2)]) ) ) {
                return true;
            };
        };
        return false;
    };
    
    this.modalRulesApply = function(toDoArray3) {
        // Checks to see if modal rules apply to the tableau
        
        for (var e=0;e<toDoArray3.length;e++) {
            var propE = toDoArray3[e][1];
            if (propE[0] === 'L' ||
               propE.slice(0,2) === 'NM' || propE.slice(0,2) === "NL") {
                return true;
            };
        };
        return false;
    };
    
    this.addArrow = function() {
        // Adds down arrow to the table
        var arrowTD = document.createElement("TD");
        arrowTD.style.opacity = '0';
        arrowTD.style = 'height:30px'
        arrowTD.innerHTML += '&#8595;';
        this.table.firstChild.appendChild(arrowTD);
    };
    
    this.addBiArrow = function() {
        // Adds branching arrow to the table
        var arrowTD = document.createElement("TD");
        arrowTD.style.opacity = '0';
        arrowTD.style = 'height:30px'
        arrowTD.innerHTML += '&#8601;'+''+'&#8600;';
        this.table.firstChild.appendChild(arrowTD);
    };


    this.applyNonSplittingRules = function() {
        // Apply non-branching tableau rules
        for (r=0;r<this.toDoArray.length;r++) {
            var propR = this.toDoArray[r][1];
            var idx = this.toDoArray[r][0]
            if (propR[0] == 'K') {
                var ops3 = getOperands(propR);
                var opL = ops3[0];
                var opR = ops3[1];
                this.toDoArray = 
                    this.toDoArray.concat([[idx,opL],[idx,opR]]);
                this.toDoArray.splice(r,1);
                showList.push([idx,propR]);
                this.addArrow()
                this.addToTable([idx, opL]);
                this.addToTable([idx, opR]);
            } else if (propR.slice(0,2) === 'NC') {
                var ops1 = getOperands(propR.slice(1));
                var ant = ops1[0];
                var cons = 'N'+ops1[1];
                this.toDoArray = 
                    this.toDoArray.concat([[idx,ant],[idx,cons]]);
                this.toDoArray.splice(r,1);
                this.addArrow();
                showList.push([idx,propR]);
                this.addToTable([idx,ant]);
                this.addToTable([idx,cons]);
            } else if (propR.slice(0,2) === 'NA') {
                var ops2 = getOperands(propR.slice(1));
                var l1 = 'N'+ops2[0];
                var r1 = 'N'+ops2[1];
                this.toDoArray =
                    this.toDoArray.concat([[idx,l1],[idx,r1]]);
                this.toDoArray.splice(r,1);
                this.addArrow();
                showList.push([idx,propR]);
                this.addToTable([idx,l1]);
                this.addToTable([idx,r1]);
            } else if (propR[0]==='C' && 
                       propR[1].match(/[a-z]/)!==null) {
                if (tableHasProp(this.toDoArray,[idx, propR.slice(1,2)])) {
                    this.toDoArray.push([idx,propR.slice(2)]);

                    this.toDoArray.splice(r,1);
                    this.addArrow();
                    showList.push([idx,propR]);
                    this.addToTable([idx,propR.slice(2)]);
                };
            } else if (propR.slice(0,2) == 'NN') {
                this.toDoArray.push([idx,propR.slice(2)]);
                this.toDoArray.splice(r,1);
                this.addArrow();
                showList.push([idx,propR]);
                this.addToTable([idx,propR.slice(2)]);
            };
        };
    };

    this.addToTable = function(proposition) {
        // Adds proposition to the table
        var newTD = document.createElement("TD");
        newTD.style.opacity = '0';
        newTD.innerHTML += proposition.toString();
        this.memoryBank.push(proposition);
        this.table.firstChild.appendChild(newTD);
        if ( (proposition[1][0] == 'K') || 
            (proposition[1][0]==='C' && proposition[1][1].match(/[a-z]/)!==null) ||
            (proposition[1].slice(0,2) == 'NN') ||
            (proposition[1].slice(0,2) === 'NA') ||
            (proposition[1][0] === 'C' && !tableHasProp(this.memoryBank,[proposition[0],proposition[1].slice(1,2)])) ||
            (proposition[1][0] === 'A') ||
            (proposition[1].slice(0,2) === 'NK') ) {
            lineList.push(newTD);
        };
            
    };   
    


    this.callBeth = function(table1) {
        // Performs the deduction rules on the tableau.
        var table2 = table1;
        // If no table is passed, create initial table
        if (table2 === undefined) {
            this.table = document.createElement("TABLE");
            this.table.id = 'firstTable';
            this.table.insertRow();
            this.table.firstChild.style.width = '100%';
            this.table.firstChild.style.margin = 'auto';
            this.table.style.width = '100%';
            this.table.style.margin = 'auto';
            this.parentdiv.appendChild(this.table);
            for (var i=0;i<this.toDoArray.length;i++) {
                this.addToTable(this.toDoArray[i]);
            };
        };        

        // Apply the rules for as long as they apply
        while (this.rulesApply() || this.mOperatorApplies()) {
            if (this.checkDuplicate()) {
                // If the tableau begins to repeat itself, stop computing
                break;
            };
            // Apply non-branching rules while they apply
            do {
                this.applyNonSplittingRules();
            }
            while (this.nonSplittingRulesApply(this.toDoArray));
            
            // Apply branching rules while they apply
            while (this.splittingRulesApply(this.toDoArray)) {
                for (var b=0;b<this.toDoArray.length;b++) {
                    var propX = this.toDoArray[b][1];
                    var idx = this.toDoArray[b][0];
                    if (propX[0] === 'A' || propX[0] === 'C' || propX.slice(0,2) === 'NB' ||
                        propX[0] === 'B' || propX.slice(0,2) === 'NK') {
                        this.addBiArrow();
                        showList.push([idx,propX]);
                        if (propX[0] === 'C') {
                            var ops = getOperands(propX);
                            var op1 = 'N'+ops[0];
                            var op2 = ops[1];
                        } else if (propX[0] === 'A') {
                            var ops = getOperands(propX);
                            var op1 = ops[0];
                            var op2 = ops[1];
                        } else if (propX.slice(0,2) === 'NK') {
                            var ops = getOperands(propX.slice(1));
                            var op1 = 'N'+ops[0];
                            var op2 = 'N'+ops[1];
                        } else if (propX.slice(0,2) === 'NB') {
                            var ops = getOperands(propX.slice(1));
                            var op1 = 'K'+ops[0]+'N'+ops[1];
                            var op2 = 'K'+ops[1]+'N'+ops[0];
                        } else if (propX[0] === 'B') {
                            var ops = getOperands(propX);
                            var op1 = 'K'+ops[0]+ops[1];
                            var op2 = 'KN'+ops[0]+'N'+ops[1];
                        };
                        // Add a new table in the current row
                        // Create two new rows in the new table, and add a new table to each
                        var newTable1 = document.createElement("TABLE");
                        var newTable2 = document.createElement("TABLE");
                        var newTable3 = document.createElement("TABLE");
                        
                        newTable1.style.width = '100%';
                        newTable1.style.margin = 'auto';
                        newTable2.style.width = '100%';
                        newTable2.style.margin = 'auto';
                        newTable3.style.width = '100%';
                        newTable3.style.margin = 'auto';

                        var newRow1 = document.createElement("TR");
                        var newRow2 = document.createElement("TR");
                        var newRow3 = document.createElement("TR");
                        var newRow4 = document.createElement("TR");
                        
                        newRow1.style.width = '50%';
                        newRow2.style.width = '50%';
                        newRow3.style.width = '100%';
                        newRow4.style.width = '100%';
                        // Increase the width of the table to accommodate branching
                        tableWidth = tableWidth*1.8;
                        var newWidth = tableWidth.toString()+'px';
                        document.getElementById("tableauDiv").style.width = newWidth;

                        newTable1.appendChild(newRow1);
                        newTable1.appendChild(newRow2);
                        newRow1.appendChild(newTable2);
                        newRow2.appendChild(newTable3);

                        newTable2.appendChild(newRow3);
                        newTable3.appendChild(newRow4);
                        // Create two new tableaux for the new calculations
                        var newTableau1 = new tableauObj(newRow1);
                        var newTableau2 = new tableauObj(newRow2);
                        // Assign values to the new tableaux variables
                        // Allow the new tableaux to inherit the memoryBank
                        newTableau1.table = newTable2;
                        newTableau2.table = newTable3;
                        newTableau1.toDoArray = this.toDoArray.slice();
                        newTableau2.toDoArray = this.toDoArray.slice();
                        this.toDoArray.splice(b,1);
                        newTableau1.toDoArray.splice(b,1);
                        newTableau2.toDoArray.splice(b,1);
                        newTableau1.toDoArray.push([idx,op1]);
                        newTableau1.addToTable([idx,op1]);
                        newTableau2.toDoArray.push([idx,op2]);
                        newTableau2.addToTable([idx,op2]);
                        newTableau1.memoryBank = this.memoryBank.slice();
                        newTableau2.memoryBank = this.memoryBank.slice();
                        newTableau1.memoryBank.push([idx,op1]);
                        newTableau2.memoryBank.push([idx,op2]);
                        
                        this.table.firstChild.appendChild(newTable1);
                        
                        // Call Beth again on the newly created talbeaux
                        var result1 = newTableau1.callBeth(newTable2);
                        var result2 = newTableau2.callBeth(newTable3);
                        return result1 && result2;
                    };
                };
            };
            // Apply modal rules (except 'M')
            while (this.modalRulesApply(this.toDoArray)) {
                for (n=0;n<this.toDoArray.length;n++){
                    var propY = this.toDoArray[n][1];
                    var idx = this.toDoArray[n][0];
                    if (propY[0] === 'L') {
                        this.addArrow();
                        var idxNew = this.idxNext(idx);
                        this.toDoArray.push([idxNew,propY.slice(1)]);
                        this.toDoArray.splice(n,1);
                        this.addToTable([idxNew,propY.slice(1)]);
                        showList.push([idx,propY]);
                    } else if (propY.slice(0,2) === 'NM') {
                        this.addArrow();
                        this.toDoArray.push([idx,'LN'+propY.slice(2)]);
                        this.toDoArray.splice(n,1);
                        showList.push([idx,propY]);
                        this.addToTable([idx,'LN'+propY.slice(2)]);
                    } else if (propY.slice(0,2) === 'NL') {
                        this.addArrow();
                        this.toDoArray.push([idx,'MN'+propY.slice(2)]);
                        this.toDoArray.splice(n,1);
                        showList.push([idx,propY]);
                        this.addToTable([idx,'MN'+propY.slice(2)]);
                    };
                };
            };
            
            // Apply 'M' rules
            for (m=0;m<this.toDoArray.length;m++) {
                var propM = this.toDoArray[m][1];
                var idxM = this.toDoArray[m][0];
                if (propM[0] === 'M') {
                    // Apply special modal rules
                    if (currentLogic === 'T' || currentLogic === 'S4' || currentLogic === 'S5') {
                        if (!tableHasProp(this.memoryBank, [idxM, propM.slice(1)])) {
                            this.toDoArray.push([idxM, propM.slice(1)]);
                            this.addToTable([idxM, propM.slice(1)]);
                        };
                    } else if (currentLogic === 'D') {
                        if (!tableHasProp(this.memoryBank, [idxM, 'L'+propM.slice(1)])) {
                            this.toDoArray.push([idxM, 'L'+propM.slice(1)]);
                            this.addToTable([idxM, 'L'+propM.slice(1)]);
                        }
                    };
                    if (currentLogic === 'S5') {
                        if (idxM.length>1 && 
                            !tableHasProp(this.memoryBank,[idxM.slice(0,-2),propM])) {
                            this.toDoArray.push([idxM.slice(0,-2),propM]);
                            this.addToTable([idxM.slice(0,-2),propM]);
                        };
                    };
                    if (currentLogic === 'B') {
                        if (idxM.length>1 && 
                            !tableHasProp(this.memoryBank,[idxM.slice(0,-2),propM.slice(1)])) {
                            this.toDoArray.push([idxM.slice(0,-2),propM.slice(1)]);
                            this.addToTable([idxM.slice(0,-2),propM.slice(1)]);
                        };
                    };
                    
                    var aWorlds2 = this.accessibleWorlds(idxM);
                    for (a=0;a<aWorlds2.length;a++) {
                        if (currentLogic==='K4' || currentLogic==='S4' || currentLogic==='S5') {
                            if (!tableHasProp(this.memoryBank,[aWorlds2[a],propM])) {
                                this.toDoArray.push([aWorlds2[a],propM]);
                                this.addToTable([aWorlds2[a],propM]);
                            };
                        };
                        if (!tableHasProp(this.memoryBank,[aWorlds2[a],propM.slice(1)])) {
                            this.toDoArray.push([aWorlds2[a],propM.slice(1)]);
                            this.addToTable([aWorlds2[a],propM.slice(1)]);
                        };
                    };
                };
            };
            if (this.checkClosed()) {
                var newX = document.createElement("TD");
                newX.style.opacity = '0'
                this.table.firstChild.appendChild(newX);
                newX.innerHTML = '&#9587;';
                return true;
            };
            
        };
        // Check if the branch is closed
        var result7 = this.checkClosed();
        if (result7) {
            // Add an 'X' if closed
            var newX = document.createElement("TD");
            newX.style.opacity = '0'
            this.table.firstChild.appendChild(newX);
            newX.innerHTML = '&#9587;';
        };        
        return result7;
    };
    
    this.rulesApply = function() {
        // Check if any of the rules apply to the toDoArray
        return (this.nonSplittingRulesApply(this.toDoArray) || 
                this.splittingRulesApply(this.toDoArray) ||
                this.modalRulesApply(this.toDoArray))
    };
    
    this.checkDuplicate = function() {
        // Check to see if the tableaux contains worlds with identical "information"
        // Create an object where the keys are the worlds, values are true propositions at that world
        var duplicateCounter = {};
        var cdResult = false;
        for (var l=0;l<this.memoryBank.length;l++) {
            var idx6 = this.memoryBank[l][0];
            var propL = this.memoryBank[l][1];
            if (!duplicateCounter.hasOwnProperty(idx6)) {
                duplicateCounter[idx6] = [propL];
            } else {
                duplicateCounter[idx6].push(propL);
            };
        };
        for (var key1 in duplicateCounter) {
            if (duplicateCounter.hasOwnProperty(key1)) {
                var counter2 = 0
                var ci = 1
                for (var key2 in duplicateCounter) {
                    if (duplicateCounter.hasOwnProperty(key2)) {
                        // if two arrays have the same propositions, return true
                        if (equalArrays(duplicateCounter[key1], duplicateCounter[key2])) {
                            counter2++;
                            ci++;
                            if (counter2 > 1) {
                                cdResult = true;
                            };
                            
                        };
                    };
                
                };
            };
        };
        return cdResult;
    };
    

    this.mOperatorApplies = function() {
        // Checks if any of the 'M' rules apply
        for (h=0;h<this.memoryBank.length;h++) {
            var prop9 = this.memoryBank[h][1];
            var idx1 = this.memoryBank[h][0];
            var idLength = idx1.length;
            if (prop9[0] === 'M') {
                if (currentLogic === 'T' || currentLogic==='S4' || currentLogic==='S5') {
                    if (!tableHasProp(this.memoryBank,[idx1, prop9.slice(1)])) {
                        return true;
                    };
                } else if (currentLogic === 'D') {
                    if (!tableHasProp(this.memoryBank,[idx1, 'L'+prop9.slice(1)])) {
                        return true;
                    };
                };
                if (currentLogic === 'S5') {
                    if (idx1.length>1 && 
                        !tableHasProp(this.memoryBank, 
                                      [idx1.slice(0,-2),prop9])) {
                        return true;
                    };
                };
                if (currentLogic === 'B') {
                    if (idx1.length>1 && 
                        !tableHasProp(this.memoryBank, 
                                      [idx1.slice(0,-2),prop9.slice(1)])) {
                        return true;
                    };
                };
                var aWorlds1 = this.accessibleWorlds(idx1);
                for (g=0;g<aWorlds1.length;g++) {
                    if (currentLogic === 'K4' || currentLogic==='S4' || currentLogic==='S5') {
                        if (!tableHasProp(this.memoryBank,[aWorlds1[g],prop9])) {
                            return true;
                        };
                    };
                    if (!tableHasProp(this.memoryBank,[aWorlds1[g],prop9.slice(1)])) {
                        return true;
                    };
                };
            };
        };
        return false;
    };
    
    this.accessibleWorlds = function(base4) {
        // Return an array of the worlds accessible to the base world
        var result3 = [];
        var baseLength = base4.length;
        // Loop through the memoryBank and find propositions with accessible indices
        for (k=0;k<this.memoryBank.length;k++) {
            if (this.memoryBank[k][0].length === baseLength+2) {
                if (this.memoryBank[k][0].slice(0,baseLength) === base4) {
                    if (result3.indexOf(this.memoryBank[k][0]) === -1) {
                        result3.push(this.memoryBank[k][0]);
                    };
                };
            };
        };
        return result3;
    };
    
    this.idxNext = function(base1) {
        // Return the next available accessible world id
        // Make a list of the existing accessible indices
        var nums = [];
        var baseLength = base1.length;
        // baseSet is an array of all the existing propositions with the same base index
        var baseSet = [];
        for (var i=0;i<this.toDoArray.length;i++) {
            if (this.toDoArray[i][0].slice(0,baseLength) === base1) {
                baseSet.push(this.toDoArray[i]);
            };
        };
        // idxSet is an array of all the existing indices
        var idxSet = [];
        for (var i=0;i<baseSet.length;i++) {
            idxSet.push(baseSet[i][0]);
        };
        for (var i=0;i<idxSet.length;i++) {
            if (idxSet[i].length>baseLength) {
                nums.push(parseInt(idxSet[i][baseLength+1],10));
            };
            
        };
        // If there are no existing accessible worlds, add a '.1' suffix
        if (nums.length === 0) {
            return base1+'.1';
        };
        // Otherwise, find the highest existing index and add a suffix with one more than that
        maxNum = Math.max.apply(null,nums)+1;
        maxNum = maxNum.toString();
        return base1+'.'+maxNum;
    };
        
    
    this.splittingRulesApply = function(toDoArray7) {
        // Returns true if splitting rules apply to toDoArray1
        for (var s=0;s<toDoArray7.length;s++) {
            var propS = toDoArray7[s][1];
            if (propS[0] === 'C' && !tableHasProp(toDoArray7,[toDoArray7[s][0],propS.slice(1,2)]) || 
                propS[0] === 'A' ||
                propS[0] === 'B' ||
                propS.slice(0,2) === 'NB' ||
                propS.slice(0,2) === 'NK') {
                return true;
            };
        };
        return false;
    };
        
};


function tableHasProp(toDoArray6,proposition8) {
    // Checks to see if an array has a proposition
    var prop8 = proposition8[1];
    var idx8 = proposition8[0];
    for (v=0;v<toDoArray6.length;v++) {
        if (toDoArray6[v][0] === idx8) {
            if (toDoArray6[v][1] === prop8) {
                return true;
            };
        };
    };
    return false;
};

function startBeth() {
    // Initiates main tableau procedure
    // Create a new tableau object and add the input premises/conclusion
    var maintableau = new tableauObj();
    for (i=0;i<premises.length;i++) {
        maintableau.toDoArray.push(['1',premises[i]]);
    };
    maintableau.toDoArray.push(['1','N'+conclusion]);
    // Run Beth on the newly created tableau
    var resultMain = maintableau.callBeth();
    // Announce the result of the derivation
    (resultMain===true)?document.getElementById('resultLine').innerHTML += 
        '<b>VALID!</b>':document.getElementById('resultLine').innerHTML += '<b>INVALID</b>'
    // Show/animate the table
    showTable();
};

function getPos(el) {
    // Returns the offset of el relative to the window
    // Sums up the offsets of all parents
    var height = el.offsetHeight, width = el.offsetWidth;
    for (var lx=0, ly=0;
         el != null;
         lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
    return [lx,ly,lx+width,ly+height];
};

function lineThrough2() {
    // Adds a line through the propositions in the linelist
    var t = lineList.shift();
    t.style.textDecoration = 'line-through';
};

function lineThrough(prop) {
    // Finds prop in the table and changes style to strikethrough
    var theTable = document.getElementById('tableauDiv').firstChild;
    var tdSet = $('#tableauDiv').find("td");
    for (i=0;i<tdSet.length;i++) {
        if (tdSet[i].innerHTML === prop) {
            if (tdSet[i].style.textDecoration !== 'line-through') {
                tdSet[i].style.textDecoration = 'line-through';
                return;
            };
        };
    };
};



function lightTable() {
    // Search the table and highlight contradictories
    var tdSet1 = $('#tableauDiv').find("td");    // the set of TDs
    for (var o=0;o<lightList.length;o++) {
        var prop1 = lightList[o].toString();
        if (currentLogic === "NM") {
            prop1 = prop1.slice(2);
        };
    tdSet1.each(function(index, element) {
        if (element.innerHTML == prop1) {
            $(this).animate({"color": jQuery.Color("Red")}, 'fast');
        };
        });
    };
};

function showTable() {
    // Make the TDs in the table appear sequentially
    var d = 0;      // the delay
    var tdSet = $('#tableauDiv').find("td");    // the set of TDs
    if (currentLogic === 'NM') {
        // If the logic is 'Non-Modal', remove the world indices
        tdSet.each(function(number, element) {
            if (/[1-9]/.test(element.innerHTML)) {
                element.innerHTML = element.innerHTML.slice(2);
            };
        });
    };
    for (var y=0;y<showList.length;y++) {
        showList[y] = showList[y].toString();
        if (currentLogic === 'NM') {
            showList[y] = showList[y].slice(2);
        };
    };
    $(tdSet).each(function(index, element) {
        if (element.innerHTML.match(/[A-Wa-z]/) !== null) {
            $(this).delay(d).animate({ fontSize: "20px", opacity: "1"}, "fast");
        } else {
            $(this).delay(d).animate({ fontSize: "20px", opacity: "1"}, "fast");
            if (element.innerHTML !== '\u2573') {
                window.setTimeout(lineThrough2,d,showList.shift());
            };
        };
        d += 500;
    });
    //window.setTimeout(lightTable,d);
};



function equalArrays(array1,array2) {
    // Checks to see if two arrays are equal
    if (array1.length !== array2.length) {
        return false;
    };
    for (var x1=0;x1<array1.length;x1++) {
        var result = false;
        for (var x2=0;x2<array1.length;x2++) {
            if (array1[x1] === array2[x2]) {
                result = true;
            };
        };
        if (result === false) {
            return false;
        };  
    };
    return true;
};


function validateInput(string1) {
    // Checks if the string is a valid proposition in Polish notation
    // Check if the string contains any illegal characters
    var re = /^[a-zLMNKABC]*$/,
        result;
    if (!re.test(string1)) {
        result = false;
    // Check if the string is an atomic proposition
    } else if (string1.length==1) {
        if (string1.match(/[a-z]/) !== null) {
            result = true;
        } else {
            result = false;
        };
    // Make sure the operators and arguments are appropriate
    } else {
        var counter = 1;
        for (i=0;i<string1.length;i++) {
            if (binaryOperators.indexOf(string1[i])>-1) {
                counter++;
            } else if (string1[i].match(/[a-z]/) !== null) {
                counter--;
            };
        };
        if (counter == 0) {
            result = true;
        } else {
            result = false;
        };
    };
    if (currentLogic === 'NM') {
        if (/[LM]/.test(string1)) {
            alert("Modal operators are not allowed in non-modal logic");
            result = false;
        };
    };
    if (result == false) {
        return false;
    } else {
        return true;
    };
};

function submitRadio() {
    // Radio button to change the current logic
    currentLogic = $('input[name="optradio"]:checked').val();
};

function addPremise() {
    // Add a premise to the premise list
    var theTable = document.getElementById("premiseTable");
    var newPremise = document.getElementById("inputPremise").value;
    // Check if the input is valid
    if (!validateInput(newPremise)) {
        newPremise = translate(newPremise);
        if (/undefined/.test(newPremise)) {
            alert("Invalid input");
            return;
        };
        if (!validateInput(newPremise)) {
            alert("Invalid input");
            return;
        };
    };
    // Create new row and TD and add proposition to TD
    var newRow = document.createElement("TR");
    newRow.style.width = 'auto';
    theTable.appendChild(newRow);
    var newTD = document.createElement("TD");
    newTD.innerHTML += newPremise;
    newTD.style.float = "left";
    newTD.style.width = "90%";
    newTD.style.opacity = '0';
    
    newRow.appendChild(newTD);
    var newTDX = document.createElement("TD");
    newTDX.style.opacity = '0';
    newTDX.style.width = "10%";
    newTDX.style.float = "right";
    newRow.appendChild(newTDX);
    // Add "cancel" button to the premise row
    var newTDXButton = document.createElement("BUTTON");
    newTDXButton.className = "buttonClass";
    newTDXButton.innerHTML +='&#10007';
    newTDXButton.style.backgroundColor = 'inherit';
    newTDXButton.style.border = '0';
    newTDX.appendChild(newTDXButton);
    newTDXButton.addEventListener("click", function(){theTable.deleteRow(newRow.rowIndex); premises.splice(premises.indexOf(newTD.innerHTML),1)});
    
    premises.push(newPremise);
};


    

function disableButtons() {
    // Disable the buttons at start of derivation
    document.getElementById("premiseAddButton").disabled=
        true;
    document.getElementById("conclAddButton").disabled=
        true;
    document.getElementById("inputPremise").onkeydown='';
    document.getElementById("inputConclusion").onkeydown='';
    document.getElementById("inputPremise").removeEventListener("keydown",submitPremiseFunction);
    document.getElementById("inputConclusion").removeEventListener("keydown",submitConclusionFunction);
    var buttonList = document.getElementsByClassName("buttonClass");
    for (i=0;i<buttonList.length;i++) {
        buttonList[i].disabled = true;
    };
};



function addConclusion() {
    // Adds the conclusion and begins the tableau sequence
    conclusion = 
        document.getElementById("inputConclusion").value;
    if (!validateInput(conclusion)) {
        conclusion = translate(conclusion);
        if (/undefined/.test(conclusion)) {
            alert("Invalid input");
            return;
        };
        if (!validateInput(conclusion)) {
            alert("Invalid input");
            return;
        };
    };
    var theTable = document.getElementById("conclusionTable");
    var newRow = theTable.insertRow(0);
    newRow.style.width = 'inherit';
    newRow.style.overflow = 'hidden';
    var newTD = newRow.insertCell(0);
    newTD.style.width = 'inherit';
    newTD.style.overflow = 'hidden';
    newTD.innerHTML += conclusion;
    disableButtons();
    startBeth();
};

function resetTableau() {
    // Resets the elements to initial state
    document.getElementById("tableauDiv").innerHTML = "";
    document.getElementById("tableauDiv").style.width = '100%';
    enableButtons();
    premises = [];
    conclusion = "";
    tableWidth = 100;
    showList = [];
    lightList = [];
    document.getElementById("premiseTable").innerHTML = "";
    document.getElementById("conclusionTable").innerHTML = "";
    document.getElementById("resultLine").innerHTML = "<b>The argument is: </b>";
    document.getElementById("inputPremise").value='';
    document.getElementById("inputConclusion").value='';
};

function enableButtons() {
    // Turns the buttons back on after "Reset"
    document.getElementById("premiseAddButton").disabled=
        false;
    document.getElementById("conclAddButton").disabled=
        false;
    document.getElementById("inputPremise").addEventListener("keydown",submitPremiseFunction);
    document.getElementById("inputConclusion").addEventListener("keydown",submitConclusionFunction);
};





function isLiteral(string) {
    // Returns true iff the string is an atomic proposition or its negation
    if (string.match(/^N?[a-z]$/) !== null) {
        return true;
    } else {
        return false;
    };
};

        

function removeDuplicates(array1) {
    // Returns a duplicate array containing no repeated elements
    var uniqueArray = [];
    for (i=0;i<array1.length;i++) {
        if (uniqueArray.indexOf(array1[i]) == -1) {
            uniqueArray.push(array1[i]);
        };
    };
    return uniqueArray;
};
 

function getOperands(string) {
    // Returns the operands for unary and binary operators
    if (string.length == 1) {
        return [string];
    } else if (string[0] == 'N') {
        return [string.slice(1)];
    } else {
        var counter = 0;
        var index = 0;
        
        do {
            if (binaryOperators.indexOf(string[index])>-1) {
                counter++;
            } else if (string[index].match(/[a-z]/) !== 
                        null) {
                counter--;
            }
            index++;
        } while (counter > 0);
        var op1 = string.slice(1,index),
            op2 = string.slice(index);
        return [op1,op2];
    };
};


function submitPremiseFunction() {
    // Adds a premise to the premise list on "Enter"
    if(window.event.keyCode=='13'){
        submitPremises();
    };
};

function submitConclusionFunction() {
    // Adds the conclusion on "Enter"
    if(window.event.keyCode=='13'){
        submitConclusion();
    };
};

function submitPremises() {
    // Add premise to premise list, reset text field
    addPremise();
    document.getElementById("inputPremise").value='';
};

function submitConclusion() {
    // Add conclusion, reset text field
    addConclusion();
    document.getElementById("inputConclusion").value='';
};

