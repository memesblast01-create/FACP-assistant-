let csvData = [];
let uploadInput = document.getElementById("upload");
let imagePreview = document.getElementById("imagePreview");
let result = document.getElementById("result");

// --------------- Load CSV ---------------
fetch("data.csv")
.then(res => res.text())
.then(text => {
    let rows = text.split("\n");
    rows.forEach(r => {
        let cols = r.split(",");
        if(cols.length >= 2){
            csvData.push(cols);  // store full row
        }
    });
})
.catch(err => console.error("CSV Load Error:", err));

// --------------- Utility: Clean Text ---------------
function cleanText(text){
    return text.toUpperCase().replace(/[^A-Z0-9]/g,"");
}

// --------------- Handle Image Upload ---------------
uploadInput.addEventListener("change", function(e){
    let file = e.target.files[0];
    if(!file) return;

    let img = new Image();
    img.onload = function(){
        // Show smaller preview
        imagePreview.src = img.src;

        // Draw on canvas for OCR
        let canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        let ctx = canvas.getContext("2d");
        ctx.drawImage(img,0,0);

        // Run OCR
        scanImage(canvas);
    }
    img.src = URL.createObjectURL(file);
});

// --------------- OCR and Match ---------------
async function scanImage(image){
    result.innerHTML = "🔎 Scanning image...";
    try {
        const { data: { text } } = await Tesseract.recognize(image,'eng');
        console.log("OCR Text:", text);

        smartMatch(text);
    } catch(err){
        console.error(err);
        result.innerHTML = "❌ OCR failed. Try again.";
    }
}

// --------------- Match OCR Text with CSV ---------------
function smartMatch(ocrText){
    let cleanedOCR = cleanText(ocrText);
    let found = false;

    for(let i=0;i<csvData.length;i++){
        let row = csvData[i];
        let csvCode = row[0] || "";
        let cleanedCSV = cleanText(csvCode);

        if(cleanedOCR.includes(cleanedCSV)){
            // Match found
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
}