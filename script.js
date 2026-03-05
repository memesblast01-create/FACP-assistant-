let csvData = [];
let codeInput = document.getElementById("codeInput");
let result = document.getElementById("result");

// Load CSV
fetch("data.csv")
.then(res => res.text())
.then(text => {
    let rows = text.split("\n");
    rows.forEach(r => {
        let cols = r.split(",");
        if(cols.length >= 2){
            csvData.push(cols); // store full row
        }
    });
})
.catch(err => console.error("CSV Load Error:", err));

// Utility to clean text
function cleanText(text){
    return text.toUpperCase().replace(/[^A-Z0-9]/g,"");
}

// Listen to input changes
codeInput.addEventListener("input", function(){
    let inputCode = cleanText(this.value);
    if(inputCode.length === 0){
        result.innerHTML = "Result will appear here";
        return;
    }

    let found = false;
    for(let i=0;i<csvData.length;i++){
        let row = csvData[i];
        let csvCode = cleanText(row[0]);
        if(inputCode.includes(csvCode) || csvCode.includes(inputCode)){
            result.innerHTML =
            `<b>Code:</b> ${row[0]}<br>`+
            `<b>Building:</b> ${row[1]}<br>`+
            `<b>Floor:</b> ${row[2] || "Unknown"}<br>`+
            `<b>Room:</b> ${row[3] || "Unknown"}<br>`+
            `<b>Name:</b> ${row[4] || "Unknown"}`;
            found = true;
            break;
        }
    }

    if(!found){
        result.innerHTML = "❌ No Data Found";
    }
});