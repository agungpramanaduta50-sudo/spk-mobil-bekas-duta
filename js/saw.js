/* 
   SPK Pemilihan Mobil Bekas - Simple Additive Weighting (SAW) Module (js/saw.js)
   Performs the SAW calculations: Decision Matrix -> Normalization -> Preference -> Ranking.
*/

function calculateSAW() {
    const cars = getAllCars();
    const criteria = getAllCriteria();
    
    if (cars.length === 0) return { matrix: [], normalized: [], weighted: [], scores: [], ranking: [] };
    
    // Find min and max for each criteria
    const prices = cars.map(c => c.price);
    const engines = cars.map(c => c.engine);
    const mileages = cars.map(c => c.mileage);
    const seats = cars.map(c => c.seats);
    
    const minPrice = Math.min(...prices);
    const maxEngine = Math.max(...engines);
    const minMileage = Math.min(...mileages);
    const maxSeats = Math.max(...seats);
    
    // 1. Decision Matrix
    const matrix = cars.map(c => ({
        id: c.id,
        name: c.name,
        c1: c.price,
        c2: c.engine,
        c3: c.mileage,
        c4: c.seats
    }));
    
    // 2. Normalization
    const normalized = cars.map(c => {
        // C1 Cost: min / value
        const r1 = minPrice / c.price;
        // C2 Benefit: value / max
        const r2 = c.engine / maxEngine;
        // C3 Cost: min / value
        const r3 = minMileage / c.mileage;
        // C4 Benefit: value / max
        const r4 = c.seats / maxSeats;
        
        return {
            id: c.id,
            name: c.name,
            r1: parseFloat(r1.toFixed(4)),
            r2: parseFloat(r2.toFixed(4)),
            r3: parseFloat(r3.toFixed(4)),
            r4: parseFloat(r4.toFixed(4)),
            // rounded versions to exactly match user's handwriting where needed
            r1_rounded: parseFloat(r1.toFixed(2)),
            r2_rounded: parseFloat(r2.toFixed(2)),
            r3_rounded: parseFloat(r3.toFixed(2)),
            r4_rounded: parseFloat(r4.toFixed(2))
        };
    });
    
    // Get Weights
    const w1 = criteria.find(cr => cr.code === "C1").weight;
    const w2 = criteria.find(cr => cr.code === "C2").weight;
    const w3 = criteria.find(cr => cr.code === "C3").weight;
    const w4 = criteria.find(cr => cr.code === "C4").weight;
    
    // 3. Weighting & Scoring
    const scores = normalized.map(n => {
        // Use 4 decimal places for accurate computation, but also prepare a rounded calculation to match user manual step
        const score = (w1 * n.r1) + (w2 * n.r2) + (w3 * n.r3) + (w4 * n.r4);
        
        // Manual calculation path to check/display the user's hand-written math exactly:
        // A1: (0.35 * 1.00) + (0.30 * 0.88) + (0.25 * 0.53) + (0.10 * 0.29) = 0.7755
        const manualScore = (w1 * n.r1_rounded) + (w2 * n.r2_rounded) + (w3 * n.r3_rounded) + (w4 * n.r4_rounded);
        
        return {
            id: n.id,
            name: n.name,
            score: parseFloat(score.toFixed(4)),
            manualScore: parseFloat(manualScore.toFixed(4)),
            steps: `(${w1} × ${n.r1.toFixed(2)}) + (${w2} × ${n.r2.toFixed(2)}) + (${w3} × ${n.r3.toFixed(2)}) + (${w4} × ${n.r4.toFixed(2)})`
        };
    });
    
    // 4. Ranking
    // Sort in descending order
    const ranking = [...scores].sort((a, b) => b.score - a.score).map((item, index) => ({
        ...item,
        rank: index + 1
    }));
    
    return {
        minMax: { minPrice, maxEngine, minMileage, maxSeats },
        weights: { w1, w2, w3, w4 },
        matrix,
        normalized,
        scores,
        ranking
    };
}
