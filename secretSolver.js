const fs = require("fs");
const path = require("path");

function decodeValue(value, base) {
    return BigInt(parseInt(value, base));
}

function lagrangeInterpolation(points) {
    let secret = BigInt(0);
    const k = points.length;

    for (let i = 0; i < k; i++) {
        const { x: xiRaw, y: yi } = points[i];
        const xi = BigInt(xiRaw);

        let numerator = BigInt(1);
        let denominator = BigInt(1);

        for (let j = 0; j < k; j++) {
            if (i !== j) {
                const xj = BigInt(points[j].x);
                numerator *= -xj;
                denominator *= (xi - xj);
            }
        }

        const li = numerator / denominator;
        secret += yi * li;
    }

    return secret;
}

function parsePointsFromFile(filePath) {
    const absolutePath = path.resolve(filePath);
    const rawData = fs.readFileSync(absolutePath, "utf8");
    const jsonData = JSON.parse(rawData);

    const k = jsonData.keys.k;

    return Object.entries(jsonData)
        .filter(([key]) => !isNaN(parseInt(key)))
        .slice(0, k)
        .map(([xStr, { base, value }]) => ({
            x: parseInt(xStr),
            y: decodeValue(value, parseInt(base))
        }));
}

function computeSecretsFromFiles(filePaths) {
    return filePaths.map((filePath, index) => {
        const points = parsePointsFromFile(filePath);
        const secret = lagrangeInterpolation(points);
        return { testCase: index + 1, secret };
    });
}

function displaySecrets(results) {
    results.forEach(({ testCase, secret }) => {
        console.log(`Secret for Test Case ${testCase}: ${secret}`);
    });
}

function main() {
    const testCaseFiles = ["input1.json", "input2.json"];
    const results = computeSecretsFromFiles(testCaseFiles);
    displaySecrets(results);
}

main();
