const SPECIAL_PLAYER = 0;
const SPECIAL_ENEMY = 1;

const SCREEN_WIDTH = 640;
const SCREEN_HEIGHT = 360;
const SCREEN_FOV = 80 * (Math.PI / 180);
const RENDER_DIST = 200;
const RENDER_STEPS = 50;
const SKY_COLOR = "cyan";
const GROUND_COLOR = "gray";

const BLACK = new Uint8ClampedArray([0, 0, 0, 0xff]);

/**
 * @typedef {Object} Entity
 * @property {number} x
 * @property {number} y
 * @property {boolean} dead
 * @property {boolean?} dying
 * @property {function} update
 * @property {function?} draw
 * @property {function?} hurt
 */

/**
 * @typedef {Object} Special
 * @property {number} type
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} RayHit
 * @property {number} dist
 * @property {number} r
 * @property {number} g
 * @property {number} b
 * @property {number} a
 */

class LevelData {
	/**
	 * @param {HTMLImageElement} img
	 */
	constructor(img) {
		img.crossOrigin = "anonymous";
		this.width = img.width;
		this.height = img.height;
		const canvas = document.createElement("canvas");
		canvas.width = img.width;
		canvas.height = img.height;
		const ctx = canvas.getContext("2d");
		ctx.drawImage(img, 0, 0);
		const data = ctx.getImageData(0, 0, img.width, img.height);
		this.data = data.data;

		/** @type {Special[]} */
		this.specials = [];
		for (let y = 0; y < this.height; ++y) {
			for (let x = 0; x < this.width; ++x) {
				let data = this.at(x, y);
				// FFxxFFFF represents specials
				if (data[0] == 0xff && data[2] == 0xff && data[3] == 0xff) {
					const type = data[1];
					this.specials.push({x, y, type});
					data[0] = 0x00;
					data[1] = 0x00;
					data[2] = 0x00;
					data[3] = 0x00;
				}
			}
		}
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 */
	at(x, y) {
		if (x >= this.width || x < 0 || y >= this.height || y < 0) {
			return BLACK;
		}

		const offset = ((this.width * y) + x) * 4;
		return this.data.subarray(offset, offset + 4);
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 */
	collides(x, y) {
		return this.at(Math.floor(x + 0.5), Math.floor(y + 0.5))[3] >= 0x80;
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} angle
	 * @returns {RayHit | null}
	 */
	raycast(x, y, angle) {
		let cx = x + 0.5;
		let cy = y + 0.5;
		const dx = Math.sin(angle) / RENDER_STEPS
		const dy = -Math.cos(angle) / RENDER_STEPS;
		const iters = RENDER_DIST * RENDER_STEPS;
		x = NaN;
		y = NaN;
		for (let i = 0; i < iters; ++i) {
			cx += dx;
			cy += dy;
			const nx = Math.floor(cx);
			const ny = Math.floor(cy);
			if (nx == x && ny == y) {
				continue;
			}

			x = nx;
			y = ny;
			const data = this.at(x, y);
			if (data[3] < 0x80) {
				continue;
			}

			return {
				r: data[0],
				g: data[1],
				b: data[2],
				dist: i / RENDER_STEPS,
			};
		}

		return null;
	}
}

/**
 * @param {string} url
 * @returns {Promise<LevelData>}
*/
function loadLevelFromURL(url) {
	return new Promise((resolve, reject) => {
		const img = document.createElement("img");

		img.onload = () => {
			resolve(new LevelData(img));
		};

		img.onerror = reject;

		img.src = url;
	});
}

class Game {
	/**
	 * @param {HTMLCanvasElement} canvas
	 * @param {LevelData} level
	 */
	constructor(canvas, level) {
		this.ctx = canvas.getContext("2d");
		this.level = level;

		/** @type {Player */
		this.player = new Player();

		/** @type {Entity[]} */
		this.entities = [this.player];

		/** @type {Set<string>*/
		this.keys = new Set();

		for (const s of level.specials) {
			if (s.type == SPECIAL_PLAYER) {
				this.player.x = s.x;
				this.player.y = s.y;
			} else if (s.type == SPECIAL_ENEMY) {
				this.entities.push(new Enemy(s.x, s.y));
			} else {
				console.warn("Unknown special:", s);
			}
		}

		/** @type {number[]} */
		this.depthBuffer = new Array(SCREEN_WIDTH).fill(0);
	}

	render() {
		// Clear screen
		canvas.width = SCREEN_WIDTH;
		canvas.height = SCREEN_HEIGHT;

		// This needs to be set every time for some reason
		this.ctx.imageSmoothingEnabled = false;

		// Render "skybox"
		this.ctx.fillStyle = SKY_COLOR;
		this.ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT / 2);
		this.ctx.fillStyle = GROUND_COLOR;
		this.ctx.fillRect(0, SCREEN_HEIGHT / 2, SCREEN_WIDTH, SCREEN_HEIGHT / 2);

		const player = this.player;

		for (let x = 0; x < SCREEN_WIDTH; ++x) {
			const ray_angle = ((x / SCREEN_WIDTH) - 0.5) * SCREEN_FOV;
			const angle = ray_angle + player.angle;

			const hit = this.level.raycast(player.x, player.y, angle);
			if (!hit) {
				this.depthBuffer[x] = Infinity;
				continue;
			}

			const A = Math.PI / 2 - Math.abs(ray_angle);
			const dist = Math.sin(A) * hit.dist;
			this.depthBuffer[x] = dist;
			const height = (5 / dist) * SCREEN_HEIGHT;
			const startY = (SCREEN_HEIGHT - height) / 2;
			this.ctx.fillStyle = `rgb(${hit.r}, ${hit.g}, ${hit.b})`;
			this.ctx.fillRect(x, startY, 1, height);
		}

		let renderEntities = [];
		for (const entity of this.entities) {
			if (!entity.draw) {
				continue;
			}

			const angle = angleBetweenPositions(player.x, player.y, entity.x, entity.y);
			const ray_angle = normAngle(angle - player.angle + Math.PI / 2);
			const x = Math.floor((ray_angle / SCREEN_FOV + 0.5) * SCREEN_WIDTH);
			if (x < 0 || x >= SCREEN_WIDTH) {
				continue;
			}

			const real_dist = Math.hypot(player.x - entity.x, player.y - entity.y);
			const A = Math.PI / 2 - Math.abs(ray_angle);
			const dist = Math.sin(A) * real_dist;
			if (dist >= this.depthBuffer[x]) {
				continue;
			}

			renderEntities.push({entity, x, dist});
		}

		renderEntities.sort((a, b) => b.dist - a.dist);
		for (const r of renderEntities) {
			r.entity.draw(this.ctx, r.x, SCREEN_HEIGHT / 2, r.dist);
		}

		const status = `HP: ${this.player.health}`;
		this.ctx.fillStyle = "white";
		this.ctx.fillText(status, 4, 12);
		this.ctx.fillStyle = "black";
		this.ctx.fillText(status, 5, 13);
	}

	/**
	 * @param {number} dt
	 */
	update(dt) {
		this.player.update(this, dt);

		for (let i = 0; i < this.entities.length; ++i) {
			let entity = this.entities[i];
			if (entity.dead) {
				if (i == this.entities.length - 1) {
					this.entities.pop();
					break;
				} else {
					entity = this.entities.pop();
					this.entities[i] = entity;
				}
			}

			entity.update(this, dt);
		}
	}
}
