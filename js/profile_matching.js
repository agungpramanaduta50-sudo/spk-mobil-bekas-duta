/*
   SPK Pemilihan Mobil Bekas - Profile Matching Method (Modified with standard weights)
*/

function calculateProfileMatching() {
    const cars = getAllCars();
    const criteria = getAllCriteria();
    
    if (cars.length === 0) return { scaled: [], gaps: [], weights: [], factors: [], ranking: [] };

    const targetProfile = { c1: 5, c2: 5, c3: 5, c4: 5 };

    // 1. Pemetaan ke Skala 1-5
    const scaled = cars.map(c => {
        let sc1, sc2, sc3, sc4;
        
        // C1: Harga (Cost)
        if (c.price < 30000) sc1 = 5;
        else if (c.price <= 45000) sc1 = 4;
        else if (c.price <= 60000) sc1 = 3;
        else sc1 = 2;

        // C2: Kapasitas Mesin (Benefit)
        if (c.engine > 2000) sc2 = 5;
        else if (c.engine >= 1500) sc2 = 4;
        else sc2 = 3;

        // C3: Kilometer (Cost)
        if (c.mileage < 50000) sc3 = 5;
        else if (c.mileage <= 100000) sc3 = 4;
        else sc3 = 3;

        // C4: Kursi (Benefit)
        if (c.seats > 6) sc4 = 5;
        else if (c.seats >= 5) sc4 = 4;
        else sc4 = 3;

        return { id: c.id, name: c.name, s1: sc1, s2: sc2, s3: sc3, s4: sc4 };
    });

    // 2. Perhitungan Gap (Alternatif - Target)
    const gaps = scaled.map(s => {
        return {
            id: s.id, name: s.name,
            g1: s.s1 - targetProfile.c1,
            g2: s.s2 - targetProfile.c2,
            g3: s.s3 - targetProfile.c3,
            g4: s.s4 - targetProfile.c4
        };
    });

    // 3. Konversi Nilai Gap menjadi Bobot
    const getGapWeight = (gap) => {
        const weights = {
            0: 5,
            1: 4.5,
            '-1': 4,
            2: 3.5,
            '-2': 3,
            3: 2.5,
            '-3': 2,
            4: 1.5,
            '-4': 1
        };
        return weights[String(gap)] || 1;
    };

    const weights = gaps.map(g => {
        return {
            id: g.id, name: g.name,
            w1: getGapWeight(g.g1),
            w2: getGapWeight(g.g2),
            w3: getGapWeight(g.g3),
            w4: getGapWeight(g.g4)
        };
    });

    // 4. Perhitungan Nilai Akhir (Menggunakan bobot kriteria yang sama dengan SAW, WP, dll)
    const w1 = criteria.find(cr => cr.code === "C1").weight;
    const w2 = criteria.find(cr => cr.code === "C2").weight;
    const w3 = criteria.find(cr => cr.code === "C3").weight;
    const w4 = criteria.find(cr => cr.code === "C4").weight;

    const factors = weights.map(w => {
        const total = (w1 * w.w1) + (w2 * w.w2) + (w3 * w.w3) + (w4 * w.w4);
        return {
            id: w.id, name: w.name,
            score_c1: w1 * w.w1,
            score_c2: w2 * w.w2,
            score_c3: w3 * w.w3,
            score_c4: w4 * w.w4,
            total: total
        };
    });

    // 5. Perangkingan
    let ranking = [...factors].sort((a, b) => b.total - a.total);
    ranking = ranking.map((r, index) => ({
        rank: index + 1,
        id: r.id,
        name: r.name,
        score: r.total
    }));

    return {
        scaled,
        gaps,
        weights,
        factors,
        ranking
    };
}
