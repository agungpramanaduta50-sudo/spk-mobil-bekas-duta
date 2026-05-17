/* 
   SPK Pemilihan Mobil Bekas - Data Management Module (js/data.js)
   Handles CRUD operations in localStorage, dataset imports, and filtering/sorting.
   Dataset matches the handwritten notes of Duta Agung Pramana (NIM: 231011400036).
*/

const SAMPLE_CARS = [
    { id: 1, name: "Ford Courier", price: 24000, engine: 2200, mileage: 95000, seats: 2 },
    { id: 2, name: "Ford Fairlane", price: 45000, engine: 2500, mileage: 150000, seats: 5 },
    { id: 3, name: "Honda Accord", price: 60000, engine: 2000, mileage: 120000, seats: 5 },
    { id: 4, name: "Toyota Avanza", price: 35000, engine: 1500, mileage: 50000, seats: 7 }
];

const DEFAULT_CRITERIA = [
    { code: "C1", name: "Harga", type: "cost", weight: 0.35 },
    { code: "C2", name: "Kapasitas Mesin (CC)", type: "benefit", weight: 0.30 },
    { code: "C3", name: "Kilometer", type: "cost", weight: 0.25 },
    { code: "C4", name: "Kapasitas Tempat Duduk", type: "benefit", weight: 0.10 }
];

// Initialize Data Store
function initDataStore() {
    if (!localStorage.getItem("spk_cars")) {
        localStorage.setItem("spk_cars", JSON.stringify(SAMPLE_CARS));
    }
    if (!localStorage.getItem("spk_criteria")) {
        localStorage.setItem("spk_criteria", JSON.stringify(DEFAULT_CRITERIA));
    }
}

// Get All Cars
function getAllCars() {
    initDataStore();
    return JSON.parse(localStorage.getItem("spk_cars"));
}

// Save All Cars
function saveAllCars(cars) {
    localStorage.setItem("spk_cars", JSON.stringify(cars));
}

// Get Car by ID
function getCarById(id) {
    const cars = getAllCars();
    return cars.find(c => c.id === parseInt(id));
}

// Add New Car
function addCar(carData) {
    const cars = getAllCars();
    const newId = cars.length > 0 ? Math.max(...cars.map(c => c.id)) + 1 : 1;
    
    const newCar = {
        id: newId,
        name: carData.name,
        price: parseFloat(carData.price),
        engine: parseInt(carData.engine),
        mileage: parseInt(carData.mileage),
        seats: parseInt(carData.seats)
    };
    
    cars.push(newCar);
    saveAllCars(cars);
    return newCar;
}

// Update Car
function updateCar(id, carData) {
    const cars = getAllCars();
    const index = cars.findIndex(c => c.id === parseInt(id));
    
    if (index !== -1) {
        cars[index] = {
            id: parseInt(id),
            name: carData.name,
            price: parseFloat(carData.price),
            engine: parseInt(carData.engine),
            mileage: parseInt(carData.mileage),
            seats: parseInt(carData.seats)
        };
        saveAllCars(cars);
        return cars[index];
    }
    return null;
}

// Delete Car
function deleteCar(id) {
    const cars = getAllCars();
    const filtered = cars.filter(c => c.id !== parseInt(id));
    
    if (cars.length !== filtered.length) {
        saveAllCars(filtered);
        return true;
    }
    return false;
}

// Reset Data to Default
function resetDataToDefault() {
    localStorage.setItem("spk_cars", JSON.stringify(SAMPLE_CARS));
    localStorage.setItem("spk_criteria", JSON.stringify(DEFAULT_CRITERIA));
    return true;
}

// Get Criteria
function getAllCriteria() {
    initDataStore();
    return JSON.parse(localStorage.getItem("spk_criteria"));
}

// Save Criteria
function saveCriteria(criteria) {
    localStorage.setItem("spk_criteria", JSON.stringify(criteria));
}

// Helper to calculate statistics
function getStatistics() {
    const cars = getAllCars();
    if (cars.length === 0) {
        return { count: 0, avgPrice: 0, maxEngine: 0, avgMileage: 0 };
    }
    
    const count = cars.length;
    const totalPrice = cars.reduce((sum, c) => sum + c.price, 0);
    const avgPrice = totalPrice / count;
    
    const engines = cars.map(c => c.engine);
    const maxEngine = Math.max(...engines);
    
    const totalMileage = cars.reduce((sum, c) => sum + c.mileage, 0);
    const avgMileage = totalMileage / count;
    
    return {
        count,
        avgPrice,
        maxEngine,
        avgMileage
    };
}
