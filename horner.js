
function horner(x, coeffs) {
	if (coeffs.length == 0) {
		return 0;
	}
	return coeffs[0] + x*horner(x, coeffs.slice(1));
}

function findObviousZeroesOnRange(minX, maxX, numDivs, coeffs) {
	console.log(`findObviousZeroesOnRange [${minX}, ${maxX}]`);
	if (minX >= maxX) {
		const val = horner(minX, coeffs);
		return val == 0 ? [minX] : [];
	}
	const zeroes = [];
	const dX = (maxX - minX)/numDivs;
	let prevX = undefined;
	let prevVal = undefined;
	for (let i = 0; i <= numDivs; i++) {
		const x = minX + i*dX;
		const val = horner(x, coeffs);
		if (val == 0) {
			console.log(`+ found zero @ ${x}`);
			zeroes.push(x);
		} else if (prevVal !== undefined && x !== prevX && val * prevVal < 0) {
			if (prevX > minX || x < maxX) {
				console.log(`+ recursing between ${prevX}(${prevVal}) and ${x}(${val})`);
				zeroes.push(...findObviousZeroesOnRange(prevX, x, numDivs, coeffs));
			}
			else {
				const midX = (prevX + x)/2;
				console.log(`+ hit recursion limit, returning zero @ approx ${midX}`);
				return [midX];
			}
		}
		prevX = x;
		prevVal = val;
	}
	return zeroes;
}

	
/* TEST */

xvals = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
coeffs = [-428, 0, 150, -12, -15, 0, 1];  // reversed: x^6 - 15x^4 - 12x^3 + 150x^2 - 428

xvals.forEach((x) => { const f = horner(x, coeffs); console.log(`${x} | ${f}`); });

obviousZeroes = findObviousZeroesOnRange(-4, 4, 100, coeffs);
console.log(`zeroes: ${obviousZeroes}`);
obviousZeroes.forEach((x) => { const f = horner(x, coeffs); console.log(`${x} | ${f}`); });


