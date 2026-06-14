/* 
   SPK Pemilihan Mobil Bekas - AHP (Simplified) Module (js/ahp.js)
   Uses existing criteria weights, processes raw data into priorities.
*/

function calculateAHP() {
    const cars = getAllCars();
    const criteria = getAllCriteria();
    
    if (cars.length === 0) return { matrix: [], normalized: [], scores: [], ranking: [] };
    
    const matrix = cars.map(c => ({
        id: c.id, name: c.name,
        c1: c.price, c2: c.engine, c3: c.mileage, c4: c.seats
    }));
    
    // Untuk Cost (C1, C3), kita ubah menjadi nilai kebalikannya (1/x) agar berbanding terbalik
    // Untuk Benefit (C2, C4), kita gunakan nilai aslinya
    const transformed = matrix.map(m => ({
        id: m.id, name: m.name,
        t1: 1 / m.c1,
        t2: m.c2,
        t3: 1 / m.c3,
        t4: m.c4
    }));
    
    // Jumlahkan tiap kolom
    let sumT1 = 0, sumT2 = 0, sumT3 = 0, sumT4 = 0;
    transformed.forEach(t => {
        sumT1 += t.t1;
        sumT2 += t.t2;
        sumT3 += t.t3;
        sumT4 += t.t4;
    });
    
    // Normalisasi (nilai dibagi total kolom)
    const normalized = transformed.map(t => ({
        id: t.id, name: t.name,
        r1: t.t1 / sumT1,
        r2: t.t2 / sumT2,
        r3: t.t3 / sumT3,
        r4: t.t4 / sumT4
    }));
    
    // Bobot (karena kita menganggap bobot existing sebagai hasil eigenvector kriteria AHP)
    const w1 = criteria.find(cr => cr.code === "C1").weight;
    const w2 = criteria.find(cr => cr.code === "C2").weight;
    const w3 = criteria.find(cr => cr.code === "C3").weight;
    const w4 = criteria.find(cr => cr.code === "C4").weight;
    
    // Menghitung Skor Akhir AHP (Perkalian normalisasi alternatif dengan bobot kriteria)
    const scores = normalized.map(n => {
        const score = (n.r1 * w1) + (n.r2 * w2) + (n.r3 * w3) + (n.r4 * w4);
        return {
            id: n.id, name: n.name,
            score: score
        };
    });
    
    // Ranking
    const ranking = [...scores].sort((a, b) => b.score - a.score).map((item, index) => ({
        ...item,
        rank: index + 1
    }));
    
    return {
        matrix,
        transformed,
        sums: { sumT1, sumT2, sumT3, sumT4 },
        normalized,
        scores,
        ranking
    };
}
