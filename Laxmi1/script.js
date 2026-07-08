const profiles = {

CS:{
    hod:"hodcs@college.com",
    dean:"deancs@college.com"
},

EC:{
    hod:"hodec@college.com",
    dean:"deanec@college.com"
},

EEE:{
    hod:"hodeee@college.com",
    dean:"deaneee@college.com"
},

AIML:{
    hod:"hodaiml@college.com",
    dean:"deanaiml@college.com"
},

ME:{
    hod:"hodme@college.com",
    dean:"deanme@college.com"
},

AE:{
    hod:"hodaero@college.com",
    dean:"deanaero@college.com"
},

ARCH:{
    hod:"hodarch@college.com",
    dean:"deanarch@college.com"
}

};

const principal = "principal@college.com";

const form = document.getElementById("complaintForm");

if(form){

form.addEventListener("submit", async function(e){

e.preventDefault();

const dept =
document.getElementById("department").value;

const category =
document.getElementById("category").value;

const priority =
document.getElementById("priority").value;

const room =
document.getElementById("room").value;

const description =
document.getElementById("description").value;

const photo =
document.getElementById("photo").files[0];

let receiver;

if(priority==="High"){
receiver=principal;
}
else if(priority==="Medium"){
receiver=profiles[dept].dean;
}
else{
receiver=profiles[dept].hod;
}

const ticket =
"COMP"+
Math.floor(
100000+Math.random()*900000
);

const formData = new FormData();

formData.append("ticket_id",ticket);
formData.append("department",dept);
formData.append("category",category);
formData.append("priority",priority);
formData.append("room",room);
formData.append("description",description);
formData.append("assigned_to",receiver);

if(photo){
formData.append("photo",photo);
}

try{

const response = await fetch(
"https://smart-campus-complaint-system-m717.onrender.com/api/complaints",
{
method:"POST",
body:formData
}
);

const data = await response.json();

console.log("Saving Ticket:", ticket);

localStorage.setItem("latestTicket", ticket);

console.log("Saved:", localStorage.getItem("latestTicket"));

window.location.href = "success.html";

}
catch(error){

console.log(error);

alert(
"Error submitting complaint"
);

}

});

}