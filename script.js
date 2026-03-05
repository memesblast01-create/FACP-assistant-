let csvData = [];
let uploadInput = document.getElementById("upload");
let video = document.getElementById("video");
let imagePreview = document.getElementById("imagePreview");
let result = document.getElementById("result");
let scanRectangle = document.getElementById("scanRectangle");

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

// --------------- Camera Setup ---------------
async function startCamera(){
    try{
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        video.srcObject = stream;
    }catch(e){
        console.error("Camera error:", e);
    }
}
startCamera();

// --------------- Handle Image Upload ---------------
uploadInput.addEventListener("change", function(e){
    let file = e.target.files[0];
    if(!file) return;

    let img = new Image();
    img.onload = function(){
        imagePreview.src = img.src;

        // Crop the center rectangle automatically
        let canvas = document.createElement("canvas");
        let rectWidth = img.width * 0.7;
        let rectHeight = img.height * 0.2;
        let rectX = img.width * 0.15;
        let rectY = img.height * 0.4;

        canvas.width = rectWidth;
        canvas.height = rectHeight;
        let ctx = canvas.getContext("2d");
        ctx.drawImage(img, rectX, rectY, rectWidth, rectHeight, 0, 0, rectWidth, rectHeight);

        scanImage(canvas);
    }
    img.src = URL.createObjectURL(file);
});

// --------------- OCR and Match ---------------
async function scanImage(image){
    result.innerHTML = "🔎 Scanning...";
    try{
        // Resize for faster scanning
        let maxWidth = 1000;
        let scale = Math.min(maxWidth/image.width, 1);
        let canvas = document.createElement("canvas");
        canvas.width = image.width * scale;
        canvas.height = image.height * scale;
        let ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        const { data: { text } } = await Tesseract.recognize(canvas, 'eng');
        console.log("OCR Text:", text);
        smartMatch(text);
    }catch(err){
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