document.addEventListener('DOMContentLoaded',function(){
    // add click event listener to table
    document.getElementById('serviceHistoryTable').addEventListener('click',function(event){
        if (event.target.textContent == 'Details') {
            // AJAX call to get the order items
            let repair_id = event.target.parentNode.parentNode.firstElementChild.textContent
            getRepairItems(repair_id).then(function(rows){
                // construct a table in a fixed div in the middle of the screen showing the contents of the order
                document.body.appendChild(createRepairsDiv(rows));
                document.getElementById('closeButton').addEventListener('click',closeDetails);
            })            
        }
        if (event.target.textContent == 'Cancel') {
            // AJAX delete request
            let repair_id = event.target.parentNode.parentNode.firstElementChild.textContent;
            cancelRepair(repair_id).then(function(text){
                // create confirmation box with the message from the server
                document.body.appendChild(createDeleteDiv(text));
                document.getElementById('closeButton').addEventListener('click',closeDetails);
                // remove order that was just cancelled
                if (text !== 'Repairs have been started, cannot cancel repair!') {
                    let removeTr = event.target.parentNode.parentNode;
                    removeTr.parentNode.removeChild(removeTr)
                }
            })
        }
        if (event.target.textContent == 'Update') {
            // AJAX update request
            let repair_id = event.target.parentNode.parentNode.firstElementChild.textContent;
            event.target.parentNode.parentNode.id = 'updateRow';
            // TODO: get repair details
            getRepair(repair_id).then(createRepairUpdateDiv).then(updateRepair).then(function(text) {
                document.body.appendChild(createDeleteDiv(text));
                document.getElementById('closeButton').addEventListener('click',closeDetails);
            })
        }
    })
})

function getRepair(repair_id) {
    // return object with repair details from a repair_id
    return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open('POST','/getRepair', true);
            xhr.setRequestHeader('Content-Type','application/json');
            xhr.addEventListener('load', function() {
                if(xhr.status >= 200 && xhr.status <400) {
                    resolve(JSON.parse(xhr.response)[0])
                }
                else {
                    reject(console.log("Error in network status: " + xhr.statusText))
                }
            })
            let payload = {'repair_id': repair_id}
            xhr.send(JSON.stringify(payload))
    })
}

function createRepairUpdateDiv(repair) {
    //create a div that contains fields for customer to update
    return new Promise(function(resolve, reject) {
        let {credit_card_num, credit_card_exp, request_date, repair_id} = repair
        let inputs = {'credit_card_num': credit_card_num, 'credit_card_exp': credit_card_exp, 'request_date': request_date, 'repair_id': repair_id}
        let div = document.createElement('div');
        div.id = 'updateDiv'
        div.style.border = '1rem solid';
        div.style.position = 'fixed';
        div.style.top = "20%";
        div.style.height = "60%";
        div.style.left = "20%";
        div.style.width = "60%";
        div.style.background = 'white';
        div.append(createInputs(inputs));
        div.appendChild(createUpdateButton());
        document.body.append(div)
        document.getElementById('updaterepair_id').disabled = true;
        document.getElementById('updateDiv').addEventListener('click',function(event) {
            if (event.target.textContent === 'Update Request') {
                //TODO: get relavent fields and resolve
                let updated_fields = {}
                let form = document.getElementById('updateRequestForm')
                let updated_inputs = form.getElementsByTagName('input')
                for (let updated_input of updated_inputs) {
                    updated_fields[updated_input.name] = updated_input.value
                }
                document.body.removeChild(form.parentNode)
                resolve(updated_fields)
            }
        })
    })
}

function createInputs(fields) {
    let form = document.createElement('form');
    form.id = 'updateRequestForm';
    let input
    let label
    for (const field in fields) {
        label = document.createElement('label')
        label.htmlFor = 'update'+field
        label.textContent = field
        form.append(label)
        input = document.createElement('input')
        if (field === 'request_date' || field === 'credit_card_exp') {
            input.type = 'date'
        }
        else {
            input.type = 'text'
        }
        input.name = field
        input.value = fields[field]
        input.id = 'update'+field
        form.appendChild(input)
        form.appendChild(document.createElement('br'))
    }
    return form
}

function createUpdateButton() {
    let btn = document.createElement('button')
    btn.textContent = 'Update Request';
    btn.id = 'updateButton'
    return btn
}

function updateRepair(repair) {
    // repair needs to have credit_card_num, credit_card_exp, request_date, repair_id properties
    return new Promise(function(resolve, reject) {
        var {credit_card_num, credit_card_exp, request_date, repair_id} = repair
        var xhr = new XMLHttpRequest();
        xhr.open('PUT','/service_history', true);
        xhr.setRequestHeader('Content-Type','application/json');
        xhr.addEventListener('load', function() {
            if(xhr.status >= 200 && xhr.status <400) {
                // update the request date
                let row = document.getElementById('updateRow')
                row.firstElementChild.nextElementSibling.textContent = request_date;
                resolve(xhr.responseText)
            }
            else {
                reject(console.log("Error in network status: " + xhr.statusText))
            }
            document.getElementById('updateRow').id = "";
        })
        let payload = {'credit_card_num': credit_card_num, 'credit_card_exp': credit_card_exp, 'request_date': request_date, 'repair_id': repair_id}
        xhr.send(JSON.stringify(payload))
    })
}

function cancelRepair(repair_id) {
    return new Promise(function(resolve,reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('DELETE','/service_history',true);
        xhr.setRequestHeader('Content-Type','application/json');
        xhr.addEventListener('load', function() {
            if(xhr.status >= 200 && xhr.status <400) {
                resolve(xhr.responseText)
            }
            else {
                reject(console.log("Error in network status: " + xhr.statusText))
            }
        })
        let payload = JSON.stringify({'repair_id':repair_id})
        xhr.send(payload)
    })
}

function getRepairItems(repair_id) {
    return new Promise(function(resolve,reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST','/service_history',true);
        xhr.setRequestHeader('Content-Type','application/json');
        xhr.addEventListener('load',function() {
            if(xhr.status >= 200 && xhr.status <400) {
                resolve(JSON.parse(xhr.response))
            }
            else {
                reject(console.log("Error in network status: " + xhr.statusText))
            }
        })
        xhr.send(JSON.stringify({'repair_id':repair_id}))
    })
}

function createDeleteDiv(text) {
    let div = document.createElement('div');
    div.id = 'detailsDiv'
    div.style.border = '1rem solid';
    div.style.position = 'fixed';
    div.style.top = "20%";
    div.style.height = "60%";
    div.style.left = "20%";
    div.style.width = "60%";
    div.style.background = 'white';
    div.textContent = text;
    div.appendChild(createCloseButton());
    return div
}

function createRepairsDiv(rows) {
    let div = document.createElement('div');
    div.id = 'detailsDiv'
    div.style.border = '1rem solid';
    div.style.position = 'fixed';
    div.style.top = "20%";
    div.style.height = "60%";
    div.style.left = "20%";
    div.style.width = "60%";
    div.style.background = 'white';
    div.appendChild(createTable(rows));
    div.appendChild(createCloseButton());
    return div
}

function createTable(rows) {
    let table = document.createElement('table')
    table.id = "orderItemsTable";
    table.appendChild(createHeaders());
    table.appendChild(createTBody(rows))
    return table
}

function createHeaders() {
    // return table headers
    let columns = ["service name", "Status", "Total Cost"]
    let thead = document.createElement('thead');
    let tr = document.createElement('tr');
    for (var i = 0; i < columns.length; i++) {
        let th = document.createElement('th')
        th.textContent = columns[i]
        tr.appendChild(th)
    }
    thead.appendChild(tr)
    return thead
}

function createTBody(rows) {
    // return tbody with tr for each row. each tr has td of row contents for each cell.
    let tb = document.createElement('tbody');
    for (var i = 0; i<rows.length; i++) {
        tb.appendChild(createRow(rows[i]))
    }
    return tb
}

function createRow(row) {
    // return a tr with td cells for a row
    let tr = document.createElement('tr')
    for (const col in row) {
        tr.appendChild(createCell(row[col]))
    }
    // check if item has been shipped or not
    var current = tr.firstElementChild.nextElementSibling
    if (current.textContent == 1) {
        current.textContent = 'Complete'
    }
    else {
        current.textContent = 'In Process'
    }
    return tr
}

function createCell(value) {
    // return a td with contents of given value
    let td = document.createElement('td')
    td.textContent = value
    return td
}

function createCloseButton() {
    let btn = document.createElement('button');
    btn.textContent = 'Close';
    btn.id = 'closeButton';
    return btn
}

function closeDetails() {
    let detailsDiv = document.getElementById('detailsDiv')
    document.body.removeChild(detailsDiv)
}