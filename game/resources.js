const ZOMBOID_SHEET = new SpriteSheet("sprites/zomboid.png", 64, 96);
const ORBS_SHEET = new SpriteSheet("sprites/orbs.png", 32, 32);
const LADDER_SHEET = new SpriteSheet("sprites/ladder.png", 42, 77);
const SKULL_BANNER_SHEET = new SpriteSheet("sprites/skull-banner.png", 32, 96);

/**
 * @param {string} name
 * @returns {StaticSprite | SpritePlayer}
 */
function lookupSprite(name) {
	switch (name) {
	case "ladder":
		return new StaticSprite(LADDER_SHEET, 0, 0);

	case "skull-banner":
		return new StaticSprite(SKULL_BANNER_SHEET, 0, 0);

	case "blue-orb":
		return new SpritePlayer(ORBS_SHEET, 4, [
			[0, 1], [1, 1], [2, 1], [3, 1]]);

	default:
		console.warn("Unknown sprite:", name);
		return new StaticSprite(ORBS_SHEET, 0, 4);
	}
}
