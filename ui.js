class PushButton {
	constructor(className, elementId, text, callback) {
		this.label = document.createTextNode(text);
		this.callback = callback;

		this.element = document.createElement('button');
		this.element.setAttribute('type', 'button');
		this.element.setAttribute('class', className);
		this.element.setAttribute('id', elementId);
		this.element.appendChild(this.label);
		this.element.addEventListener("click", callback);
	}

	appendToElement(el) {
		el.appendChild(this.element);
	}

	getAttribute(attr) {
		return this.element.getAttribute(attr);
	}

	// useful for, e.g. "go/stop" button
	updateState(text, callback) {
		this.label.remove();
		this.label = document.createTextNode(text);
		this.element.appendChild(this.label);

		this.element.removeEventListener("click", this.callback);
		this.element.addEventListener("click", callback);
		this.callback = callback;
	}
}

class Checkbox {
	constructor(className, elementId, text, callback) {
		this.label = document.createElement('label');
		this.label.setAttribute('class', 'cb_label');
		this.label.setAttribute('for', elementId);
		this.label.innerHTML = text;
		this.callback = callback;
		this.element = document.createElement('input')
		this.element.setAttribute("type", "checkbox");
		this.element.setAttribute('class', className);
		this.element.setAttribute('id', elementId);
		this.element.addEventListener("click", callback);
	}

	appendToElement(el) {
                el.appendChild(this.element);
                el.appendChild(this.label);
        }

	getAttribute(attr) {
		return this.element.getAttribute(attr);
	}

	isChecked() {
		return this.element.checked;
	}
}

class RadioButtonGroup {
	constructor(className, groupName, elementAttrs, callback) {
		this.elements = []
		this.labels = []
		this.callback = callback;
		elementAttrs.forEach((e) => {
			const label = document.createElement('label');
			label.setAttribute('class', 'rb_label');
			label.setAttribute('for', e.id);
			label.innerHTML = e.text;
			const element = document.createElement('input');
			element.setAttribute('type', 'radio');
			element.setAttribute('class', className);
			element.setAttribute('name', groupName);
			element.setAttribute('id', e.id);
			element.setAttribute('value', e.value);
			element.addEventListener('change', callback);
			this.labels.push(label);
			this.elements.push(element);
		});
	}

	appendToElement(el) {
		for (let idx = 0; idx < this.elements.length; ++idx) {
			el.appendChild(this.elements[idx]);
			el.appendChild(this.labels[idx]);
		}
	}

	buttonWithAttribute(attr, value) {
		return this.elements.find((el) => { return el.getAttribute(attr) == value; });
	}

	selectButtonWithAttribute(attr, value) {
		const button = this.buttonWithAttribute(attr, value);
		if (button !== undefined) {
			button.checked = true;
		}
	}

	selectedButton() {
		return this.elements.find((el) => { return el.checked; });
	}
}

class TextEntry {
	constructor(className, elementId, defaultVal, labelText) {
		this.defaultVal = defaultVal;

		this.element = document.createElement('input');
		this.element.setAttribute('type', 'text');
		this.element.setAttribute('class', className);
		this.element.setAttribute('id', elementId);

		this.label = document.createElement('label');
		this.label.setAttribute('for', elementId);
		const labelContent = document.createTextNode(labelText);
		this.label.appendChild(labelContent);
	}

	appendToElement(el) {
		el.appendChild(this.element);
		el.appendChild(this.label);
		el.appendChild(document.createElement('br'));
	}

	getAttribute(attr) {
		return this.element.getAttribute(attr);
	}

	getContent() {
		let value = this.element.value;
		if (value === undefined || value === null || value === '') {
			value = this.defaultVal;
			this.element.value = value;
		}
		return value;
	}

	getNumericContent() {
		return Number(this.getContent());
	}

	setContent = function(value) {
		this.element.value = value;
	}
}
