import * as pdfjsLib from "./pdf.mjs";
pdfjsLib.GlobalWorkerOptions.workerSrc = "./pdf.worker.mjs";

let seatData = {};

document.getElementById("pdfFile").addEventListener("change", function () {
    const file = this.files[0];
    const reader = new FileReader();

    reader.onload = async function () {
        const typedArray = new Uint8Array(this.result);

        const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
        let text = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(i => i.str).join(" ") + " ";
        }

        // Debug: print each character + its char code
    let debug = "";
    for (let i = 0; i < text.length; i++) {
    debug += `${text[i]}(${text.charCodeAt(i)}) `;
}
    console.log("DEBUG TEXT:", debug);

        parsePDF(text);
        console.log("FINAL seatData:", seatData);
        alert("PDF Loaded Successfully");
    };

    reader.readAsArrayBuffer(file);
});


// ---------------------- PARSE FUNCTION -------------------------
function parsePDF(text) {
    seatData = {};

    // UNIVERSAL REGEX FOR SVCE SEATING ENTRIES:
    // Matches:  <regno> <classno> <hall text> <seat>
    const regex = /\b(\d{8,15})\b\s+(\d{3,5})\s+(.*?)\s([A-Z]\d{1,3})\s+\d+/g;

    let match;

    while ((match = regex.exec(text)) !== null) {
        const reg = match[1];        // register number
        const classNo = match[2];    // class number
        const hall = match[3].trim(); // hall name (auto extract)
        const seat = match[4];       // seat no like K3, I5, H4

        seatData[reg] = { seat, classNo, hall };
    }

    console.log("FINAL UNIVERSAL seatData:", seatData);
}

// ---------------------- SEARCH FUNCTION -------------------------
window.searchSeat = function () {
    const reg = document.getElementById("reg").value.trim();
    const out = document.getElementById("output");

    if (Object.keys(seatData).length === 0) {
        out.innerHTML = `<p class="error">Upload PDF first.</p>`;
        return;
    }

    if (seatData[reg]) {
        const info = seatData[reg];
        out.innerHTML = `
            <div class="result">
                <p><b>Register No:</b> ${reg}</p>
                <p><b>Seat No:</b> ${info.seat}</p>
                <p><b>Class Room:</b> ${info.classNo}</p>
                <p><b>Hall / Location:</b> ${info.hall}</p>
            </div>
        `;
    } else {
        out.innerHTML = `<p class="error">Register number not found.</p>`;
    }
};
