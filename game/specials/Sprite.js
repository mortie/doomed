class Sprite {
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {string} sprite
	 */
	constructor(x, y, sprite) {
		this.x = x;
		this.y = y;
		this.sprite = lookupSprite(sprite);
	}

	/**
	 * @param {Game} _game
	 * @param {number} dt
	 */
	update(_game, dt) {
		this.sprite.update(dt);
	}

	/**
	 * @param {Game} game
	 * @param {number} dx
	 * @param {number} dy
	 * @param {number} dist
	 */
	draw(game, dx, dy, dist) {
		if (this.sprite) {
			this.sprite.draw(game, dx, dy, dist);
		}
	}
}
