class LevelTransition {
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {string} to
	 * @param {string} [entry]
	 */
	constructor(x, y, to, entry) {
		this.x = x;
		this.y = y;
		this.to = to;
		this.entry = entry;
		this.collidesWithPlayer = false;
	}

	/**
	 * @param {Game} game
	 * @param {number} _dt
	 */
	update(game, _dt) {
		const dx = game.player.x - this.x;
		const dy = game.player.y - this.y;
		const sqDist = dx * dx + dy * dy;
		if (sqDist <= 1.2) {
			game.player.vx = 0;
			game.player.vy = 0;
			game.levelTransition(this.to, this.entry);
		}
	}
}
