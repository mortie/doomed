class Sprite {
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {string} name
	 * @param {number} offset
	 */
	constructor(x, y, name) {
		this.x = x;
		this.y = y;
		this.sprite = null;

		switch (name) {
		case "ladder":
			this.sprite = new StaticSprite(LADDER_SHEET, 0, 0);
			break;

		case "skull-banner":
			this.sprite = new StaticSprite(SKULL_BANNER_SHEET, 0, 0);
			break;

		default:
			console.warn("Unknown sprite:", name);
			break;
		}
	}

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {number} dx
	 * @param {number} dy
	 * @param {number} dist
	 */
	draw(ctx, dx, dy, dist) {
		if (this.sprite) {
			this.sprite.draw(ctx, dx, dy, dist);
		}
	}
}
