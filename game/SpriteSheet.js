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
	 * @param {Game} game
	 * @param {number} dx
	 * @param {number} dy
	 * @param {number} dist
	 * @param {number} tx
	 * @param {number} ty
	 */
	draw(game, dx, dy, dist, tx, ty) {
		if (dist < 0.1 || dist > 100) {
			return;
		}

		const dw = this.width / dist * SCREEN_HEIGHT / 16;
		const dh = this.height / dist * SCREEN_HEIGHT / 16;

		// Apply a depth penalty to things nearer the edge of the screen,
		// since perspective makes things wonky there
		const penalty = 1 + Math.abs((dx - (SCREEN_WIDTH / 2)) / SCREEN_WIDTH) * 0.2;

		const start = Math.floor(dx - (dw / 2));
		const end = Math.floor(dx + (dw / 2));
		const max = game.depthBuffer.length;
		let rangeStart = start;
		for (let i = rangeStart; i <= end; ++i) {
			const obscured = (
				i < 0 || i >= max || i == end ||
				game.depthBuffer[i] <= dist * penalty);
			const prevObscured = i == rangeStart;

			if (obscured && prevObscured) {
				// Keep updating range start until we find a non-obscured pixel
				rangeStart = i + 1;
				continue;
			} else if (obscured && !prevObscured) {
				// Draw the non-obscured section
				// This is handled later
			} else if (!obscured && prevObscured) {
				// The section just became visible?
				// Keep going until we reach the end of the section
				continue;
			} else if (!obscured && !prevObscured) {
				// Section still visible?
				// Keep going until we reach the end of the section
				continue;
			}

			const startFrac = (rangeStart - start) / dw;
			const endFrac = (i - start) / dw;

			const sx = tx * this.width + startFrac * this.width;
			const sy = ty * this.height;
			const sw = this.width * (endFrac - startFrac);
			const sh = this.height;

			const ndx = (dx - dw / 2) + dw * startFrac;
			const ndy = dy - dh / 2;
			const ndw = dw * (endFrac - startFrac);
			const ndh = dh;

			game.ctx.drawImage(
				this.img,
				sx + 1, sy + 1, sw - 2, sh - 2,
				ndx, ndy, ndw, ndh);

			rangeStart = i + 1;
		}
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
	 * @param {Game} game
	 * @param {number} dx
	 * @param {number} dy
	 * @param {number} dist
	 */
	draw(game, dx, dy, dist) {
		const tile = this.sequence[this.index];
		this.sheet.draw(game, dx, dy, dist, tile[0], tile[1]);
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
	 * @param {Game} game
	 * @param {number} dx
	 * @param {number} dy
	 * @param {number} dist
	 */
	draw(game, dx, dy, dist) {
		this.sheet.draw(game, dx, dy, dist, this.tx, this.ty);
	}
}
