/* 
   SPK Pemilihan Mobil Bekas - Data Visualization Module (js/charts.js)
   Renders and updates interactive ApexCharts for the Tableau-like dashboard.
*/

let charts = {
    engineChart: null,
    priceBubbleChart: null,
    seatsTreemap: null,
    mileageChart: null,
    radarComparisonChart: null
};

// Global Chart Options helper
function getDarkThemeChartConfig() {
    return {
        theme: {
            mode: 'dark',
            palette: 'palette1'
        },
        chart: {
            background: 'transparent',
            foreColor: '#9CA3AF',
            fontFamily: 'Inter, sans-serif',
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    selection: false,
                    zoom: false,
                    zoomin: false,
                    zoomout: false,
                    pan: false,
                    reset: false
                }
            }
        },
        grid: {
            borderColor: 'rgba(255, 255, 255, 0.08)'
        },
        tooltip: {
            theme: 'dark',
            x: { show: true },
            style: {
                fontSize: '12px',
                fontFamily: 'Inter, sans-serif'
            }
        }
    };
}

// Render or Update All Charts
function renderAllCharts() {
    const cars = getAllCars();
    
    if (cars.length === 0) return;
    
    const carNames = cars.map(c => c.name);
    const engineCapacities = cars.map(c => c.engine);
    const prices = cars.map(c => c.price);
    const mileages = cars.map(c => c.mileage);
    const seatsList = cars.map(c => c.seats);
    
    // --- 1. BAR CHART: KAPASITAS MESIN (CC) ---
    const engineOptions = {
        ...getDarkThemeChartConfig(),
        chart: {
            ...getDarkThemeChartConfig().chart,
            type: 'bar',
            height: 320
        },
        series: [{
            name: 'Kapasitas Mesin (CC)',
            data: engineCapacities
        }],
        colors: ['#00F5D4'],
        plotOptions: {
            bar: {
                borderRadius: 6,
                columnWidth: '45%',
                distributed: true,
                dataLabels: { position: 'top' }
            }
        },
        dataLabels: {
            enabled: true,
            formatter: function (val) { return val + " CC"; },
            offsetY: -20,
            style: {
                fontSize: '11px',
                colors: ["#FFFFFF"]
            }
        },
        xaxis: {
            categories: carNames,
            labels: { rotate: -45, style: { fontSize: '10px' } }
        },
        yaxis: {
            title: { text: 'Engine Capacity (CC)' }
        }
    };
    
    if (charts.engineChart) {
        charts.engineChart.updateOptions(engineOptions);
    } else {
        charts.engineChart = new ApexCharts(document.querySelector("#chart-engine"), engineOptions);
        charts.engineChart.render();
    }
    
    // --- 2. BUBBLE CHART: HARGA VS KILOMETER VS KAPASITAS MESIN ---
    // X = Harga, Y = Kilometer, Z = Kapasitas Mesin (CC) / 50 (for size scaling)
    const bubbleData = cars.map(c => ({
        name: c.name,
        data: [[c.price, c.mileage, Math.round(c.engine / 100) * 1.5]] // scale Z for bubble size
    }));
    
    const bubbleOptions = {
        ...getDarkThemeChartConfig(),
        chart: {
            ...getDarkThemeChartConfig().chart,
            type: 'bubble',
            height: 320
        },
        series: bubbleData,
        colors: ['#3A86FF', '#00F5D4', '#8338EC', '#FFB703', '#10B981', '#EF4444', '#06B6D4', '#F59E0B'],
        xaxis: {
            title: { text: 'Harga ($)' },
            labels: {
                formatter: function (val) {
                    return '$' + val.toLocaleString();
                }
            }
        },
        yaxis: {
            title: { text: 'Kilometer (KM)' },
            labels: {
                formatter: function (val) {
                    return val.toLocaleString() + ' KM';
                }
            }
        },
        tooltip: {
            ...getDarkThemeChartConfig().tooltip,
            custom: function({series, seriesIndex, dataPointIndex, w}) {
                const car = cars[seriesIndex];
                return `<div class="p-3" style="background: #111827; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;">` +
                    `<h6 style="color: #FFF; margin-bottom: 6px;">${car.name}</h6>` +
                    `<div><strong>Harga:</strong> $${car.price.toLocaleString()}</div>` +
                    `<div><strong>Kilometer:</strong> ${car.mileage.toLocaleString()} KM</div>` +
                    `<div><strong>Kapasitas Mesin:</strong> ${car.engine} CC</div>` +
                    `</div>`;
            }
        }
    };
    
    if (charts.priceBubbleChart) {
        charts.priceBubbleChart.updateOptions(bubbleOptions);
    } else {
        charts.priceBubbleChart = new ApexCharts(document.querySelector("#chart-price-bubble"), bubbleOptions);
        charts.priceBubbleChart.render();
    }
    
    // --- 3. TREEMAP: KAPASITAS TEMPAT DUDUK ---
    const treemapData = cars.map(c => ({
        x: `${c.name} (${c.seats} Kursi)`,
        y: c.seats
    }));
    
    const treemapOptions = {
        ...getDarkThemeChartConfig(),
        chart: {
            ...getDarkThemeChartConfig().chart,
            type: 'treemap',
            height: 320
        },
        series: [{
            data: treemapData
        }],
        colors: ['#8338EC'],
        plotOptions: {
            treemap: {
                distributed: true,
                enableShades: true
            }
        },
        title: {
            text: 'Jumlah Kursi Penumpang',
            align: 'center',
            style: { color: '#FFF' }
        }
    };
    
    if (charts.seatsTreemap) {
        charts.seatsTreemap.updateOptions(treemapOptions);
    } else {
        charts.seatsTreemap = new ApexCharts(document.querySelector("#chart-seats-treemap"), treemapOptions);
        charts.seatsTreemap.render();
    }
    
    // --- 4. HORIZONTAL BAR CHART: KILOMETER ---
    const mileageOptions = {
        ...getDarkThemeChartConfig(),
        chart: {
            ...getDarkThemeChartConfig().chart,
            type: 'bar',
            height: 320
        },
        series: [{
            name: 'Kilometer',
            data: mileages
        }],
        colors: ['#FFB703'],
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: true,
                barHeight: '60%',
                distributed: true
            }
        },
        xaxis: {
            categories: carNames,
            title: { text: 'Mileage (KM)' }
        },
        yaxis: {
            labels: { style: { fontSize: '10px' } }
        }
    };
    
    if (charts.mileageChart) {
        charts.mileageChart.updateOptions(mileageOptions);
    } else {
        charts.mileageChart = new ApexCharts(document.querySelector("#chart-mileage"), mileageOptions);
        charts.mileageChart.render();
    }
    
    // --- 5. RADAR CHART: PERBANDINGAN METODE (SAW, WP, SMART, TOPSIS, MOORA, AHP, PM) ---
    // Renders scores normalized to a 0-100 scale for comparison
    const resSAW = calculateSAW().ranking;
    const resWP = calculateWP().ranking;
    const resSMART = calculateSMART().ranking;
    const resTOPSIS = calculateTOPSIS().ranking;
    const resMOORA = calculateMOORA().ranking;
    const resAHP = calculateAHP().ranking;
    const resPM = calculateProfileMatching().ranking;
    
    // Limit to top 5 cars by SAW for visual legibility
    const topCars = resSAW.slice(0, 5).map(c => c.name);
    
    const radarSAWData = [];
    const radarWPData = [];
    const radarSMARTData = [];
    const radarTOPSISData = [];
    const radarMOORAData = [];
    const radarAHPData = [];
    const radarPMData = [];
    
    topCars.forEach(name => {
        // SAW
        const carSaw = resSAW.find(c => c.name === name);
        radarSAWData.push(carSaw ? Math.round(carSaw.score * 100) : 0);
        
        // WP
        const carWp = resWP.find(c => c.name === name);
        radarWPData.push(carWp ? Math.round(carWp.v * 100 * 3) : 0); // Scale WP preferences for visual parity
        
        // SMART
        const carSmart = resSMART.find(c => c.name === name);
        radarSMARTData.push(carSmart ? Math.round(carSmart.score * 100) : 0);

        // TOPSIS
        const carTopsis = resTOPSIS.find(c => c.name === name);
        radarTOPSISData.push(carTopsis ? Math.round(carTopsis.score * 100) : 0);
        
        // MOORA
        const carMoora = resMOORA.find(c => c.name === name);
        radarMOORAData.push(carMoora ? Math.round(carMoora.score * 1000) : 0);
        
        // AHP
        const carAhp = resAHP.find(c => c.name === name);
        radarAHPData.push(carAhp ? Math.round(carAhp.score * 200) : 0);
        
        // Profile Matching
        const carPm = resPM.find(c => c.name === name);
        radarPMData.push(carPm ? Math.round(carPm.score * 20) : 0); // Scale PM (max usually around ~5) to 100
    });
    
    const radarOptions = {
        ...getDarkThemeChartConfig(),
        chart: {
            ...getDarkThemeChartConfig().chart,
            type: 'radar',
            height: 350
        },
        series: [
            { name: 'SAW (Skor × 100)', data: radarSAWData },
            { name: 'WP (Skor × 300)', data: radarWPData },
            { name: 'SMART (Skor × 100)', data: radarSMARTData },
            { name: 'TOPSIS (Skor × 100)', data: radarTOPSISData },
            { name: 'MOORA (Skor × 1000)', data: radarMOORAData },
            { name: 'AHP (Skor × 200)', data: radarAHPData },
            { name: 'PM (Skor × 20)', data: radarPMData }
        ],
        colors: ['#00F5D4', '#3A86FF', '#8338EC', '#EF4444', '#10B981', '#F59E0B', '#EC4899'],
        stroke: { width: 2 },
        fill: { opacity: 0.15 },
        markers: { size: 4 },
        xaxis: {
            categories: topCars,
            labels: {
                style: {
                    colors: ['#FFF', '#FFF', '#FFF', '#FFF', '#FFF'],
                    fontSize: '11px'
                }
            }
        },
        yaxis: {
            show: false
        }
    };
    
    if (charts.radarComparisonChart) {
        charts.radarComparisonChart.updateOptions(radarOptions);
    } else {
        charts.radarComparisonChart = new ApexCharts(document.querySelector("#chart-radar-comparison"), radarOptions);
        charts.radarComparisonChart.render();
    }
}
