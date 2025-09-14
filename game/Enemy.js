class Enemy {
	/**
	 * @param {number} x
	 * @param {number} y
	 */
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.dead = false;
		this.dying = false;
		this.walk = new SpritePlayer(ENEMY_SHEET, 4, [
			[0, 0], [0, 1], [0, 2], [0, 3]]);
		this.death = new SpritePlayer(ENEMY_SHEET, 5, [
			[1, 0], [1, 1], [1, 2], [1, 3], [1, 4]]);
		this.walking = true;
		this.timer = 0;
		this.health = 3;
	}

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {number} dx
	 * @param {number} dy
	 * @param {number} dist
	 */
	draw(ctx, dx, dy, dist) {
		if (this.dying) {
			this.death.draw(ctx, dx, dy, dist);
		} else if (this.walking) {
			this.walk.draw(ctx, dx, dy, dist);
		} else {
			ENEMY_SHEET.draw(ctx, dx, dy, dist, 0, 4);
		}
	}

	/**
	 * @param {Game} game
	 * @param {number} dt
	 */
	update(game, dt) {
		if (this.dying) {
			if (this.death.index < this.death.sequence.length - 1) {
				this.death.update(dt);
			}
			this.timer -= dt;
			if (this.timer <= 0) {
				this.dead = true;
			}
			return;
		}

		const distX = game.player.x - this.x;
		const distY = game.player.y - this.y;
		const dist = Math.hypot(distX, distY);

		if (this.walking && dist < 13) {
			this.walking = false;
			this.walk.index = 0;
			this.timer = 0;
		} else if (this.walking && dist > 30) {
			this.walking = false;
		} else if (this.walking) {
			this.walk.update(dt);
			const dx = (distX / dist) * 2 * dt;
			const dy = (distY / dist) * 2 * dt;
			moveAndSlide(game, this, dx, dy);
		} else if (dist >= 15 && dist < 25) {
			this.walking = true;
		} else if (this.timer <= 0 && dist < 30) {
			this.timer = 2 + Math.random();
			const dx = (distX / dist) * 4;
			const dy = (distY / dist) * 4;
			game.entities.push(new Projectile(
				this.x, this.y, dx, dy, 3, this));
		} else {
			this.timer -= dt;
		}
	}

	hurt() {
		this.health -= 1;
		if (this.health <= 0) {
			this.dying = true;
			this.timer = 5;
		}
	}
};
