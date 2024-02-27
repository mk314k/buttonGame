import { COLORS, PALETTE, CANVAS_HEIGHT, CANVAS_WIDTH } from "./utility.js";

export const BUTTON_HEIGHT = 48;
export const BUTTON_WIDTH = 98;
const CYCLE_SECONDS = 1.15;

export default class Button {
  #color;
  #pos;

  constructor(pos, vel) {
    this.#color = COLORS[0]; // 'blue' means unlocked/cycling Magic Button
    this.#pos = {
      x: Math.max(6, Math.min(CANVAS_WIDTH - BUTTON_WIDTH - 6, pos.x)),
      y: Math.max(6, Math.min(CANVAS_HEIGHT - BUTTON_HEIGHT - 6, pos.y)),
    };
    this.velocity = { x: vel.x, y: vel.y };
    this.initialTime = performance.now();
  }

  /** Whether this button is still a cycling, clickable Magic button. */
  get isMagic() {
    return this.#color === COLORS[0];
  }

  /** Locked state ('blue' if still cycling magic, or 'green' / 'red' once locked). */
  get lockedType() {
    return this.#color;
  }

  center() {
    return {
      x: this.#pos.x + BUTTON_WIDTH / 2,
      y: this.#pos.y + BUTTON_HEIGHT / 2,
    };
  }

  elapsedSeconds() {
    return Math.max(0, (performance.now() - this.initialTime) / 1000);
  }

  /** Progress within the current color phase in [0, 1). */
  phaseProgress() {
    if (!this.isMagic) return 1;
    const cyclePos = this.elapsedSeconds() / CYCLE_SECONDS;
    return cyclePos - Math.floor(cyclePos);
  }

  /** Current displayed color ('blue', 'green', or 'red'). */
  get color() {
    if (this.#color === COLORS[0]) {
      const idx = Math.floor(this.elapsedSeconds() / CYCLE_SECONDS) % 3;
      return COLORS[idx];
    }
    return this.#color;
  }

  move(vel = this.velocity) {
    const newX = this.#pos.x + vel.x;
    const newY = this.#pos.y + vel.y;

    if (newX <= 0) {
      this.#pos.x = 0;
      this.velocity.x = Math.abs(this.velocity.x);
    } else if (newX >= CANVAS_WIDTH - BUTTON_WIDTH) {
      this.#pos.x = CANVAS_WIDTH - BUTTON_WIDTH;
      this.velocity.x = -Math.abs(this.velocity.x);
    } else {
      this.#pos.x = newX;
    }

    if (newY <= 0) {
      this.#pos.y = 0;
      this.velocity.y = Math.abs(this.velocity.y);
    } else if (newY >= CANVAS_HEIGHT - BUTTON_HEIGHT) {
      this.#pos.y = CANVAS_HEIGHT - BUTTON_HEIGHT;
      this.velocity.y = -Math.abs(this.velocity.y);
    } else {
      this.#pos.y = newY;
    }
  }

  distNeutralized(other) {
    const a = this.#color;
    const b = other.#color;
    const isRedCollision =
      (a === COLORS[2] && (b === COLORS[0] || b === COLORS[1])) ||
      (b === COLORS[2] && (a === COLORS[0] || a === COLORS[1]));
    const isShieldSave =
      (a === COLORS[1] && b === COLORS[2]) ||
      (a === COLORS[2] && b === COLORS[1]);

    return {
      distX: (this.center().x - other.center().x) / BUTTON_WIDTH,
      distY: (this.center().y - other.center().y) / BUTTON_HEIGHT,
      neutralized: isRedCollision,
      shieldSave: isShieldSave,
    };
  }

  magicHit() {
    let score = false;
    let burst = false;
    let lockedTo = null;

    if (this.#color === COLORS[0]) {
      const activeColor = this.color;
      this.#color = activeColor;
      lockedTo = activeColor;
      score = true;

      if (this.#color === COLORS[0]) {
        this.move({
          x: -BUTTON_WIDTH / 3,
          y: -BUTTON_HEIGHT / 3,
        });
        burst = true;
      }
    }

    return { scoreUpdate: score, burst, lockedTo };
  }

  contains(point) {
    return (
      Math.abs(point.x - this.center().x) <= BUTTON_WIDTH / 2 + 4 &&
      Math.abs(point.y - this.center().y) <= BUTTON_HEIGHT / 2 + 4
    );
  }

  #roundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  draw(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.save();

    const activeColor = this.color;
    const style = PALETTE[activeColor] || PALETTE.blue;
    const x = this.#pos.x;
    const y = this.#pos.y;
    const r = 12;

    // 1. Soft drop shadow + 3D Keycap Base Lip
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    this.#roundedRect(ctx, x, y + 6, BUTTON_WIDTH, BUTTON_HEIGHT - 2, r);
    ctx.fillStyle = style.lip;
    ctx.fill();

    // 2. Top Keycap Surface
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    this.#roundedRect(ctx, x, y, BUTTON_WIDTH, BUTTON_HEIGHT - 5, r);
    const grad = ctx.createLinearGradient(x, y, x, y + BUTTON_HEIGHT - 5);
    grad.addColorStop(0, style.fillTop);
    grad.addColorStop(1, style.fillBottom);
    ctx.fillStyle = grad;
    ctx.fill();

    // Top soft highlight
    this.#roundedRect(ctx, x + 7, y + 3, BUTTON_WIDTH - 14, 6, 3);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.fill();

    // Border: warm amber-cream ring for clickable Magic buttons, subtle border for locked tiles
    this.#roundedRect(ctx, x, y, BUTTON_WIDTH, BUTTON_HEIGHT - 5, r);
    ctx.lineWidth = this.isMagic ? 2.5 : 1.5;
    ctx.strokeStyle = this.isMagic ? '#fde68a' : style.border;
    ctx.stroke();

    // Friendly Rounded Game Label
    ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
    ctx.font = '600 12.5px "Fredoka", "Nunito", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const labelText = this.isMagic ? `★ ${style.label}` : style.label;
    ctx.fillText(labelText, x + BUTTON_WIDTH / 2, y + (BUTTON_HEIGHT - 5) / 2 - (this.isMagic ? 2 : -1));
    ctx.fillStyle = '#ffffff';
    ctx.fillText(labelText, x + BUTTON_WIDTH / 2, y + (BUTTON_HEIGHT - 5) / 2 - (this.isMagic ? 3 : 0));

    // Phase countdown bar on Magic buttons
    if (this.isMagic) {
      const barPad = 12;
      const barW = BUTTON_WIDTH - barPad * 2;
      const barH = 4;
      const barX = x + barPad;
      const barY = y + BUTTON_HEIGHT - 13;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
      ctx.fillRect(barX, barY, barW, barH);

      ctx.fillStyle = '#fde68a';
      ctx.fillRect(barX, barY, barW * (1 - this.phaseProgress()), barH);
    }

    ctx.restore();
  }
}
