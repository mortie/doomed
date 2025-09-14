/**
 * Normalize an angle between -pi and pi.
 * @param {number} angle
 */
function normAngle(angle) {
	while (angle < -Math.PI) {
		angle += Math.PI * 2;
	}

	while (angle > Math.PI) {
		angle -= Math.PI * 2;
	}

	return angle;
}

/**
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 */
function angleBetweenPositions(x1, y1, x2, y2) {
	const x = x2 - x1;
	const y = y2 - y1;
	if (x == 0 && y == 0) {
		return 0;
	}

	return Math.atan2(y, x);
}

/**
 * @param {Game} game,
 * @param {Entity} entity,
 * @param {number} dx,
 * @param {number} dy,
 */
function moveAndSlide(game, entity, dx, dy) {
	let hit = false;

	if (dx < 0.01) {
		if (game.level.collides(entity.x + dx - 0.2, entity.y)) {
			hit = true;
			entity.x = Math.floor(entity.x) + 0.7;
		} else {
			entity.x += dx;
		}
	} else if (dx > 0.01) {
		if (game.level.collides(entity.x + dx + 0.2, entity.y)) {
			hit = true;
			entity.x = Math.floor(entity.x) + 0.3;
		} else {
			entity.x += dx;
		}
	}

	if (dy < 0.01) {
		if (game.level.collides(entity.x, entity.y + dy - 0.2)) {
			hit = true;
			entity.y = Math.floor(entity.y) + 0.7
		} else {
			entity.y += dy;
		}
	} else if (dy > 0.01) {
		if (game.level.collides(entity.x, entity.y + dy + 0.2)) {
			hit = true;
			entity.y = Math.floor(entity.y) + 0.4
		} else {
			entity.y += dy;
		}
	}

	return hit;
}
