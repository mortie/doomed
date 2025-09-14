/** @type {HTMLImageElement} */
const canvasEl = document.getElementById("canvas");

/** @type {Game | null} */
let game = null;
let paused = false;

window.addEventListener("keydown", evt => {
	if (evt.code == "KeyP") {
		paused = !paused;
	}

	if (game) {
		game.keys.add(evt.code);
	}
});

window.addEventListener("keyup", evt => {
	if (game) {
		game.keys.delete(evt.code);
	}
});

loadLevelFromURL("levels/sandbox.png").then(level => {
	game = new Game(canvasEl, level);

	const player = localStorage.getItem("player");
	if (player) {
		const p = JSON.parse(player);
		game.player.x = p.x;
		game.player.y = p.y;
		game.player.angle = p.angle;
	}
});

setInterval(() => {
	if (game) {
		if (!paused) {
			game.update(1 / 60);
		}
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
