const SCREEN_WIDTH = 640;
const SCREEN_HEIGHT = 360;
const SCREEN_FOV = 80 * (Math.PI / 180);
const RENDER_STEPS = 50;

const BLACK = new Uint8ClampedArray([0, 0, 0, 0xff]);
const SCREEN_DIST = 1.0 / Math.tan(SCREEN_FOV / 2);

/**
 * @typedef {function(Game, number, number, number): void} DrawFunc
 * @typedef {function(Game, number): void} UpdateFunc
 * @typedef {function(Game): void} HurtFunc
 */

/**
 * @typedef {Object} Entity
 * @property {number} x
 * @property {number} y
 * @property {boolean} [dead]
 * @property {boolean} [dying]
 * @property {UpdateFunc} [update]
 * @property {DrawFunc} [draw]
 * @property {HurtFunc} [hurt]
 */

/**
 * @typedef {Object} Special
 * @property {string} type
 * @property {Object.<string, any>} params
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} RayHit
 * @property {number} dist
 * @property {number} r
 * @property {number} g
 * @property {number} b
 */

/**
 * @typedef {Object} LevelEntry
 * @property {number} x
 * @property {number} y
 * @property {number} [angle]
 */

/**
 * @typedef {Object} TextOverlay
 * @property {number} timer
 * @property {string[]} lines
 */

class LevelData {
	/**
	 * @param {HTMLImageElement} img
	 * @param {any} meta
	 */
	constructor(img, meta) {
		this.width = img.width;
		this.height = img.height;
		const canvas = document.createElement("canvas");
		canvas.width = img.width;
		canvas.height = img.height;
		const ctx = canvas.getContext("2d");
		if (!ctx) {
			throw new Error("Failed to get canvas context");
		}

		/** @type {string[]?} */
		this.entryText = null;
		if (typeof meta.entryText == "string") {
			this.entryText = [meta.entryText];
		}  else if (meta.entryText instanceof Array) {
			/** @type any[] */
			const lines = meta.entryText;
			this.entryText = lines.filter(x => typeof x == "string");
		}
		this.entryText = meta.entryText;

		ctx.drawImage(img, 0, 0);
		const data = ctx.getImageData(0, 0, img.width, img.height);
		this.data = data.data;

		/** @type string */
		this.skyColor = meta.colors.sky;
		/** @type string */
		this.groundColor = meta.colors.ground;

		/** @type Map<number, any> */
		const specialSpecs = new Map();
		for (const i in meta.specials) {
			const id = parseInt(i, 16);
			specialSpecs.set(id, meta.specials[i]);
		}

		/** @type {Special[]} */
		this.specials = [];
		for (let y = 0; y < this.height; ++y) {
			for (let x = 0; x < this.width; ++x) {
				let data = this.at(x, y);
				// FFxxFFFF represents specials
				if (data[0] == 0xff && data[2] == 0xff && data[3] == 0xff) {
					const id = data[1];
					const spec = specialSpecs.get(id);
					if (!spec) {
						console.warn("Unknown spec: hex", id.toString(16));
						continue;
					}

					/** @type Special */
					const special = {x, y, type: "", params: {}};
					if (typeof spec == "string") {
						special.type = spec;
						special.params = {};
					} else {
						special.type = spec.type;
						special.params = spec;
					}

					this.specials.push(special);
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
	maybeAt(x, y) {
		if (x >= this.width || x < 0 || y >= this.height || y < 0) {
			return null;
		}

		const offset = ((this.width * y) + x) * 4;
		return this.data.subarray(offset, offset + 4);
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
	 * @param {number} dx
	 * @param {number} dy
	 * @param {number} len
	 * @param {number} max
	 * @returns {RayHit | null}
	 */
	raycast(x, y, dx, dy, len = NaN, max = Infinity) {
		if (isNaN(len)) {
			len = Math.hypot(dx, dy);
		}

		dx = dx / (len * RENDER_STEPS);
		dy = dy / (len * RENDER_STEPS);
		let cx = x + 0.5;
		let cy = y + 0.5;
		const iters = max * RENDER_STEPS;
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
			const data = this.maybeAt(x, y);
			if (!data) {
				return null;
			}

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
async function loadLevelFromURL(url) {
	/** @type {Promise<HTMLImageElement>} */
	const imagePromise = new Promise((resolve, reject) => {
		const img = document.createElement("img");

		img.onload = () => {
			resolve(img);
		};

		img.onerror = reject;

		img.src = `${url}/level.png`;
	});

	const metaPromise = fetch(`${url}/meta.json`).then(res => res.json());

	const [image, meta] = await Promise.all([imagePromise, metaPromise]);
	return new LevelData(image, meta);
}

class Game {
	/**
	 * @param {HTMLCanvasElement} canvas
	 * @param {LevelData} level
	 * @param {Set<String>} keys
	 * @param {(name: string?, entry?: string) => void} transition
	 */
	constructor(canvas, level, keys, transition) {
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");
		if (!this.ctx) {
			throw new Error("Failed to get canvas context");
		}

		this.level = level;
		this.keys = keys;
		this.levelTransition = transition;

		/** @type {TextOverlay?} */
		this.textOverlay = null;

		/** @type {Map<String, LevelEntry>} */
		this.levelEntries = new Map();

		/** @type {Player} */
		this.player = new Player();

		/** @type {Entity[]} */
		this.entities = [this.player];

		for (const s of level.specials) {
			this.handleSpecial(s);
		}

		/** @type {number[]} */
		this.depthBuffer = new Array(SCREEN_WIDTH).fill(0);

		if (level.entryText) {
			this.textOverlay = {
				timer: 8,
				lines: level.entryText,
			};
		}
	}

	/**
	 * @param {Special} s
	*/
	handleSpecial(s) {
		switch (s.type) {
		case "entry":
			const entry = {
				x: s.x,
				y: s.y,
				angle: s.params.angle == null ? null : s.params.angle,
			};
			this.levelEntries.set(s.params.name || "default", entry);
			break;

		case "zomboid":
			this.entities.push(new Zomboid(s.x, s.y));
			break;

		case "level-transition":
			const transition = new LevelTransition(
				s.x, s.y, s.params.to, s.params.entry);
			this.entities.push(transition);
			if (s.params.sprite) {
				this.entities.push(new Sprite(s.x, s.y, s.params.sprite));
			}
			if (s.params.requires) {
				transition.requires = s.params.requires;
			}
			break;

		case "sprite":
			this.entities.push(new Sprite(s.x, s.y, s.params.sprite));
			break;

		case "pickup":
			this.entities.push(new Pickup(s.x, s.y, s.params.name, s.params.sprite));
			break;

		default:
			console.warn("Unknown special:", s);
		}
	}

	render() {
		// Clear screen
		this.canvas.width = SCREEN_WIDTH;
		this.canvas.height = SCREEN_HEIGHT;

		// This needs to be set every time for some reason
		this.ctx.imageSmoothingEnabled = false;

		// Render "skybox"
		this.ctx.fillStyle = this.level.skyColor;
		this.ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT / 2);
		this.ctx.fillStyle = this.level.groundColor;
		this.ctx.fillRect(0, SCREEN_HEIGHT / 2, SCREEN_WIDTH, SCREEN_HEIGHT / 2);

		const player = this.player;

		for (let x = 0; x < SCREEN_WIDTH; ++x) {
			const column = (x / SCREEN_WIDTH) * 2 - 1;
			const ray_angle = Math.atan2(column, SCREEN_DIST);
			const angle = ray_angle + player.angle;

			const dx = Math.sin(angle);
			const dy = -Math.cos(angle);
			const hit = this.level.raycast(player.x, player.y, dx, dy, 1);
			if (!hit) {
				this.depthBuffer[x] = Infinity;
				continue;
			}

			this.depthBuffer[x] = hit.dist;

			const A = Math.PI / 2 - Math.abs(ray_angle);
			const dist = Math.sin(A) * hit.dist;
			const height = (5 / dist) * SCREEN_HEIGHT;
			const startY = (SCREEN_HEIGHT - height) / 2;
			this.ctx.fillStyle = `rgb(${hit.r}, ${hit.g}, ${hit.b})`;
			this.ctx.fillRect(x, startY, 1, height);
		}

		/**
		 * @typedef {Object} Drawable
		 * @property {DrawFunc} draw
		 */

		/**
		 * @typedef {Object} RenderEntity
		 * @property {Drawable} entity
		 * @property {number} x
		 * @property {number} dist
		 */

		/** @type {RenderEntity[]} */
		let renderEntities = [];
		for (const entity of this.entities) {
			if (!entity.draw) {
				continue;
			}

			const angle = angleBetweenPositions(player.x, player.y, entity.x, entity.y);
			const ray_angle = normAngle(angle - player.angle + Math.PI / 2);
			const x = Math.floor((ray_angle / SCREEN_FOV + 0.5) * SCREEN_WIDTH);
			if (x < -20 || x >= SCREEN_WIDTH + 20) {
				continue;
			}

			const real_dist = Math.hypot(player.x - entity.x, player.y - entity.y);
			/*
			if (real_dist - 0.25 >= this.depthBuffer[x]) {
				continue;
			}
			*/

			const A = Math.PI / 2 - Math.abs(ray_angle);
			const dist = Math.sin(A) * real_dist;
			const d = /** @type {Drawable} */ (entity);
			renderEntities.push({entity: d, x, dist});
		}

		renderEntities.sort((a, b) => b.dist - a.dist);
		for (const r of renderEntities) {
			r.entity.draw(this, r.x, SCREEN_HEIGHT / 2, r.dist);
		}

		const status = `HP: ${this.player.health}`;
		this.ctx.font = "12px Arial";
		this.ctx.fillStyle = "white";
		this.ctx.fillText(status, 4, 12);
		this.ctx.fillStyle = "black";
		this.ctx.fillText(status, 5, 13);

		if (this.textOverlay) {
			let y = 42;
			for (const line of this.textOverlay.lines) {
				this.ctx.font = "30px Arial";
				this.ctx.fillStyle = "white";
				this.ctx.fillText(line, 4, y);
				this.ctx.fillStyle = "black";
				this.ctx.fillText(line, 5, y + 1);
				y += 30;
			}
		}
	}

	/**
	 * @param {number} dt
	 */
	update(dt) {
		for (let i = 0; i < this.entities.length; ++i) {
			let entity = this.entities[i];
			if (entity.dead) {
				if (i == this.entities.length - 1) {
					this.entities.pop();
					break;
				} else {
					const e = this.entities.pop();
					if (!e) {
						return;
					}

					this.entities[i] = entity = e;
				}
			}

			if (entity.update) {
				entity.update(this, dt);
			}
		}

		if (this.player.dead) {
			this.levelTransition(null);
		}

		if (this.textOverlay) {
			this.textOverlay.timer -= dt;
			if (this.textOverlay.timer <= 0) {
				this.textOverlay = null;
			}
		}
	}
}
