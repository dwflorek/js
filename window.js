// A specified rectangular portion of an Img
// TODO:
// 	make a Window a portion of a canvas
// 	give Img an arbitrary size
// 	figure out how to draw an Img into a Window regrdless of their respective sizes
class Window {
	constructor(img, x, y, w, h) {
		this.img = img;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}

	clear(pixelColor) {
		for (let row = this.y; row < this.y + this.h; ++row) {
			let pidx = row * this.img.imgData.width * 4 + this.x * 4;
			for (let col = this.x; col < this.x + this.w; ++col) {
				this.img.colorPixel(pidx, pixelColor);
				pidx += 4;
			}
		}
	}
}
