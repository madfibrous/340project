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
            disableInputs()
            console.log('submitting request')
            createServiceRequest()
        }
    })
})

function createServiceRequest(){
    var xhr = new XMLHttpRequest();
    var urlString = '/serviceRequest';
    xhr.open('POST',urlString,true);
    xhr.setRequestHeader('Content-Type','application/json');
    var payload = {};
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
    while (row !== null) {
        current = row.firstElementChild.nextElementSibling
        service = {}
        service['price'] = current.textContent
        current = current.nextElementSibling
        service['id'] = current.textContent
        services.push(service)
        row = row.nextElementSibling
    }
    //TODO: confirm that there are no duplicate service_IDs or blanks chosen
    payload.services = services
    xhr.addEventListener('load',function(){
        console.log(xhr)
        if(xhr.status >= 200 && xhr.status <400) {
            var response = JSON.parse(xhr.response)
            console.log('received repair_id')
            console.log(response)
            document.body.append(createConfirmationBox(response.repair_id))
            let goHomeBtn = document.getElementById('goHomeBtn');
            goHomeBtn.addEventListener('click',function(){
                window.location.href = '/';
            })
        }
        else {
            console.log("Error in network status: " + xhr.statusText)
        }
    })
    xhr.send(JSON.stringify(payload));
}

function disableInputs() {
    // disable inputs
    var inputs = document.getElementsByTagName('input')
    var buttons = document.getElementsByTagName('button')
    var dropdowns = document.getElementsByTagName('select')
    for (let obj of inputs) {
        obj.disabled = 'disabled'
    };
    for (let obj of buttons) {
        obj.disabled = 'disabled'
    };
    for (let obj of dropdowns) {
        obj.disabled = 'disabled'
    }
}

function createConfirmationBox(repair_id) {
    // create a confirmation dialogue box
    let confirmationBox = document.createElement('div');
    confirmationBox.style.border = '1rem solid';
    confirmationBox.innerText = 'Successfully made your repair request!\nYour request ID is : ' + repair_id+"\nPlease keep this ID for your records.";
    confirmationBox.style.position = 'fixed';
    confirmationBox.style.top = "20%";
    confirmationBox.style.height = "60%";
    confirmationBox.style.left = "20%";
    confirmationBox.style.width = "60%";
    confirmationBox.appendChild(createGoHomeButton())
    return confirmationBox
}

function createGoHomeButton() {
    // return a button that routes to '/Home'
    let btn = document.createElement('button');
    btn.textContent = "Go Home";
    btn.id = 'goHomeBtn';
    return btn
}