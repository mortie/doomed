/** @type {HTMLImageElement} */
const canvasEl = document.getElementById("canvas");

/** @type {Game | null} */
let game = null;
let paused = false;

window.addEventListener("keydown", evt => {
	if (evt.code == "KeyP") {
		paused = !paused;
	} else if (game) {
		game.keys.add(evt.code);
	}
});

window.addEventListener("keyup", evt => {
	if (game) {
		game.keys.delete(evt.code);
	}
});

/**
 * @param {string} name
 */
function loadLevel(name) {
	let health = null;
	if (game) {
		health = game.player.health;
	}

	game = null;
	loadLevelFromURL(`levels/${name}`).then(level => {
		game = new Game(canvasEl, level, loadLevel);
		if (health) {
			game.player.health = health;
		}
	});
}

loadLevel("intro");

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
		this.localStorage.setItem("player", JSON.stringify({
			x: game.player.x,
			y: game.player.y,
			angle: game.player.angle,
		}));
	}
}, 1000);
