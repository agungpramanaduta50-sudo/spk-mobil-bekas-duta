/* 
   SPK Pemilihan Mobil Bekas - Export & Import Module (js/export.js)
   Handles generating professional academic PDFs and CSV import/export operations.
*/

// Export PDF for SPK Rankings
function exportPDF(method) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Academic Student details
    const studentName = "Duta Agung Pramana";
    const studentNIM = "231011400036";
    const studentClass = "06TPLP001";
    
    // Fetch calculations based on method
    let ranking = [];
    let methodTitle = "";
    let scoreHeader = "";
    
    if (method === "saw") {
        ranking = calculateSAW().ranking;
        methodTitle = "Simple Additive Weighting (SAW)";
        scoreHeader = "Skor SAW";
    } else if (method === "wp") {
        ranking = calculateWP().ranking;
        methodTitle = "Weighted Product (WP)";
        scoreHeader = "Vektor V";
    } else if (method === "smart") {
        ranking = calculateSMART().ranking;
        methodTitle = "SMART (Simple Multi-Attribute Rating Technique)";
        scoreHeader = "Skor SMART";
    }
    
    // PDF Design Styles
    // Header banner (dark blue)
    doc.setFillColor(10, 15, 29);
    doc.rect(0, 0, 210, 38, 'F');
    
    // Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("LAPORAN HASIL PENILAIAN & RANKING SPK", 14, 15);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(0, 245, 212); // Accent cyan color
    doc.text(`Sistem Pendukung Keputusan Pemilihan Mobil Bekas - Metode ${methodTitle}`, 14, 21);
    
    // Date
    const today = new Date().toLocaleDateString('id-ID', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    doc.setTextColor(156, 163, 175);
    doc.setFontSize(9);
    doc.text(`Dicetak pada: ${today}`, 14, 32);
    
    // Academic Identity Card (Right side of header)
    doc.setFillColor(27, 38, 59);
    doc.roundedRect(140, 6, 58, 26, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("IDENTITAS MAHASISWA:", 143, 11);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Nama : ${studentName}`, 143, 15);
    doc.text(`NIM  : ${studentNIM}`, 143, 19);
    doc.text(`Kelas : ${studentClass}`, 143, 23);
    doc.text(`Tugas : SPK Pemilihan Mobil`, 143, 27);
    
    // Sub-header section
    doc.setTextColor(10, 15, 29);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("1. Bobot Kriteria Penilaian", 14, 48);
    
    // Write Criteria Table
    const criteriaData = getAllCriteria().map(c => [
        c.code,
        c.name,
        c.type.toUpperCase(),
        `${(c.weight * 100).toFixed(0)}% (${c.weight})`
    ]);
    
    doc.autoTable({
        startY: 52,
        head: [['Kode', 'Nama Kriteria', 'Sifat (Cost/Benefit)', 'Bobot Preferensi']],
        body: criteriaData,
        theme: 'striped',
        headStyles: { fillColor: [10, 15, 29], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 }
    });
    
    // Results section
    const currentY = doc.lastAutoTable.finalY + 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`2. Hasil Rekomendasi & Ranking Alternatif (${method.toUpperCase()})`, 14, currentY);
    
    // Prep Ranking Table Data
    const rankingTableData = ranking.map((item, index) => {
        // Find raw details
        const car = getCarById(item.id);
        return [
            index + 1,
            item.name,
            `$${car.price.toLocaleString()}`,
            `${car.engine.toLocaleString()} CC`,
            `${car.mileage.toLocaleString()} KM`,
            `${car.seats} Kursi`,
            item.score !== undefined ? item.score.toFixed(4) : item.v.toFixed(4)
        ];
    });
    
    doc.autoTable({
        startY: currentY + 4,
        head: [['Rank', 'Nama Alternatif Mobil', 'Harga (C1)', 'Kapasitas Mesin (C2)', 'Kilometer (C3)', 'Kapasitas Kursi (C4)', scoreHeader]],
        body: rankingTableData,
        theme: 'grid',
        headStyles: { fillColor: [58, 134, 255], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 }
    });
    
    // Summary Recommendation Box
    const finalY = doc.lastAutoTable.finalY + 12;
    doc.setFillColor(243, 244, 246);
    doc.roundedRect(14, finalY, 182, 28, 4, 4, 'F');
    
    doc.setTextColor(16, 185, 129); // green
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("REKOMENDASI TERBAIK:", 18, finalY + 8);
    
    const bestCar = ranking[0];
    const rawBestCar = getCarById(bestCar.id);
    doc.setTextColor(17, 24, 39);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const scoreVal = bestCar.score !== undefined ? bestCar.score.toFixed(4) : bestCar.v.toFixed(4);
    doc.text(`Berdasarkan perhitungan metode ${method.toUpperCase()}, alternatif terbaik jatuh kepada:`, 18, finalY + 14);
    doc.setFont("helvetica", "bold");
    doc.text(`${bestCar.name} (Skor Preferensi: ${scoreVal})`, 18, finalY + 20);
    
    // Add page number & academic footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.text(`Tugas Mandiri SPK - ${studentName} (${studentNIM})`, 14, 285);
        doc.text(`Halaman ${i} dari ${pageCount}`, 180, 285);
    }
    
    // Save PDF
    doc.save(`SPK_Rekomendasi_Mobil_Bekas_${method.toUpperCase()}_${studentNIM}.pdf`);
}

// Generate CSV string from active dataset
function exportToCSV() {
    const cars = getAllCars();
    if (cars.length === 0) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Nama Mobil,Harga,Kapasitas Mesin (CC),Kilometer,Kapasitas Tempat Duduk\n";
    
    cars.forEach(c => {
        csvContent += `"${c.name}",${c.price},${c.engine},${c.mileage},${c.seats}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dataset_mobil_bekas_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Import dataset from uploaded CSV file
function handleCSVImport(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const lines = text.split("\n");
        const cars = [];
        let importedCount = 0;
        
        // Skip header line (index 0)
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Basic CSV parser to handle quotes
            const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(",");
            if (matches.length >= 5) {
                const name = matches[0].replace(/"/g, "").trim();
                const price = parseFloat(matches[1]);
                const engine = parseInt(matches[2]);
                const mileage = parseInt(matches[3]);
                const seats = parseInt(matches[4]);
                
                if (name && !isNaN(price) && !isNaN(engine) && !isNaN(mileage) && !isNaN(seats)) {
                    cars.push({
                        name,
                        price,
                        engine,
                        mileage,
                        seats
                    });
                    importedCount++;
                }
            }
        }
        
        if (cars.length > 0) {
            // Retrieve existing and overwrite or append
            const existing = getAllCars();
            let nextId = existing.length > 0 ? Math.max(...existing.map(c => c.id)) + 1 : 1;
            
            cars.forEach(c => {
                c.id = nextId++;
                existing.push(c);
            });
            
            saveAllCars(existing);
            callback(true, importedCount);
        } else {
            callback(false, 0);
        }
    };
    reader.readAsText(file);
}
