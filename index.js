function sendMail(event) {
    event.preventDefault();

    const name = document.getElementById("txt11").value;
    const email = document.getElementById("email11").value;
    const message = document.getElementById("box11").value;

    if (!name || !email || !message) {
        alert("Please fill in all fields.");
        return;

       var params = { name, email, message }; 
    }
    
    const serviceID = "service_j79fre3";
    const templateID = "template_sl4h8y7";

    emailjs.send(serviceID, templateID, params)
        .then(res => {
            document.getElementById("txt11").value = "";
            document.getElementById("email11").value = "";
            document.getElementById("box11").value = "";
            alert("Your message sent successfully!");
        })
        .catch(err => {
            console.error("EmailJS error:", err);
            alert("Failed to send message. Error: " + JSON.stringify(err));
        });
}