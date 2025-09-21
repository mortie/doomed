class Player {
	constructor() {
		this.x = 0;
		this.y = 0;
		this.vx = 0;
		this.vy = 0;
		this.dead = false;
		this.angle = 0;
		this.health = 10;
		this.shootTimeout = 0;
		/** @type {string[]} */
		this.inventory = [];
	}

	/**
	 * @param {Game} game
	 * @param {number} dt
	 */
	update(game, dt) {
		const MOVE_SPEED = 180;
		const FRICTION = 10;
		const ROTATE_SPEED = 3.5;

		const keys = game.keys;

		if (keys.has("ArrowLeft")) {
			this.angle = normAngle(this.angle - ROTATE_SPEED * dt);
		}
		if (keys.has("ArrowRight")) {
			this.angle = normAngle(this.angle + ROTATE_SPEED * dt);
		}

		let moveX = 0;
		let moveY = 0;
		if (keys.has("KeyA")) {
			moveX -= MOVE_SPEED;
		}
		if (keys.has("KeyD")) {
			moveX += MOVE_SPEED ;
		}
		if (keys.has("KeyW")) {
			moveY -= MOVE_SPEED;
		}
		if (keys.has("KeyS")) {
			moveY += MOVE_SPEED;
		}

		const a = this.angle;
		const dvx = moveX * Math.cos(a) - moveY * Math.sin(a);
		const dvy = moveX * Math.sin(a) + moveY * Math.cos(a);
		this.vx += dvx * dt;
		this.vy += dvy * dt;

		this.vx += -this.vx * FRICTION * dt;
		this.vy += -this.vy * FRICTION * dt;

		if (keys.has("Enter") && this.shootTimeout <= 0) {
			const dx = 1 * Math.sin(a);
			const dy = -1 * Math.cos(a);
			game.entities.push(new Projectile(
				this.x, this.y, dx * 20, dy * 20, 0, this));
			this.shootTimeout = 0.5;
			SHOOT_SOUND.play(0);
		}
		this.shootTimeout -= dt;

		moveAndSlide(game, this, this.vx * dt, this.vy * dt);
	}

	/**
	 * @param {Game} _
	 */
	hurt(_) {
		this.health -= 1;
		if (this.health <= 0) {
			this.dead = true;
			this.health = 10;
			PLAYER_DEATH_SOUND.play(0);
		} else {
			PLAYER_HURT_SOUND.play(0);
		}
	}
}
