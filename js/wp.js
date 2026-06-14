/* 
   SPK Pemilihan Mobil Bekas - Weighted Product (WP) Module (js/wp.js)
   Performs the WP calculations: Decision Matrix -> Vector S -> Vector V -> Ranking.
*/

function calculateWP() {
    const cars = getAllCars();
    const criteria = getAllCriteria();
    
    if (cars.length === 0) return { matrix: [], vectorS: [], vectorV: [], ranking: [] };
    
    // Get Weights
    let w1 = criteria.find(cr => cr.code === "C1").weight;
    let w2 = criteria.find(cr => cr.code === "C2").weight;
    let w3 = criteria.find(cr => cr.code === "C3").weight;
    let w4 = criteria.find(cr => cr.code === "C4").weight;
    
    // Normalize weights if their sum is not exactly 1 (to be robust)
    const sumW = w1 + w2 + w3 + w4;
    w1 = w1 / sumW;
    w2 = w2 / sumW;
    w3 = w3 / sumW;
    w4 = w4 / sumW;
    
    // Adjust exponents: negative for Cost, positive for Benefit
    const exp1 = -w1;
    const exp2 = w2;
    const exp3 = -w3;
    const exp4 = w4;
    
    // 1. Decision Matrix
    const matrix = cars.map(c => ({
        id: c.id,
        name: c.name,
        c1: c.price,
        c2: c.engine,
        c3: c.mileage,
        c4: c.seats
    }));
    
    // 2. Calculate Vector S
    const vectorS = cars.map(c => {
        const s1 = Math.pow(c.price, exp1);
        const s2 = Math.pow(c.engine, exp2);
        const s3 = Math.pow(c.mileage, exp3);
        const s4 = Math.pow(c.seats, exp4);
        
        const s = s1 * s2 * s3 * s4;
        
        return {
            id: c.id,
            name: c.name,
            s1: s1,
            s2: s2,
            s3: s3,
            s4: s4,
            s: s,
            steps: `(${c.price}^${exp1.toFixed(2)}) × (${c.engine}^${exp2.toFixed(2)}) × (${c.mileage}^${exp3.toFixed(2)}) × (${c.seats}^${exp4.toFixed(2)})`
        };
    });
    
    // 3. Sum of all S
    const sumS = vectorS.reduce((sum, item) => sum + item.s, 0);
    
    // 4. Calculate Vector V
    const vectorV = vectorS.map(item => {
        const v = sumS > 0 ? item.s / sumS : 0;
        return {
            id: item.id,
            name: item.name,
            s: item.s,
            v: parseFloat(v.toFixed(4)),
            steps: `${item.s.toFixed(8)} / ${sumS.toFixed(8)}`
        };
    });
    
    // 5. Ranking
    // Sort in descending order of V
    const ranking = [...vectorV].sort((a, b) => b.v - a.v).map((item, index) => ({
        ...item,
        rank: index + 1
    }));
    
    return {
        normalizedWeights: { w1, w2, w3, w4 },
        exponents: { exp1, exp2, exp3, exp4 },
        matrix,
        vectorS,
        sumS,
        vectorV,
        ranking
    };
}
