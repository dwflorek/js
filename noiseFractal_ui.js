function uiNoiseFractalDiv(ui, updateFractalValsCb) {
	const div = document.createElement('div');
	div.setAttribute('class', 'mainDiv');

	ui.numOctaves = new TextEntry('textField', 'octaves', 1, 'Number of octaves');
	ui.baseFreq = new TextEntry('textField', 'baseFreq', 3.0, 'Base frequency (inverse of zoom)');
	ui.freqFactor = new TextEntry('textField', 'freqFactor', 2.0, 'Frequency multiplier');
	ui.baseAmpl = new TextEntry('textField', 'baseAmpl', 0.333, 'Base amplitude');
	ui.amplFactor = new TextEntry('textField', 'amplFactor', 0.5, 'Amplitude multiplier');
	ui.scaleFactor = new TextEntry('textField', 'scaleFactor', 1.0, 'Overall scale multiplier');
	ui.updateFractalButton = new PushButton('button', 'updateFractal', 'Update', updateFractalValsCb);

	ui.numOctaves.appendToElement(div);
	ui.baseFreq.appendToElement(div);
	ui.freqFactor.appendToElement(div);
	ui.baseAmpl.appendToElement(div);
	ui.amplFactor.appendToElement(div);
	ui.scaleFactor.appendToElement(div);
	div.appendChild(document.createElement('br'));
	ui.updateFractalButton.appendToElement(div);

	return div;
}
