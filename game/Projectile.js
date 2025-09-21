class Projectile {
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} dx
	 * @param {number} dy
	 * @param {number} type
	 * @param {Entity} owner
	 */
	constructor(x, y, dx, dy, type, owner) {
		this.x = x + dx / 10;
		this.y = y + dy / 10;
		this.dead = false;
		this.dx = dx;
		this.dy = dy;
		this.sprite = new SpritePlayer(ORBS_SHEET, 8, [
			[0, type], [1, type], [2, type], [3, type]]);
		this.owner = owner;
	}

	/**
	 * @param {Game} game
	 * @param {number} dx
	 * @param {number} dy
	 * @param {number} dist
	 */
	draw(game, dx, dy, dist) {
		this.sprite.draw(game, dx, dy, dist);
	}

	/**
	 * @param {Game} game
	 * @param {number} dt
	 */
	update(game, dt) {
		this.sprite.update(dt);
		if (moveAndSlide(game, this, this.dx * dt, this.dy * dt)) {
			this.dead = true;
			return;
		}

		for (const entity of game.entities) {
			if (entity == this.owner || !entity.hurt || entity.dying) {
				continue;
			}

			const dist = Math.hypot(this.x - entity.x, this.y - entity.y);
			if (dist < 2) {
				entity.hurt(game);
				this.dead = true;
				return;
			}
		}
	}
}
