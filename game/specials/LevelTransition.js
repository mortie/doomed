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

		/** @type {string?} */
		this.requires = null;
	}

	/**
	 * @param {Game} game
	 * @param {number} _dt
	 */
	update(game, _dt) {
		const dx = game.player.x - this.x;
		const dy = game.player.y - this.y;
		const sqDist = dx * dx + dy * dy;
		if (sqDist <= 1.6 * 1.6) {
			if (this.requires != null) {
				const item = game.player.inventory.indexOf(this.requires);
				if (item < 0) {
					game.textOverlay = {
						timer: 5,
						lines: ["Need " + this.requires],
					};
					return;
				}

				game.textOverlay = {
					timer: 5,
					lines: ["Used " + this.requires],
				};
				game.player.inventory.splice(item, 1);
				this.requires = null;
			}

			game.player.vx = 0;
			game.player.vy = 0;
			game.levelTransition(this.to, this.entry);
		}
	}
}
