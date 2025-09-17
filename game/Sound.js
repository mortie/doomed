class Sound {
	/**
	 * @param {string} url
	 * @param {number} volume
	 */
	constructor(url, volume = 1) {
		this.volume = volume;

		/** @type HTMLAudioElement[] */
		this.elements = [];
		for (let i = 0; i < 2; ++i) {
			const el = /** @type HTMLAudioElement */ (
				document.createElement("audio"));
			el.src = url;
			this.elements.push(el);
		}
	}

	/**
	 * @param {number} dist
	 */
	play(dist) {
		const el = this.elements.pop();
		if (!el) {
			return;
		}

		const vol = Math.min((5 / dist) * this.volume, 1);
		if (vol < 0.05) {
			return;
		}

		console.log("volume", vol);
		el.volume = vol;
		el.onended = () => {
			this.elements.push(el);
		};
		el.play();
	}
}
