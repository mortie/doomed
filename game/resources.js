const MISSING_SHEET = new SpriteSheet("sprites/missing.png", 64, 64);
const ZOMBOID_SHEET = new SpriteSheet("sprites/zomboid.png", 64, 96);
const ORBS_SHEET = new SpriteSheet("sprites/orbs.png", 32, 32);
const LADDER_SHEET = new SpriteSheet("sprites/ladder.png", 42, 77);
const SKULL_BANNER_SHEET = new SpriteSheet("sprites/skull-banner.png", 32, 96);
const CHOPPER_SHEET = new SpriteSheet("sprites/chopper.png", 340, 112);

/**
 * @param {string} name
 * @returns {StaticSprite | SpritePlayer}
 */
function lookupSprite(name) {
	switch (name) {
	case "ladder":
		return new StaticSprite(LADDER_SHEET);

	case "skull-banner":
		return new StaticSprite(SKULL_BANNER_SHEET);

	case "blue-key":
		return new SpritePlayer(ORBS_SHEET, 4, [
			[0, 1], [1, 1], [2, 1], [3, 1]]);

	case "chopper":
		return new StaticSprite(CHOPPER_SHEET);

	case "spectral-core":
		return new SpritePlayer(ORBS_SHEET, 4, [
			[0, 4], [1, 4], [2, 4], [3, 4]]);

	default:
		console.warn("Unknown sprite:", name);
		return new StaticSprite(MISSING_SHEET);
	}
}
