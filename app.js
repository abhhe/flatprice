// Model Parameters from training on House_Prices_Missing_Data.xlsx
const MODEL = {
    intercept: 17.517179696549718,
    coefficients: {
        size: 0.059360584525403645,
        bedrooms: 8.343920858449533,
        age: -0.5692595145456223,
        distance: -1.1834155732759923,
        income: 0.198874976737617
    },
    means: {
        size: 1741.7,
        bedrooms: 3.0434782608695654,
        age: 16.511363636363637,
        distance: 11.27191011235955,
        income: 85.72826086956522
    }
};

// exchange rate: 1 Lakh INR is 100,000 INR. 
// Assuming 1 USD = 83.5 INR, 1 Lakh INR = 100,000 / 83.5 ≈ 1197.6 USD
const INR_LAKH_TO_USD = 1197.6; 

// DOM Elements
const elements = {
    // Inputs (Sliders)
    sliderSize: document.getElementById('input-size'),
    sliderAge: document.getElementById('input-age'),
    sliderDistance: document.getElementById('input-distance'),
    sliderIncome: document.getElementById('input-income'),

    // Inputs (Numbers)
    numSize: document.getElementById('num-size'),
    numAge: document.getElementById('num-age'),
    numDistance: document.getElementById('num-distance'),
    numIncome: document.getElementById('num-income'),

    // Bedrooms
    inputBedrooms: document.getElementById('input-bedrooms'),
    bedroomBtnGroup: document.getElementById('bedroom-btn-group'),
    bedroomButtons: document.querySelectorAll('.btn-bed'),

    // Reset Button
    btnReset: document.getElementById('btn-reset'),

    // Output displays
    priceValue: document.getElementById('price-value'),
    priceUsd: document.getElementById('price-usd'),

    // Contribution bars
    barIntercept: document.getElementById('bar-intercept'),
    barSize: document.getElementById('bar-size'),
    barBedrooms: document.getElementById('bar-bedrooms'),
    barAge: document.getElementById('bar-age'),
    barDistance: document.getElementById('bar-distance'),
    barIncome: document.getElementById('bar-income'),

    // Contribution values text
    valIntercept: document.getElementById('val-intercept'),
    valSize: document.getElementById('val-size'),
    valBedrooms: document.getElementById('val-bedrooms'),
    valAge: document.getElementById('val-age'),
    valDistance: document.getElementById('val-distance'),
    valIncome: document.getElementById('val-income')
};

// Current App State
let previousPrice = 0;
let animationFrameId = null;

// Initialize Event Listeners
function init() {
    // Synchronize size slider and input
    setupInputSync(elements.sliderSize, elements.numSize);
    setupInputSync(elements.sliderAge, elements.numAge);
    setupInputSync(elements.sliderDistance, elements.numDistance);
    setupInputSync(elements.sliderIncome, elements.numIncome);

    // Setup bedroom buttons
    elements.bedroomButtons.forEach(button => {
        button.addEventListener('click', () => {
            elements.bedroomButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            elements.inputBedrooms.value = button.getAttribute('data-val');
            updateValuation();
        });
    });

    // Reset button
    elements.btnReset.addEventListener('click', resetToMeans);

    // Initial calculation
    updateValuation(true);
}

// Sync slider and numerical input box
function setupInputSync(slider, numberInput) {
    // Slider moved
    slider.addEventListener('input', () => {
        numberInput.value = slider.value;
        updateValuation();
    });

    // Number input typed
    numberInput.addEventListener('change', () => {
        let val = parseFloat(numberInput.value);
        const min = parseFloat(numberInput.min);
        const max = parseFloat(numberInput.max);

        // Validation
        if (isNaN(val)) {
            val = parseFloat(slider.value);
        } else if (val < min) {
            val = min;
        } else if (val > max) {
            val = max;
        }

        numberInput.value = val;
        slider.value = val;
        updateValuation();
    });
}

// Reset values to their dataset averages
function resetToMeans() {
    // Reset inputs
    elements.sliderSize.value = Math.round(MODEL.means.size);
    elements.numSize.value = Math.round(MODEL.means.size);

    elements.sliderAge.value = Math.round(MODEL.means.age);
    elements.numAge.value = Math.round(MODEL.means.age);

    elements.sliderDistance.value = MODEL.means.distance.toFixed(1);
    elements.numDistance.value = MODEL.means.distance.toFixed(1);

    elements.sliderIncome.value = Math.round(MODEL.means.income);
    elements.numIncome.value = Math.round(MODEL.means.income);

    // Reset Bedrooms
    const defaultBeds = Math.round(MODEL.means.bedrooms);
    elements.inputBedrooms.value = defaultBeds;
    elements.bedroomButtons.forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.getAttribute('data-val')) === defaultBeds) {
            btn.classList.add('active');
        }
    });

    updateValuation();
}

// Calculate the Linear Regression valuation and update UI
function updateValuation(isFirstLoad = false) {
    // Gather feature inputs
    const size = parseFloat(elements.numSize.value);
    const bedrooms = parseInt(elements.inputBedrooms.value);
    const age = parseFloat(elements.numAge.value);
    const distance = parseFloat(elements.numDistance.value);
    const income = parseFloat(elements.numIncome.value);

    // Compute contributions
    const contrib = {
        intercept: MODEL.intercept,
        size: size * MODEL.coefficients.size,
        bedrooms: bedrooms * MODEL.coefficients.bedrooms,
        age: age * MODEL.coefficients.age,
        distance: distance * MODEL.coefficients.distance,
        income: income * MODEL.coefficients.income
    };

    // Calculate final price (Lakhs)
    const finalPrice = contrib.intercept + contrib.size + contrib.bedrooms + contrib.age + contrib.distance + contrib.income;

    // Display predictions
    animatePriceDisplay(finalPrice, isFirstLoad ? 0 : previousPrice);
    previousPrice = finalPrice;

    // Update contribution breakdown bars
    updateBreakdownBars(contrib);
}

// Animate numerical transition for a premium feel
function animatePriceDisplay(targetVal, startVal) {
    const duration = 400; // ms
    const startTime = performance.now();

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }

    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function: easeOutQuad
        const easeProgress = progress * (2 - progress);
        
        const currentVal = startVal + (targetVal - startVal) * easeProgress;
        
        elements.priceValue.textContent = currentVal.toFixed(2);
        
        // Update USD representation
        const usdVal = currentVal * INR_LAKH_TO_USD;
        elements.priceUsd.textContent = `$${Math.round(usdVal).toLocaleString()}`;

        if (progress < 1) {
            animationFrameId = requestAnimationFrame(animate);
        }
    }

    animationFrameId = requestAnimationFrame(animate);
}

// Update the size, direction, and text of contribution breakdown bars
function updateBreakdownBars(contrib) {
    // Collect all absolute values to determine scaling factor
    const absValues = Object.values(contrib).map(val => Math.abs(val));
    const maxVal = Math.max(...absValues, 1); // prevent division by zero

    const updateBar = (barElem, textElem, value) => {
        // Calculate width relative to the largest contributor
        const percentage = Math.min((Math.abs(value) / maxVal) * 100, 100);
        barElem.style.width = `${percentage}%`;

        // Format label text
        const sign = value >= 0 ? '+' : '-';
        textElem.textContent = `${sign}${Math.abs(value).toFixed(2)} L`;

        // Colors
        if (value >= 0) {
            barElem.className = 'breakdown-bar positive';
            textElem.className = 'breakdown-val positive-val';
        } else {
            barElem.className = 'breakdown-bar negative';
            textElem.className = 'breakdown-val negative-val';
        }
    };

    updateBar(elements.barIntercept, elements.valIntercept, contrib.intercept);
    updateBar(elements.barSize, elements.valSize, contrib.size);
    updateBar(elements.barBedrooms, elements.valBedrooms, contrib.bedrooms);
    updateBar(elements.barAge, elements.valAge, contrib.age);
    updateBar(elements.barDistance, elements.valDistance, contrib.distance);
    updateBar(elements.barIncome, elements.valIncome, contrib.income);
}

// Start application
document.addEventListener('DOMContentLoaded', init);
