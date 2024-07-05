// Define linspace function
function linspace(start, end, num) {
    const arr = [];
    const step = (end - start) / (num - 1);
    for (let i = 0; i < num; i++) {
        arr.push(start + (step * i));
    }
    return arr;
}

// Define repeat function for creating a repeated matrix
function repeat(arr, times) {
    const repeated = [];
    for (let i = 0; i < times; i++) {
        repeated.push([...arr]);
    }
    return repeated;
}

function generateBivariateNormalPDF(mean, cov, range, size = 100) {
    const x = linspace(-range, range, size);
    const y = linspace(-range, range, size);
    const X = repeat(x, size);
    const Y = repeat(y, size).map((row, i) => row.map(() => y[i]));

    const pos = [];
    for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) {
            row.push([X[i][j], Y[i][j]]);
        }
        pos.push(row);
    }

    const covInv = math.inv(cov);
    const detCov = math.det(cov);
    const normConst = 1.0 / (2.0 * Math.PI * Math.sqrt(detCov));

    const Z = pos.map(row => row.map(point => {
        const diff = math.subtract(point, mean);
        const exponent = -0.5 * math.multiply(math.multiply(math.transpose(diff), covInv), diff);
        return normConst * Math.exp(exponent);
    }));

    return {X, Y, Z};
}

function updatePlot() {
    // Get user input values
    const meanX = parseFloat(document.getElementById('meanX').value);
    const meanY = parseFloat(document.getElementById('meanY').value);
    const stdX = parseFloat(document.getElementById('stdX').value);
    const stdY = parseFloat(document.getElementById('stdY').value);
    const rho = parseFloat(document.getElementById('rho').value);

    // Validate rho
    if (rho === 1 || rho === -1) {
        document.getElementById('message').textContent = 'rho取值不能是1或者-1，无法绘图。';
        return;
    } else {
        document.getElementById('message').textContent = '';
    }

    const mean = [meanX, meanY];
    const cov = [
        [stdX ** 2, rho * stdX * stdY],
        [rho * stdX * stdY, stdY ** 2]
    ];

    // Determine axis range based on max mean value + 10
    const axisRange = Math.max(Math.abs(meanX), Math.abs(meanY)) + 10;

    // Generate the bivariate normal distribution data
    const {X, Y, Z} = generateBivariateNormalPDF(mean, cov, axisRange);

    // Create the Plotly plot
    const data = [{
        z: Z,
        x: X[0],
        y: Y.map(row => row[0]),
        type: 'surface'
    }];

    const layout = {
        title: `Bivariate Normal Distribution (rho=${rho}, std=${stdX}, ${stdY}), by Williams.Wang`,
        scene: {
            xaxis: {title: 'X', range: [-axisRange, axisRange]},
            yaxis: {title: 'Y', range: [-axisRange, axisRange]},
            zaxis: {title: 'Probability Density'}
        }
    };

    Plotly.newPlot('plot', data, layout);
}

// Initial plot
updatePlot();

