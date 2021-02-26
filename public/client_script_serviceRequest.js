document.addEventListener('DOMContentLoaded',function(){
    // choose feature so that when it's chosen, the displayed total cost is adjusted and also add to list of chosen services
    document.getElementById('chooseService').addEventListener('click',function(event){
        event.preventDefault()
        event.stopPropagation()
        var tbody = document.getElementById('servicesTable').lastElementChild
        var newRow = document.createElement('tr')
        var insertValues = [];
        var service = document.getElementById('service')
        if (service.value == '--Please select a service--') {
            return
        }
        insertValues.push(service.options[service.selectedIndex].getAttribute('serviceName'))
        insertValues.push(service.options[service.selectedIndex].getAttribute('price'))
        insertValues.push(service.value)
        for (let column in insertValues) {
            var td = document.createElement('td')
            td.textContent = insertValues[column]
            newRow.appendChild(td)
        }
        // hide the id
        newRow.lastElementChild.setAttribute('hidden','hidden')
        // add a remove button
        td = document.createElement('td');
        var btn = document.createElement('button')
        btn.name = 'remove'
        btn.value = 'remove'
        btn.textContent = "Remove"
        td.appendChild(btn)
        newRow.appendChild(td)
        tbody.appendChild(newRow)
        // update the total cost
        var total = document.getElementById('totalCost')
        total.textContent = (Number(total.textContent) + Number(insertValues[1])).toFixed(2)
    })
})

document.addEventListener('DOMContentLoaded',function(){
    document.getElementById('serviceRequestForm').addEventListener('click',function(event){
        event.preventDefault()
        if (event.target.name == 'remove') {
            // remove target row if remove button was pressed
            remove_row = event.target.parentNode.parentNode
            price = remove_row.firstElementChild.nextElementSibling.textContent
            document.getElementById('servicesTable').lastElementChild.removeChild(remove_row)
            // update cost
            var total = document.getElementById('totalCost')
            total.textContent = (Number(total.textContent) - Number(price)).toFixed(2)
            event.stopPropagation
        }
        if (event.target.name == 'submit') {
            // send post request to /serviceRequest with relevant info
            console.log('submitting request')
            createServiceRequest()
        }
    })
})

function createServiceRequest(){
    console.log('preparing request')
    var xhr = new XMLHttpRequest();
    var urlString = '/serviceRequest';
    xhr.open('POST',urlString,true);
    xhr.setRequestHeader('Content-Type','application/json');
    var payload = {};
    console.log('preparing payload')
    payload['cust_id'] = document.getElementById('cust_id').value
    payload['request_date'] = document.getElementById('request_date').value
    payload['credit_card_num'] = document.getElementById('credit_card_num').value
    payload['credit_card_exp'] = document.getElementById('credit_card_exp').value
    var services = [];
    var row = document.getElementById('servicesTable').lastElementChild.firstElementChild
    if (row === null) {
        return
    }
    var service
    console.log('getting services')
    while (row !== null) {
        current = row.firstElementChild.nextElementSibling
        service = {}
        console.log(row)
        console.log(current.textContent)
        service['price'] = current.textContent
        current = current.nextElementSibling
        console.log(current.textContent)
        service['id'] = current.textContent
        services.push(service)
        row = row.nextElementSibling
    }
    console.log(services)
    payload.services = services
    xhr.addEventListener('load',function(){
        if(xhr.status >= 200 && xhr.status <400) {
            console.log('success')
        }
        else {
            console.log("Error in network status: " + xhr.statusText)
        }
    })
    console.log(payload)
    xhr.send(JSON.stringify(payload))
}