fetch("http://localhost:8083/admin/dashboard")
.then(res=>res.json())
.then(data=>{

document.getElementById("patients").innerText=data.totalPatients
document.getElementById("doctors").innerText=data.totalDoctors
document.getElementById("appointments").innerText=data.totalAppointments

const ctx=document.getElementById("chart")

new Chart(ctx,{
type:"bar",
data:{
labels:["Patients","Doctors","Appointments"],
datasets:[{
label:"Hospital Data",
data:[
data.totalPatients,
data.totalDoctors,
data.totalAppointments
]
}]
}
})

})
