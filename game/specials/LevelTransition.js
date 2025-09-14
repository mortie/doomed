class LevelTransition {
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {string} to
	 */
	constructor(x, y, to) {
		this.x = x;
		this.y = y;
		this.to = to;
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
			game.levelTransition(this.to);
		}
	}
}
