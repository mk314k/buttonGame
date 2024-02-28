import Button from "./Button.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./utility.js";

const BEST_SCORE_KEY = "button_collision_best_score";

class ButtonGame {
  #score;
  #bestScore;
  #canvas;
  #scoreElement;
  #bestElement;
  #magicElement;
  #speedElement;
  #buttons;
  #effects;
  #speed;
  #gameOver;

  constructor(canvas) {
    this.#score = 0;
    this.#bestScore = Number(localStorage.getItem(BEST_SCORE_KEY) || 0);
    this.#speed = 2.4;
    this.#buttons = [];
    this.#effects = [];
    this.#gameOver = false;
    this.#canvas = canvas;
    this.#scoreElement = document.getElementById("score");
    this.#bestElement = document.getElementById("bestScore");
    this.#magicElement = document.getElementById("magicCount");
    this.#speedElement = document.getElementById("speedMult");
    this.#updateHUD();
  }

  #addPoints(pts) {
    this.#score += pts;
    if (this.#score > this.#bestScore) {
      this.#bestScore = this.#score;
      try {
        localStorage.setItem(BEST_SCORE_KEY, String(this.#bestScore));
      } catch {
        // Ignore storage errors
      }
    }
    this.#speed = 2.4 + (7.6 * 0.0069 * this.#score) / (1 + 0.0069 * this.#score);
    this.#updateHUD();
  }

  #updateHUD() {
    if (this.#scoreElement) {
      this.#scoreElement.textContent = `${this.#score}`;
    }
    if (this.#bestElement) {
      this.#bestElement.textContent = `${this.#bestScore}`;
    }
    if (this.#magicElement) {
      this.#magicElement.textContent = `${this.magicCount()}`;
    }
    if (this.#speedElement) {
      const mult = (this.#speed / 2.4).toFixed(1);
      this.#speedElement.textContent = `${mult}x`;
    }
  }

  reset() {
    this.#score = 0;
    this.#speed = 2.4;
    this.#buttons = [];
    this.#effects = [];
    this.#gameOver = false;
    this.#updateHUD();
  }

  magicCount() {
    let count = 0;
    for (const b of this.#buttons) {
      if (b.isMagic) count++;
    }
    return count;
  }

  handleClick(event) {
    const rect = this.#canvas.getBoundingClientRect();
    const x1 = (CANVAS_WIDTH * (event.clientX - rect.left)) / rect.width;
    const y1 = (CANVAS_HEIGHT * (event.clientY - rect.top)) / rect.height;

    if (this.#gameOver) {
      this.reset();
    }

    if (this.#buttons.length === 0) {
      this.#push({ x: x1 - 49, y: y1 - 24 }, { x: this.#speed, y: this.#speed });
      if (x1 < CANVAS_WIDTH / 2) {
        this.#buttons[0].velocity.x *= -1;
      }
      if (y1 > CANVAS_HEIGHT / 2) {
        this.#buttons[0].velocity.y *= -1;
      }
      this.#spawnEffect(x1, y1, "Start!", "#fde68a");
      this.#updateHUD();
    } else {
      this.#hit({ x: x1, y: y1 });
    }
  }

  #push(point, velocity) {
    this.#buttons.push(new Button(point, velocity));
  }

  #spawnEffect(x, y, text, color) {
    this.#effects.push({ x, y, text, color, age: 0, maxAge: 28 });
  }

  #drawBoardDots(ctx) {
    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    const step = 50;
    for (let x = step; x < CANVAS_WIDTH; x += step) {
      for (let y = step; y < CANVAS_HEIGHT; y += step) {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  redrawCanvas() {
    const context = this.#canvas.getContext("2d");
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    this.#drawBoardDots(context);

    if (this.#buttons.length === 0 && !this.#gameOver) {
      this.#drawPrompt(
        context,
        "Tap Anywhere to Start",
        "Tap ★ Magic tiles on Sky Blue to split (+5) · Mint to shield (+5) · Avoid Coral!"
      );
      return;
    }

    const removedIndices = new Set();
    for (let i = 0; i < this.#buttons.length; i++) {
      if (removedIndices.has(i)) continue;
      for (let j = i + 1; j < this.#buttons.length; j++) {
        if (removedIndices.has(j)) continue;
        const dist = this.#buttons[i].distNeutralized(this.#buttons[j]);
        if (Math.abs(dist.distX) <= 1 && Math.abs(dist.distY) <= 1) {
          const midX = (this.#buttons[i].center().x + this.#buttons[j].center().x) / 2;
          const midY = (this.#buttons[i].center().y + this.#buttons[j].center().y) / 2;

          if (dist.neutralized) {
            removedIndices.add(i);
            removedIndices.add(j);
            if (dist.shieldSave) {
              this.#addPoints(10);
              this.#spawnEffect(midX, midY, "+10 Shield Save!", "#6ee7b7");
            } else {
              this.#spawnEffect(midX, midY, "Popped!", "#fda4af");
            }
            break;
          } else {
            const dx = dist.distX === 0 ? 0.5 : dist.distX;
            const dy = dist.distY === 0 ? 0.5 : dist.distY;
            this.#buttons[j].velocity = {
              x: -1 * this.#speed * dx,
              y: -1 * this.#speed * dy,
            };
            this.#buttons[i].velocity = {
              x: this.#speed * dx,
              y: this.#speed * dy,
            };
          }
        }
      }
    }

    if (removedIndices.size > 0) {
      this.#buttons = this.#buttons.filter((_, idx) => !removedIndices.has(idx));
      this.#updateHUD();
    }

    for (const button of this.#buttons) {
      button.move();
      button.draw(this.#canvas);
    }

    // Draw soft ripple popups
    for (let i = this.#effects.length - 1; i >= 0; i--) {
      const fx = this.#effects[i];
      fx.age += 1;
      const progress = fx.age / fx.maxAge;
      const alpha = Math.max(0, 1 - progress);

      context.save();
      context.globalAlpha = alpha;
      context.strokeStyle = fx.color;
      context.lineWidth = 2.5;
      context.beginPath();
      context.arc(fx.x, fx.y, 14 + progress * 36, 0, Math.PI * 2);
      context.stroke();

      context.fillStyle = fx.color;
      context.font = '600 17px "Fredoka", system-ui, sans-serif';
      context.textAlign = "center";
      context.fillText(fx.text, fx.x, fx.y - 16 - progress * 24);
      context.restore();

      if (fx.age >= fx.maxAge) {
        this.#effects.splice(i, 1);
      }
    }

    if (this.magicCount() === 0 && (this.#buttons.length > 0 || this.#score > 0)) {
      this.#gameOver = true;
      this.#drawPrompt(
        context,
        `Round Over — ${this.#score} pts`,
        `Best Score: ${this.#bestScore} · Tap anywhere to play again!`
      );
    }
  }

  #drawPrompt(ctx, title, subtitle) {
    ctx.save();
    ctx.fillStyle = "rgba(30, 34, 45, 0.92)";
    ctx.fillRect(95, CANVAS_HEIGHT / 2 - 74, CANVAS_WIDTH - 190, 148);
    ctx.strokeStyle = "rgba(253, 230, 138, 0.35)";
    ctx.lineWidth = 2;
    ctx.strokeRect(95, CANVAS_HEIGHT / 2 - 74, CANVAS_WIDTH - 190, 148);

    ctx.fillStyle = "#fde68a";
    ctx.font = '600 28px "Fredoka", system-ui, sans-serif';
    ctx.textAlign = "center";
    ctx.fillText(title, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 14);

    ctx.fillStyle = "#cbd5e1";
    ctx.font = '600 15px "Nunito", system-ui, sans-serif';
    ctx.fillText(subtitle, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 24);
    ctx.restore();
  }

  #hit(point) {
    for (let i = this.#buttons.length - 1; i >= 0; i--) {
      const button = this.#buttons[i];
      if (button.contains(point)) {
        const cx = button.center().x;
        const cy = button.center().y;
        const result = button.magicHit();
        if (result.burst) {
          this.#push(
            { x: cx - 22, y: cy - 12 },
            { x: -1 * button.velocity.x, y: -1 * button.velocity.y }
          );
          this.#spawnEffect(cx, cy, "+5 Split!", "#7dd3fc");
        } else if (result.lockedTo === "green") {
          this.#spawnEffect(cx, cy, "+5 Shield!", "#6ee7b7");
        } else if (result.lockedTo === "red") {
          this.#spawnEffect(cx, cy, "+5 Hazard!", "#fda4af");
        }
        if (result.scoreUpdate) {
          this.#addPoints(5);
        }
        break;
      }
    }
  }

  get board() {
    return this.#buttons;
  }
}

const canvas = document.getElementById("canvas");
canvas.height = CANVAS_HEIGHT;
canvas.width = CANVAS_WIDTH;

export const game = new ButtonGame(canvas);

canvas.addEventListener("mousedown", function (e) {
  game.handleClick(e);
});

const resetBtn = document.getElementById("resetBtn");
if (resetBtn) {
  resetBtn.addEventListener("click", () => game.reset());
}

function refreshScreen() {
  game.redrawCanvas();
}

setInterval(refreshScreen, 30);

// Social icons
const links = {
  github: { url: "https://github.com/mk314k", icon: "fa-brands fa-github" },
  linkedin: { url: "https://www.linkedin.com/in/mk314k/", icon: "fa-brands fa-linkedin" },
  envelope: { url: "mailto:mk314k@mit.edu", icon: "fa-solid fa-envelope" },
};

const socialIcons = document.getElementById("social-icons");
if (socialIcons) {
  socialIcons.innerHTML = Object.values(links)
    .map(
      ({ url, icon }) => `
      <div class="icon">
        <a href="${url}" target="_blank" rel="noopener noreferrer">
          <i class="${icon}"></i>
        </a>
      </div>`
    )
    .join("");
}
