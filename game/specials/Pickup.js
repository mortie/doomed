class Pickup {
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {string} name
	 * @param {string} sprite
	 */
	constructor(x, y, name, sprite) {
		this.x = x;
		this.y = y;
		this.name = name;
		this.sprite = lookupSprite(sprite);
	}

	/**
	 * @param {Game} game
	 * @param {number} dt
	 */
	update(game, dt) {
		this.sprite.update(dt);

		const dx = game.player.x - this.x;
		const dy = game.player.y - this.y;
		const sqDist = dx * dx + dy * dy;
		if (sqDist <= 1.2) {
			game.player.inventory.push(this.name);
			this.dead = true;
			game.textOverlay = {
				timer: 5,
				lines: ["Picked up " + this.name],
			};
			PICKUP_SOUND.play(0);
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
