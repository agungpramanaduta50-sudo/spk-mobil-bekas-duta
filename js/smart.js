/* 
   SPK Pemilihan Mobil Bekas - SMART (Simple Multi-Attribute Rating Technique) Module (js/smart.js)
   Performs the SMART calculations: Decision Matrix -> Utility Values -> Preference Score -> Ranking.
*/

function calculateSMART() {
    const cars = getAllCars();
    const criteria = getAllCriteria();
    
    if (cars.length === 0) return { matrix: [], utilities: [], scores: [], ranking: [] };
    
    // Find min and max for each criteria
    const prices = cars.map(c => c.price);
    const engines = cars.map(c => c.engine);
    const mileages = cars.map(c => c.mileage);
    const seats = cars.map(c => c.seats);
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const minEngine = Math.min(...engines);
    const maxEngine = Math.max(...engines);
    const minMileage = Math.min(...mileages);
    const maxMileage = Math.max(...mileages);
    const minSeats = Math.min(...seats);
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
    
    // Helper to calculate utility
    // Benefit: (x - min) / (max - min)
    // Cost: (max - x) / (max - min)
    function getUtility(val, min, max, type) {
        if (max === min) return 1.0;
        if (type === "benefit") {
            return (val - min) / (max - min);
        } else {
            return (max - val) / (max - min);
        }
    }
    
    // 2. Utility Matrix
    const utilities = cars.map(c => {
        const u1 = getUtility(c.price, minPrice, maxPrice, "cost");
        const u2 = getUtility(c.engine, minEngine, maxEngine, "benefit");
        const u3 = getUtility(c.mileage, minMileage, maxMileage, "cost");
        const u4 = getUtility(c.seats, minSeats, maxSeats, "benefit");
        
        return {
            id: c.id,
            name: c.name,
            u1: parseFloat(u1.toFixed(4)),
            u2: parseFloat(u2.toFixed(4)),
            u3: parseFloat(u3.toFixed(4)),
            u4: parseFloat(u4.toFixed(4))
        };
    });
    
    // Get Weights
    const w1 = criteria.find(cr => cr.code === "C1").weight;
    const w2 = criteria.find(cr => cr.code === "C2").weight;
    const w3 = criteria.find(cr => cr.code === "C3").weight;
    const w4 = criteria.find(cr => cr.code === "C4").weight;
    
    // 3. Weighting & Scoring
    const scores = utilities.map(u => {
        const score = (w1 * u.u1) + (w2 * u.u2) + (w3 * u.u3) + (w4 * u.u4);
        return {
            id: u.id,
            name: u.name,
            score: parseFloat(score.toFixed(4)),
            steps: `(${w1} × ${u.u1.toFixed(2)}) + (${w2} × ${u.u2.toFixed(2)}) + (${w3} × ${u.u3.toFixed(2)}) + (${w4} × ${u.u4.toFixed(2)})`
        };
    });
    
    // 4. Ranking
    // Sort in descending order
    const ranking = [...scores].sort((a, b) => b.score - a.score).map((item, index) => ({
        ...item,
        rank: index + 1
    }));
    
    return {
        minMax: {
            minPrice, maxPrice,
            minEngine, maxEngine,
            minMileage, maxMileage,
            minSeats, maxSeats
        },
        matrix,
        utilities,
        scores,
        ranking
    };
}
