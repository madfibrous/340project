document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('inProcessRepairsTable').addEventListener('click', function(event) {
        //TODO: get repair/service id and then send AJAX request to UPDATE to complete
        let row = event.target.parentNode.parentNode
        let repair_id = row.firstElementChild.textContent
        let service_id = row.firstElementChild.nextElementSibling.textContent
        repairComplete(repair_id, service_id, row).then(function(row) {
            removeRow(row)
        }).catch(function(err){ 
            console.log('Error in network status: '+err)
        }
            
    )
    })
})

function repairComplete(repair_id, service_id, row_node) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('PUT','/inProcess',true);
        xhr.setRequestHeader('Content-Type','application/json');
        // TODO: send repair_id & service_id to server
        xhr.addEventListener('load', function() {
            if(xhr.status >= 200 && xhr.status <400) {
                resolve(row_node)
            }
            else {
                reject(xhr.statusText)
            }
        })
        let payload = {'repair_id':repair_id, 'service_id':service_id}
        xhr.send(JSON.stringify(payload))
    })    
}

function removeRow(row_node) {
    let tb = document.getElementsByTagName('tbody')[0];
    tb.removeChild(row_node)
    return
}