document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('primaryBikeTable').addEventListener('click', function(event) {
        if (event.target.textContent === 'Remove') {
            removePrimaryBike().then(function() {
                removeTable()
            }).catch(function(err){ 
                console.log('Error in network status: '+err)
            })
        } 
    })
})

function removePrimaryBike() {
    return new Promise (function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open('PUT','/customer', true);
        xhr.addEventListener('load', function() {
            if(xhr.status >= 200 && xhr.status <400) {
                resolve()
            }
            else {
                reject(xhr.statusText)
            }
        })
        xhr.send();
    })
}

function removeTable() {
    let tb = document.getElementsByTagName('tbody')[0];
    let tr = tb.getElementsByTagName('tr')[0]
    tb.removeChild(tr)
    let new_tr = document.createElement('tr')
    let td = document.createElement('td')
    td.textContent = 'NULL';
    new_tr.appendChild(td);
    tb.appendChild(new_tr)
    return
}