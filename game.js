import Button from "./Button.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./utility.js";

class ButtonGame {
  #score;
  #canvas;
  #scoreElement;
  #buttons;
  #speed;
  #gameOver;

  constructor(canvas) {
    this.#score = 0;
    this.#speed = 2.4;
    this.#buttons = [];
    this.#gameOver = false;
    this.#canvas = canvas;
    this.#scoreElement = document.getElementById("score");
    this.#updateScore();
  }

  #updateScore() {
    if (this.#scoreElement) {
      this.#scoreElement.innerHTML = `${this.#score}`;
    }
  }

  reset() {
    this.#score = 0;
    this.#speed = 2.4;
    this.#buttons = [];
    this.#gameOver = false;
    this.#updateScore();
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
      this.#push({ x: x1, y: y1 }, { x: this.#speed, y: this.#speed });
      if (x1 < CANVAS_WIDTH / 2) {
        this.#buttons[0].velocity.x *= -1;
      }
      if (y1 > CANVAS_HEIGHT / 2) {
        this.#buttons[0].velocity.y *= -1;
      }
    } else {
      this.#hit({ x: x1, y: y1 });
    }
  }

  #push(point, velocity) {
    this.#buttons.push(new Button(point, velocity));
  }

  redrawCanvas() {
    const context = this.#canvas.getContext("2d");
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (this.#buttons.length === 0) {
      this.#drawPrompt(context, "Tap Anywhere to Start", "Tap ★ Magic tiles on Sky Blue to split, Mint to shield, avoid Coral!");
      return;
    }

    const removedIndices = new Set();
    for (let i = 0; i < this.#buttons.length; i++) {
      if (removedIndices.has(i)) continue;
      for (let j = i + 1; j < this.#buttons.length; j++) {
        if (removedIndices.has(j)) continue;
        const dist = this.#buttons[i].distNeutralized(this.#buttons[j]);
        if (Math.abs(dist.distX) <= 1 && Math.abs(dist.distY) <= 1) {
          if (dist.neutralized) {
            removedIndices.add(i);
            removedIndices.add(j);
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
    }

    for (const button of this.#buttons) {
      button.move();
      button.draw(this.#canvas);
    }

    if (this.magicCount() === 0 && (this.#buttons.length > 0 || this.#score > 0)) {
      this.#gameOver = true;
      this.#drawPrompt(
        context,
        `Round Over — ${this.#score} pts`,
        "No Magic tiles remaining · Tap anywhere to play again!"
      );
    }
  }

  #drawPrompt(ctx, title, subtitle) {
    ctx.save();
    ctx.fillStyle = "rgba(30, 34, 45, 0.92)";
    ctx.fillRect(100, CANVAS_HEIGHT / 2 - 72, CANVAS_WIDTH - 200, 144);
    ctx.strokeStyle = "rgba(253, 230, 138, 0.35)";
    ctx.lineWidth = 2;
    ctx.strokeRect(100, CANVAS_HEIGHT / 2 - 72, CANVAS_WIDTH - 200, 144);

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
        const result = button.magicHit();
        if (result.burst) {
          this.#push(
            { x: button.center().x, y: button.center().y },
            { x: -1 * button.velocity.x, y: -1 * button.velocity.y }
          );
        }
        if (result.scoreUpdate) {
          this.#score += 5;
          this.#speed = 2.4 + (7.6 * 0.0069 * this.#score) / (1 + 0.0069 * this.#score);
          this.#updateScore();
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

const game = new ButtonGame(canvas);

canvas.addEventListener("mousedown", function (e) {
  game.handleClick(e);
});

function refreshScreen() {
  game.redrawCanvas();
}

setInterval(refreshScreen, 33);
