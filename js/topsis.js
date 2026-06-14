/* 
   SPK Pemilihan Mobil Bekas - TOPSIS Module (js/topsis.js)
*/

function calculateTOPSIS() {
    const cars = getAllCars();
    const criteria = getAllCriteria();
    
    if (cars.length === 0) return { matrix: [], normalized: [], weighted: [], idealSolutions: null, distances: [], ranking: [] };
    
    // 1. Matriks Keputusan
    const matrix = cars.map(c => ({
        id: c.id, name: c.name,
        c1: c.price, c2: c.engine, c3: c.mileage, c4: c.seats
    }));
    
    // Pembagi untuk normalisasi (akar dari jumlah kuadrat)
    let sumSqC1 = 0, sumSqC2 = 0, sumSqC3 = 0, sumSqC4 = 0;
    cars.forEach(c => {
        sumSqC1 += Math.pow(c.price, 2);
        sumSqC2 += Math.pow(c.engine, 2);
        sumSqC3 += Math.pow(c.mileage, 2);
        sumSqC4 += Math.pow(c.seats, 2);
    });
    
    const divC1 = Math.sqrt(sumSqC1);
    const divC2 = Math.sqrt(sumSqC2);
    const divC3 = Math.sqrt(sumSqC3);
    const divC4 = Math.sqrt(sumSqC4);
    
    // 2. Matriks Keputusan Ternormalisasi
    const normalized = cars.map(c => ({
        id: c.id, name: c.name,
        r1: c.price / divC1,
        r2: c.engine / divC2,
        r3: c.mileage / divC3,
        r4: c.seats / divC4
    }));
    
    // Bobot
    const w1 = criteria.find(cr => cr.code === "C1").weight;
    const w2 = criteria.find(cr => cr.code === "C2").weight;
    const w3 = criteria.find(cr => cr.code === "C3").weight;
    const w4 = criteria.find(cr => cr.code === "C4").weight;
    
    // 3. Matriks Keputusan Ternormalisasi Terbobot
    const weighted = normalized.map(n => ({
        id: n.id, name: n.name,
        y1: n.r1 * w1,
        y2: n.r2 * w2,
        y3: n.r3 * w3,
        y4: n.r4 * w4
    }));
    
    // 4. Solusi Ideal Positif (A+) dan Negatif (A-)
    // C1 Cost, C2 Benefit, C3 Cost, C4 Benefit
    const y1Values = weighted.map(w => w.y1);
    const y2Values = weighted.map(w => w.y2);
    const y3Values = weighted.map(w => w.y3);
    const y4Values = weighted.map(w => w.y4);
    
    const idealSolutions = {
        ap: { // Ideal Positif
            y1: Math.min(...y1Values), // Cost -> Min
            y2: Math.max(...y2Values), // Benefit -> Max
            y3: Math.min(...y3Values), // Cost -> Min
            y4: Math.max(...y4Values)  // Benefit -> Max
        },
        am: { // Ideal Negatif
            y1: Math.max(...y1Values), // Cost -> Max
            y2: Math.min(...y2Values), // Benefit -> Min
            y3: Math.max(...y3Values), // Cost -> Max
            y4: Math.min(...y4Values)  // Benefit -> Min
        }
    };
    
    // 5 & 6. Jarak ke Ideal Positif/Negatif dan Nilai Preferensi
    const distances = weighted.map(w => {
        const dPlus = Math.sqrt(
            Math.pow(w.y1 - idealSolutions.ap.y1, 2) +
            Math.pow(w.y2 - idealSolutions.ap.y2, 2) +
            Math.pow(w.y3 - idealSolutions.ap.y3, 2) +
            Math.pow(w.y4 - idealSolutions.ap.y4, 2)
        );
        
        const dMinus = Math.sqrt(
            Math.pow(w.y1 - idealSolutions.am.y1, 2) +
            Math.pow(w.y2 - idealSolutions.am.y2, 2) +
            Math.pow(w.y3 - idealSolutions.am.y3, 2) +
            Math.pow(w.y4 - idealSolutions.am.y4, 2)
        );
        
        const v = dMinus / (dPlus + dMinus);
        
        return {
            id: w.id, name: w.name,
            dPlus: dPlus,
            dMinus: dMinus,
            score: v // preference value
        };
    });
    
    // 7. Ranking
    const ranking = [...distances].sort((a, b) => b.score - a.score).map((item, index) => ({
        ...item,
        rank: index + 1
    }));
    
    return {
        matrix,
        divisors: { divC1, divC2, divC3, divC4 },
        normalized,
        weighted,
        idealSolutions,
        distances,
        ranking
    };
}
