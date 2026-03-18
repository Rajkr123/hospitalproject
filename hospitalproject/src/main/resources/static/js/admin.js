const API = "http://localhost:8083";

fetch(API+"/admin/dashboard")
.then(res=>res.json())
.then(data=>{

document.getElementById("users").innerText=data.totalUsers
document.getElementById("doctors").innerText=data.totalDoctors
document.getElementById("patients").innerText=data.totalPatients
document.getElementById("appointments").innerText=data.totalAppointments

})

loadDoctors()

function loadDoctors(){

fetch(API+"/admin/pending-doctors")
.then(res=>res.json())
.then(data=>{

let table=""

data.forEach(d=>{

table+=`

<tr>
<td>${d.name}</td>
<td>${d.email}</td>
<td>
<button class="approve" onclick="approve(${d.id})">Approve</button>
<button class="reject" onclick="reject(${d.id})">Reject</button>
</td>
</tr>
`

})

document.getElementById("doctorTable").innerHTML=table

})

}

function approve(id){

fetch(API+"/admin/approve-doctor/"+id,{method:"POST"})
.then(()=>loadDoctors())

}

function reject(id){

fetch(API+"/admin/reject-doctor/"+id,{method:"POST"})
.then(()=>loadDoctors())

}
