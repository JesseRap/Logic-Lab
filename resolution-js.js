var binaryOperators = 'KCAB';
var theClauseArray = [];
var noteList = [];
var noteLightList = [];
var tracker;
var rowN = 0;

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


function CNFRulesApply(array) {
    // Checks if CNF conversion rules apply to a clause set
    // Returns true if any of the formulas are not literals
    console.log('begin RulesApply');
    console.log(array);
    for (var i=0;i<array.length;i++) {
        var clause = array[i];
        for (var j=0;j<clause.length;j++) {
            var prop = clause[j];
            if (!/^N?[a-z]$/.test(prop)) {
                return true;
            };
        };
    };
    // Checks to see if resolution can be applied
    if (resolveRulesApply(array)) {
        return true;
    };
    return false;
};


function addToResTable(array2) {
    // Adds a clause set to the resolution table
    console.log(["BEGIN ADDTORESTABLE", JSON.stringify(array2)]);
    var resTable = document.getElementById("resTable");
    // Create a new row and TD in the res table
    var newRow = document.createElement("TR");
    var newTD = document.createElement("TD");
    newTD.style.opacity = '0';

    for (var t=0;t<array2.length;t++) {
        // For each clause in the clause set, create a new span 
        console.log(array2[t]);
        var newSpan1 = document.createElement("span");
        newTD.appendChild(newSpan1);
        newSpan1.className = "diffSpan";
        
        if (array2[t].length === 0) {
            // If it's the empty clause, add an empty span
            newSpan1.innerHTML += '[<span class="otherSpan"> </span>';
        } else {
            console.log("YOOHOO");
            console.log(array2[t]);
            console.log(array2[t].join(", "));
            newSpan1.innerHTML += '[';
            for (var v=0;v<array2[t].length;v++) {
                // For each proposition in the clause, add it to a new span
                var newSpan = document.createElement("span");
                newSpan.className = "otherSpan";
                newSpan.innerHTML += array2[t][v];
                newSpan1.appendChild(newSpan);
                if (v < array2[t].length-1) {
                    newSpan1.innerHTML += ', ';
                };  
            };            
        };
        // If at the end of the clause set, add a closing bracket
        t<(array2.length-1)? newSpan1.innerHTML += '], ': newSpan1.innerHTML += ']';        
    };
    
    // Append the new row to the resTable, unless it's identical with the last row.
    if (resTable.firstElementChild === null) {
        newRow.appendChild(newTD);
        resTable.appendChild(newRow);
    } else if (resTable.lastElementChild.firstElementChild.innerHTML !== newTD.innerHTML) {
        newRow.appendChild(newTD);
        resTable.appendChild(newRow);
    };
};


function CNFConvert(clauseArray) {
    // **The main function in the app**
    // Convert the input formulae into CNF, and apply resolution rule
    console.log('start');
    whileLoop:
       while (CNFRulesApply(clauseArray)) {
           // Continue to apply the conversion/resolution rules as long as possible
           console.log("top");
           console.log(JSON.stringify(clauseArray));
           addToResTable(clauseArray);
           bigloop:
               for (var i=0;i<clauseArray.length;i++) {
                   // Loop through the clause set and apply the CNF conversion rules
                   // By default, don't skip the resolution rules;
                   // If a CNF rule applies, skip the res rule for the loop
                   var skip = false;
                   var clause = clauseArray[i];
                   console.log(clause);
                   for (var j=0;j<clause.length;j++) {
                       // Loop through the clause and apply the CNF rules to each proposition
                       var prop = clause[j];
                       console.log(['prop',prop]);
                       var ops = getOperands(prop);
                       if (prop[0] === 'C') {
                           clause.splice(j, 1, 'N'+ops[0], ops[1]);
                           noteList.push('&#946; rule');
                           noteLightList.push([i,j]);
                           skip = true;
                           break bigloop
                       } else if (prop[0] === 'A') {
                           console.log("A");
                           clause.splice(j,1,ops[0],ops[1]);
                           noteList.push('&#946; rule');
                           noteLightList.push([i,j]);
                           skip = true;
                           break bigloop;
                       } else if (prop.slice(0,2) === 'NN') {
                           console.log("NN");
                           clause.splice(j,1,prop.slice(2));
                           noteList.push('&#946; rule');
                           noteLightList.push([i,j]);
                           skip = true;
                           break bigloop;
                       } else if (prop.slice(0,2) === 'NK') {
                           console.log("NK");
                           ops = getOperands(prop.slice(1));                                                          clause.splice(j,1,'N'+ops[0],'N'+ops[1]);
                           noteList.push('&#945; rule');
                           noteLightList.push([i,j]);
                           skip = true;
                           break bigloop;
                       } else if (prop[0] === 'K') {
                           console.log("K");
                           var clause1 = clause.slice();
                           var clause2 = clause.slice();
                           clause1.splice(j,1,ops[0]);
                           clause2.splice(j,1,ops[1]);
                           clauseArray.splice(i,1,clause1,clause2);
                           noteList.push('&#945; rule');
                           noteLightList.push([i,j]);
                           skip = true;
                           break bigloop;
                       } else if (prop.slice(0,2) === 'NC') {
                           console.log("NC");
                           ops = getOperands(prop.slice(1));
                           var clause1 = clause.slice();
                           var clause2 = clause.slice();
                           clause1.splice(j,1,ops[0]);
                           clause2.splice(j,1,'N'+ops[1]);
                           clauseArray.splice(i,1,clause1,clause2);
                           noteList.push('&#945; rule');
                           noteLightList.push([i,j]);
                           skip = true;
                           break bigloop;
                       } else if (prop.slice(0,2) === 'NA') {
                           console.log("NA");
                           ops = getOperands(prop.slice(1));
                           var clause1 = clause.slice();
                           var clause2 = clause.slice();
                           clause1.splice(j,1,'N'+ops[0]);
                           clause2.splice(j,1,'N'+ops[1]);
                           clauseArray.splice(i,1,clause1,clause2);
                           noteList.push('&#945; rule');
                           noteLightList.push([i,j]);
                           skip = true;
                           break bigloop;
                       };
                   };
               };
           addToResTable(clauseArray);
           console.log("SKIP");
           console.log(skip);
           if (!skip) {
               if (clauseArray.length > 1) {
                   smallLoop:
                       for (var i=0;i<clauseArray.length;i++) {
                           console.log("small loop");
                           for (var j=0;j<clauseArray.length;j++) {
                               console.log(['small loop', JSON.stringify(clauseArray[i]), JSON.stringify(clauseArray[j])]);
                               if (clauseArray[i] !== clauseArray[j]) {
                                   if (resolve(clauseArray[i],clauseArray[j]) !== null) {
                                       var newAdd = [];
                                       var indicesI = getAllIndices(clauseArray[i],tracker);
                                       var indicesJ = getAllIndices(clauseArray[j],'N'+tracker);
                                       for (var t=0;t<indicesI.length;t++) {
                                            newAdd.push([i,indicesI[t]]);
                                       };
                                       for (var t=0;t<indicesJ.length;t++) {
                                            newAdd.push([j,indicesJ[t]]);
                                       };
                                       noteLightList.push(newAdd);
                                       clauseArray.splice(i,1,resolve(clauseArray[i],clauseArray[j]));
                                       clauseArray.splice(j,1);
                                       console.log('before small break');
                                       console.log(JSON.stringify(clauseArray));
                                       noteList.push('Resolution');
                                       
                                       break smallLoop;
                                   };
                               };
                           };
                       };
               };
           };
           console.log('bottom');
           console.log(clauseArray);
       };
    addToResTable(clauseArray);
    return clauseArray;
};

function getAllIndices(array, element) {
    // Return an array of all indices of an element in an an array
    var indices = [];
    for (var i=0;i<array.length;i++) {
        // Loop through the array, adding indexOf results
        // while increasing the starting point of indexOf
        var newIndex = array.indexOf(element,i);
        if (indices.indexOf(newIndex) === -1) {
            indices.push(newIndex);
        };
    };
    if (indices.length > 1 && indices.indexOf(-1) !== -1) {
        indices.splice(indices.indexOf(-1),1);
    };
    return indices;
};

function checkResClosed(clauseSet) {
    console.log("START Check res closed");
    console.log(JSON.stringify(clauseSet));
    for (var x=0;x<clauseSet.length;x++) {
        console.log(clauseSet[x]);
        if (clauseSet[x].length === 0) {
            console.log("IT'S CLOSED");
            return true;
        };
    };
    return false
};

function checkResClosed2(clauseSet) {
    console.log("START CHECK CLOSED");
    for (var x=0;x<clauseSet.length;x++) {
        var clause1 = clauseSet[x];
        var clause2 = clause1.filter(function(value,index,array) {
            if (value.length > 1) {
                return false;
            };
            var newRE = new RegExp('N'+value);
            return newRE.test(clause1);
        });
        if (clause2.length < 1) {
            return false;
        };
    };
    return true;
};

function resolve(clause1, clause2) {
    console.log('resolve start');
    console.log(JSON.stringify(clause1));
    console.log(JSON.stringify(clause2));
    var clause3 = clause1.slice();
    var clause4 = clause2.slice();
    for (var y=0;y<clause3.length;y++) {
        var element = clause3[y];

        if (clause4.filter(function(value, idx) {
            return value === 'N'+element;
        }).length > 0) {
            var newClause = [];
            for (var z=0;z<clause3.length;z++) {
                if (clause3[z] !== element) {
                    newClause.push(clause3[z]);
                };
            };
            for (var z=0;z<clause4.length;z++) {
                if (clause4[z] !== 'N'+element) {
                    newClause.push(clause4[z]);
                };
            };
            console.log(["Resolve result ", JSON.stringify(newClause)]);
            tracker = element;
            console.log('tracker '+tracker);
            return newClause;
        };
    };
    console.log("FALSE");
    return null;
};

//alert(['RESOLVE',resolve(['p','r','Apq'],['r','q','NApq'])]);

function resolveRulesApply(clauseSet1) {
    for (var r=0;r<clauseSet1.length;r++) {
    //clauseSet1.forEach(function(element,index, array) {
        var element = clauseSet1[r];
        for (var c=0;c<clauseSet1.length;c++) {
            if (clauseSet1[r] !== clauseSet1[c]) {
                if (resolve(element, clauseSet1[c]) !== null) {
                    return true;
                };
            };
        };
    };
    return false;
};

function resolution(inputString) {
    var inputArray = CNFConvert(inputString);
};

//resolution('ApNp');

function submitResConcl() {
    var conclusion = 
        document.getElementById("inputResConclusion").value;
    document.getElementById("inputResConclusion").value='';
    if (!validateInput(conclusion)) {
        conclusion = translate(conclusion);
        if (/undefined/.test(conclusion)) {
            alert("Invalid input");
            document.getElementById("inputResConclusion").value='';
            return;
        };
        if (!validateInput(conclusion)) {
            alert("Invalid input");
            document.getElementById("inputResConclusion").value='';
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
    theClauseArray.push(['N'+conclusion]);
    var result1 = CNFConvert(theClauseArray);
    checkResClosed(result1)?document.getElementById("resultLine").innerHTML+="<b>VALID!</b>":document.getElementById("resultLine").innerHTML+="<b>INVALID</b>";
    disableResButtons();
    showResTable();
};

function resetTableau() {
    // Resets the elements to initial state
    document.getElementById("resTable").innerHTML = "";
    document.getElementById("resTable").style.width = '100%';
    document.getElementById("noteTable").innerHTML = "";
    enableButtons();
    premises = [];
    conclusion = "";
    tableWidth = 100;
    showList = [];
    lightList = [];
    theClauseArray = [];
    noteList = [];
    rowN = 0;
    document.getElementById("premiseTable").innerHTML = "";
    document.getElementById("conclusionTable").innerHTML = "";
    document.getElementById("resultLine").innerHTML = "<b>The argument is: </b>";
    document.getElementById("inputResPremise").value='';
    document.getElementById("inputResConclusion").value='';
};

function disableResButtons() {
    // Disable the buttons at start of derivation
    document.getElementById("resPremiseAddButton").disabled=
        true;
    document.getElementById("resConclAddButton").disabled=
        true;
    document.getElementById("inputResPremise").onkeydown='';
    document.getElementById("inputResConclusion").onkeydown='';
    document.getElementById("inputResPremise").removeEventListener("keydown",submitResPremiseFunction);
    document.getElementById("inputResConclusion").removeEventListener("keydown",submitResConclFunction);
    var buttonList = document.getElementsByClassName("buttonClass");
    for (i=0;i<buttonList.length;i++) {
        buttonList[i].disabled = true;
    };
};

function enableButtons() {
    // Turns the buttons back on after "Reset"
    document.getElementById("resPremiseAddButton").disabled=
        false;
    document.getElementById("resConclAddButton").disabled=
        false;
    document.getElementById("inputResPremise").addEventListener("keydown",submitResPremiseFunction);
    document.getElementById("inputResConclusion").addEventListener("keydown",submitResConclFunction);
};

function submitResPremise() {
    // Add premise to premise list, reset text field
    addResPremise();
    document.getElementById("inputResPremise").value='';
};

function addResPremise() {
    // Add a premise to the premise list
    var theTable = document.getElementById("premiseTable");
    var newPremise = document.getElementById("inputResPremise").value;
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
    
    newRow.appendChild(newTD);
    var newTDX = document.createElement("TD");
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
    newTDXButton.addEventListener("click", function(){theTable.deleteRow(newRow.rowIndex); theClauseArray.splice(theClauseArray.indexOf([newTD.innerHTML]),1)});
    theClauseArray.push([newPremise]);
};

function submitResPremiseFunction(inputKey) {
    if(inputKey == '13'){
        submitResPremise();
    };
};

function submitResConclFunction(inputKey) {
    // Adds the conclusion on "Enter"
    if(inputKey == '13') {
        submitResConcl();
    };
};

function showResTable() {
    // Make the TDs in the table appear sequentially
    var d = 0;      // the delay
    var tdSet = $('#resTable').find("td");    // the set of TDs
    var noteTable = document.getElementById("noteTable");
    //for (var y=0;y<showList.length;y++) {
    //    showList[y] = showList[y].toString();
    //};
    $(tdSet).each(function(index, element) {
        $(this).delay(d).animate({ fontSize: "18px", opacity: "1"}, "slow");
        d += 750
        if (noteList.length > 0) {
            var newTR1 = document.createElement("TR");
            var newTD1 = document.createElement("TD");
            newTD1.style.opacity = '0';
            newTD1.innerHTML += noteList.shift();
            newTR1.appendChild(newTD1);
            noteTable.appendChild(newTR1);
            $(newTD1).delay(d).animate({ fontSize: "18px", opacity: "1"}, "slow");
            if (noteLightList.length > 0) {
                setTimeout(lightResTable,d);
                setTimeout(function(){rowN++;},d);
            };

            d += 750;
        };
    });
    
    setTimeout(lightLast,d);
    //window.setTimeout(lightTable,d);
    console.log(JSON.stringify(noteLightList));
};

function lightLast() {
    console.log("LIGHT LAST");
    console.log("Row no. "+rowN);
    var Rows = document.getElementById("resTable").getElementsByTagName('tr');
    var lastRow = Rows[Rows.length-1];
    console.log(lastRow.innerHTML);
    var spans = $(lastRow).find(".diffSpan");
    console.log(spans);
    console.log(spans.length);
    spans.each(function(index, element) {
        if (element.firstElementChild.innerHTML === ' ') {
            console.log(element);
            console.log(element.firstElementChild);
            element.style.color = 'red';
        };
    });
    
};
    
    

function lightResTable() {
    console.log("LIGHT RES TABLE");
    var noteTable = document.getElementById("noteTable");
    var resTable = document.getElementById("resTable");
    
    var Rows = $("#resTable").find('tr');
    //for (var w=0;w<Rows.length;w++) {
    var nextItem = noteLightList.shift();
    console.log(nextItem);
    var currentRow = Rows[rowN];
    console.log("Row no. "+rowN);
    console.log(currentRow.innerHTML);
    if (typeof(nextItem[0]) === 'number') {
        console.log('number');
        var clauses = currentRow.getElementsByClassName("diffSpan");
        console.log(JSON.stringify(clauses));
        console.log(clauses.length);
        var currentClause = clauses[nextItem[0]];
        console.log(currentClause);
        var props = currentClause.getElementsByClassName("otherSpan");
        var currentProp = props[nextItem[1]];
        console.log(currentProp);
        currentProp.style.color = 'red';
        console.log("hereeee");
    } else {
        console.log("down heeere");
        nextItem.forEach(function(element, index, array) {
            console.log('array');
            console.log([element[0], element[1]]);
            console.log(currentRow);
            var clauses = currentRow.getElementsByClassName("diffSpan");
            //console.log(JSON.stringify(clauses));
            console.log(clauses.length);
            var currentClause = clauses[element[0]];
            console.log(currentClause);
            var props = currentClause.getElementsByClassName("otherSpan");
            console.log(props.length);
            element[1]<0?currentProp = props[0]:currentProp = props[element[1]];
            //var currentProp = props[element[1]];
            console.log(currentProp);
            console.log(currentProp.innerHTML);
            currentProp.style.color = 'red';
        });
    };
    
    //};
};


$(function() {
    $("#inputResConclusion").on('keydown', function(event) {
        var inputKey = 'which' in event? event.which : event.keyCode;
        submitResConclFunction(inputKey);
    })
});

$(function() {
    $("#inputResPremise").on('keydown', function(event) {
        var inputKey = 'which' in event? event.which : event.keyCode;
        submitResPremiseFunction(inputKey);
    })
});
