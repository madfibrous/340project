document.addEventListener('DOMContentLoaded',function(){
    // add click event listener to table
    document.getElementById('orderHistoryTable').addEventListener('click',function(event){
        if (event.target.textContent == 'Details') {
            // AJAX call to get the order items
            let order_num = event.target.parentNode.parentNode.firstElementChild.textContent
            getOrderItems(order_num).then(function(rows){
                // construct a table in a fixed div in the middle of the screen showing the contents of the order
                document.body.appendChild(createOrdersDiv(rows));
                document.getElementById('closeButton').addEventListener('click',closeDetails);
            })    
        }
        if (event.target.textContent == 'Cancel') {
            // AJAX delete request
            let order_num = event.target.parentNode.parentNode.firstElementChild.textContent;
            cancelOrder(order_num).then(function(text){
                // create confirmation box with the message from the server
                document.body.appendChild(createDeleteDiv(text));
                document.getElementById('closeButton').addEventListener('click',closeDetails);
                // remove order that was just cancelled
                if (text !== 'Items are shipped already, cannot cancel order!') {
                    let removeTr = event.target.parentNode.parentNode;
                    removeTr.parentNode.removeChild(removeTr)
                }
            })
        }
    })
})

function cancelOrder(order_num) {
    return new Promise(function(resolve,reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('DELETE','/order_history',true);
        xhr.setRequestHeader('Content-Type','application/json');
        xhr.addEventListener('load', function() {
            if(xhr.status >= 200 && xhr.status <400) {
                resolve(xhr.responseText)
            }
            else {
                reject(console.log("Error in network status: " + xhr.statusText))
            }
        })
        let payload = JSON.stringify({'order_num':order_num})
        xhr.send(payload)
    })
}

function getOrderItems(order_num) {
    return new Promise(function(resolve,reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST','/order_history',true);
        xhr.setRequestHeader('Content-Type','application/json');
        xhr.addEventListener('load',function() {
            if(xhr.status >= 200 && xhr.status <400) {
                resolve(JSON.parse(xhr.response))
            }
            else {
                reject(console.log("Error in network status: " + xhr.statusText))
            }
        })
        xhr.send(JSON.stringify({'order_num':order_num}))
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

function createOrdersDiv(rows) {
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
    let columns = ["catalog ID", "price paid", "shipped", "shipping date", "quantity ordered"]
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
    var current = tr.firstElementChild.nextElementSibling.nextElementSibling
    if (current.textContent == 1) {
        current.textContent = 'Yes'
    }
    else {
        current.textContent = 'No'
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