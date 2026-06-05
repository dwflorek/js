function uiNoiseDiv(ui, regenerateNoiseCb) {
	const div = document.createElement('div');
	div.setAttribute('class', 'mainDiv');

	ui.noiseSize = new TextEntry('textField', 'noiseSize', 64, 'Noise Size');
	ui.updateNoiseButton = new PushButton('button', 'updateNoise', 'Regenerate', regenerateNoiseCb);

	ui.noiseSize.appendToElement(div);
	ui.updateNoiseButton.appendToElement(div);

	return div;
}
