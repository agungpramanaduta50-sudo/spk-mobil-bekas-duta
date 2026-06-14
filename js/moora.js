/* 
   SPK Pemilihan Mobil Bekas - MOORA Module (js/moora.js)
*/

function calculateMOORA() {
    const cars = getAllCars();
    const criteria = getAllCriteria();
    
    if (cars.length === 0) return { matrix: [], normalized: [], weighted: [], scores: [], ranking: [] };
    
    const matrix = cars.map(c => ({
        id: c.id, name: c.name,
        c1: c.price, c2: c.engine, c3: c.mileage, c4: c.seats
    }));
    
    // Pembagi normalisasi MOORA = akar dari jumlah kuadrat per kolom
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
    
    // Matriks Ternormalisasi
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
    
    // Matriks Ternormalisasi Terbobot
    const weighted = normalized.map(n => ({
        id: n.id, name: n.name,
        y1: n.r1 * w1,
        y2: n.r2 * w2,
        y3: n.r3 * w3,
        y4: n.r4 * w4
    }));
    
    // Nilai Optimasi Y = Benefit - Cost
    // Benefit: C2, C4 | Cost: C1, C3
    const scores = weighted.map(w => {
        const benefit = w.y2 + w.y4;
        const cost = w.y1 + w.y3;
        const score = benefit - cost; // Y value
        
        return {
            id: w.id, name: w.name,
            benefit, cost, score
        };
    });
    
    // Ranking
    const ranking = [...scores].sort((a, b) => b.score - a.score).map((item, index) => ({
        ...item,
        rank: index + 1
    }));
    
    return {
        matrix,
        divisors: { divC1, divC2, divC3, divC4 },
        normalized,
        weighted,
        scores,
        ranking
    };
}
