class Zomboid {
	/**
	 * @param {number} x
	 * @param {number} y
	 */
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.dead = false;
		this.dist = 1;

		/** @type {"idle"|"shooting"|"walking"|"dying"} */
		this.state = "idle";
		this.sprites = {
			shooting: new StaticSprite(ZOMBOID_SHEET, 0, 4),
			idle: new StaticSprite(ZOMBOID_SHEET, 0, 5),
			walking: new SpritePlayer(ZOMBOID_SHEET, 4, [
				[0, 0], [0, 1], [0, 2], [0, 3]]),
			dying: new SpritePlayer(ZOMBOID_SHEET, 4, [
				[1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5]]),
		};

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
		this.sprites[this.state].draw(ctx, dx, dy, dist);
	}

	/**
	 * @param {Game} game
	 * @param {number} dt
	 */
	update(game, dt) {
		if (this.state == "dying") {
			const dying = this.sprites.dying;
			if (dying.index < dying.sequence.length - 1) {
				dying.update(dt);
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
		const hit = game.level.raycast(this.x, this.y, distX, distY, dist, dist);
		const playerVisible = hit == null;

		this.dist = dist * (playerVisible ? 1 : 2.5);

		switch (this.state) {
		case "idle":
			if (!playerVisible) {
				return;
			}


			if (dist < 20) {
				this.state = "shooting";
				this.timer = Math.random();
			} else if (dist < 35) {
				this.state = "walking";
			}
			break;

		case "walking":
			if (!playerVisible) {
				this.state = "idle";
				return;
			}

			this.sprites.walking.update(dt);
			const dx = (distX / dist) * 3 * dt;
			const dy = (distY / dist) * 3 * dt;
			moveAndSlide(game, this, dx, dy);

			if (dist > 40) {
				this.state = "idle";
			} else if (dist < 20) {
				this.state = "shooting";
				this.timer = Math.random() + 0.5;
			}
			break;

		case "shooting":
			if (!playerVisible) {
				this.state = "idle";
				return;
			}

			if (dist > 30) {
				this.state = "walking";
				return;
			}

			this.timer -= dt;
			if (this.timer <= 0) {
				this.timer = 2 + Math.random();
				const dx = (distX / dist) * 16;
				const dy = (distY / dist) * 16;
				game.entities.push(new Projectile(
					this.x, this.y, dx, dy, 3, this));
				SHOOT_SOUND.play(this.dist);
			}
			break;
		}
	}

	hurt() {
		this.health -= 1;
		if (this.health <= 0) {
			ZOMBOID_DEATH_SOUND.play(this.dist);
			this.state = "dying";
			this.timer = 5;
			this.dying = true;
		} else {
			ZOMBOID_HURT_SOUND.play(this.dist);
		}
	}
};
