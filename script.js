const canvasEl = /** @type {HTMLCanvasElement} */ (
	document.getElementById("canvas"));

/** @type {Game | null} */
let game = null;
let paused = false;
/** @type {Set<string>} */
const keys = new Set();

window.addEventListener("keydown", evt => {
	if (evt.code == "KeyP") {
		paused = !paused;
	} else {
		keys.add(evt.code);
	}
});

window.addEventListener("keyup", evt => {
	keys.delete(evt.code);
});

/** @type {Map<String, Game>} */
const gamesByLevelName = new Map();

/**
 * @param {Player} player
 * @param {LevelEntry} entry
 * @param {Player?} oldPlayer
 */
function placePlayerAtEntry(player, entry, oldPlayer) {
	if (oldPlayer) {
		player.health = oldPlayer.health;
		player.inventory = oldPlayer.inventory;
	}

	if (oldPlayer != null && entry.angle == null) {
		player.angle = oldPlayer.angle;
	} else {
		player.angle = (entry.angle || 0) * (Math.PI / 180);
	}

	player.x = entry.x;
	player.y = entry.y;
}

/**
 * @param {String?} name
 * @param {String} entryName
 */
function loadLevel(name, entryName = "default") {
	if (!name) {
		name = "intro";
		gamesByLevelName.clear();
	}

	console.log("Load", name, "@", entryName);

	const oldGame = game;

	/** @type {Player?} */
	let oldPlayer = null;
	if (oldGame) {
		oldPlayer = oldGame.player;
	}

	const existingGame = gamesByLevelName.get(name);
	if (existingGame) {
		const entry = existingGame.levelEntries.get(entryName);
		if (!entry) {
			console.warn("Missing level entry:", entryName);
			return;
		}

		game = existingGame;
		if (oldGame) {
			game.textOverlay = oldGame.textOverlay;
		}
		placePlayerAtEntry(existingGame.player, entry, oldPlayer);
		return;
	}

	game = null;
	loadLevelFromURL(`levels/${name}`).then(level => {
		game = new Game(canvasEl, level, keys, loadLevel);
		gamesByLevelName.set(name, game);

		const entry = game.levelEntries.get(entryName);
		if (!entry) {
			console.warn("Missing level entry:", entryName);
			return;
		}

		if (oldGame) {
			game.textOverlay = oldGame.textOverlay;
		}
		placePlayerAtEntry(game.player, entry, oldPlayer);
	});
}

window.addEventListener("DOMContentLoaded", () => {
	loadLevel(null);
});

setInterval(() => {
	if (game) {
		if (!paused) {
			game.update(1 / 60);
		}
	}

	if (game) {
		game.render();
	}
}, 1000 / 60);

setInterval(() => {
	if (game) {
		window.localStorage.setItem("player", JSON.stringify({
			x: game.player.x,
			y: game.player.y,
			angle: game.player.angle,
		}));
	}
}, 1000);
