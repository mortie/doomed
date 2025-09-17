class SpriteSheet {
	/**
	 * @param {string} url
	 * @param {number} tileWidth
	 * @param {number} tileHeight
	 */
	constructor(url, tileWidth, tileHeight) {
		this.img = document.createElement("img");
		this.img.src = url;

		this.width = tileWidth;
		this.height = tileHeight;
		this.totalWidth = tileWidth;
		this.totalHeight = tileHeight;
		this.nx = 1;
		this.ny = 1;

		this.img.onload = () => {
			this.totalWidth = this.img.width;
			this.totalHeight = this.img.height;
			this.tx = Math.floor(this.width / tileWidth);
			this.ty = Math.floor(this.height / tileHeight);
		};
	}

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {number} dx
	 * @param {number} dy
	 * @param {number} dist
	 * @param {number} tx
	 * @param {number} ty
	 */
	draw(ctx, dx, dy, dist, tx, ty) {
		const dw = this.width / dist * SCREEN_HEIGHT / 16;
		const dh = this.height / dist * SCREEN_HEIGHT / 16;
		ctx.drawImage(
			this.img,
			tx * this.width + 0.25, ty * this.height + 0.25,
			this.width - 0.5, this.height - 0.5,
			dx - dw / 2, dy - dh / 2,
			dw, dh);
	}
}

class SpritePlayer {
	/**
	 * @param {SpriteSheet} sheet
	 * @param {number} fps
	 * @param {number[][]} sequence
	 */
	constructor(sheet, fps, sequence) {
		this.sheet = sheet;
		this.sequence = sequence;
		this.rate = 1 / fps;
		this.index = 0;
		this.timer = 0;
	}

	/**
	 * @param {number} dt
	 */
	update(dt) {
		this.timer += dt;
		if (this.timer >= this.rate) {
			this.index += 1;
			if (this.index >= this.sequence.length) {
				this.index = 0;
			}
			this.timer -= this.rate;
		}
	}

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {number} dx
	 * @param {number} dy
	 * @param {number} dist
	 */
	draw(ctx, dx, dy, dist) {
		const tile = this.sequence[this.index];
		this.sheet.draw(ctx, dx, dy, dist, tile[0], tile[1]);
	}
}

class StaticSprite {
	/**
	 * @param {SpriteSheet} sheet
	 * @param {number} tx
	 * @param {number} ty
	 */
	constructor(sheet, tx = 0, ty = 0) {
		this.sheet = sheet;
		this.tx = tx;
		this.ty = ty;
	}

	/**
	 * @param {number} _dt
	 */
	update(_dt) {}

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {number} dx
	 * @param {number} dy
	 * @param {number} dist
	 */
	draw(ctx, dx, dy, dist) {
		this.sheet.draw(ctx, dx, dy, dist, this.tx, this.ty);
	}
}
