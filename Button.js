import { COLORS, CANVAS_HEIGHT, CANVAS_WIDTH} from "./utility.js";

const BUTTON_INITIAL_VELOCITY = 8;
const BUTTON_HEIGHT =40;
const BUTTON_WIDTH =80;

export default class Button{
    #color;
    #pos;

    constructor(pos, vel){
        this.#color = COLORS[0];
        this.#pos = {x:pos.x, y:pos.y}; // Left Top Position
        this.velocity = {x:vel.x, y:vel.y};
        const d = new Date();
        this.initialTime = d.getTime();
    }
    toStr(){
        return `Button ${this.#color}, ${this.getColr()}`;
    }
    center(){
        return {x:this.#pos.x+BUTTON_WIDTH/2, y:this.#pos.y+BUTTON_HEIGHT/2};
    }
    timeDiff(){
        const d = new Date();
        return (Math.abs(d.getTime() - this.initialTime))/1000;
    }
    get color(){
        if (this.#color===COLORS[0]){
            let tm = this.timeDiff();
            return COLORS[Math.floor((tm))%3];
        }
        return this.#color;
    }
    move(vel = this.velocity){
        let newX = this.#pos.x + vel.x;
        let newY = this.#pos.y + vel.y;
        if (newX<0 || newX>=CANVAS_WIDTH-BUTTON_WIDTH){
            this.velocity.x*=-1;
        }else{
            this.#pos.x=newX;
        }
        if (newY<0 || newY>=CANVAS_HEIGHT-BUTTON_HEIGHT){
            this.velocity.y*=-1;
        }else{
            this.#pos.y=newY;
        }
    }

    distNeutralized(button){
        return {
            distX:(this.center().x - button.center().x) / BUTTON_WIDTH, 
            distY:(this.center().y - button.center().y) / BUTTON_HEIGHT,
            neutralized: (this.#color==COLORS[0] && button.#color==COLORS[2]) ||
                        (this.#color==COLORS[2] && button.#color==COLORS[0]) ||
                        (this.#color==COLORS[1] && button.#color==COLORS[2]) ||
                        (this.#color==COLORS[2] && button.#color==COLORS[1])
        };
    }

    magicHit(){
        let score = false;
        let burst = false;
        if (this.#color===COLORS[0]){
            this.#color = this.color;
            score = true;
        }
        if (this.#color === COLORS[0]){
            this.move({
                x: -BUTTON_WIDTH / 2,
                y: -BUTTON_HEIGHT / 2
            });
            burst = true;
        }
        return {scoreUpdate:score, burst:burst};
    }

    contains(point){
        return (
            Math.abs(point.x - this.center().x) <= BUTTON_WIDTH / 2 && 
            Math.abs(point.y - this.center().y) <= BUTTON_HEIGHT / 2
        );
    }

    draw(canvas) {
        const context = canvas.getContext('2d');
        context.save();
        // Define the button styles
        const buttonColor = this.color;
        const buttonBorderWidth = 2;
        const buttonBorderColor = '#333';
        const buttonCornerRadius = 8;
      
        // Draw the button background with rounded corners
        context.fillStyle = buttonColor;
        context.beginPath();
        context.moveTo(
            this.#pos.x + buttonCornerRadius, 
            this.#pos.y
        );
        context.lineTo(
            this.#pos.x + BUTTON_WIDTH - buttonCornerRadius, 
            this.#pos.y
        );
        context.quadraticCurveTo(
            this.#pos.x + BUTTON_WIDTH, 
            this.#pos.y, 
            this.#pos.x + BUTTON_WIDTH, 
            this.#pos.y + buttonCornerRadius
        );
        context.lineTo(
            this.#pos.x + BUTTON_WIDTH, 
            this.#pos.y + BUTTON_HEIGHT - buttonCornerRadius
        );
        context.quadraticCurveTo(
            this.#pos.x + BUTTON_WIDTH, 
            this.#pos.y + BUTTON_HEIGHT, 
            this.#pos.x + BUTTON_WIDTH - buttonCornerRadius, 
            this.#pos.y + BUTTON_HEIGHT
        );
        context.lineTo(
            this.#pos.x + buttonCornerRadius, 
            this.#pos.y + BUTTON_HEIGHT
        );
        context.quadraticCurveTo(
            this.#pos.x, 
            this.#pos.y + BUTTON_HEIGHT, 
            this.#pos.x, 
            this.#pos.y + BUTTON_HEIGHT - buttonCornerRadius
        );
        context.lineTo(
            this.#pos.x, 
            this.#pos.y + buttonCornerRadius
        );
        context.quadraticCurveTo(
            this.#pos.x, 
            this.#pos.y, 
            this.#pos.x + buttonCornerRadius, 
            this.#pos.y
        );
        context.closePath();
        context.fill();
      
        // Draw the button border
        context.lineWidth = buttonBorderWidth;
        context.strokeStyle = buttonBorderColor;
        context.stroke();
      
        context.restore();
      }
      
      
    drawRect(canvas){
        const context = canvas.getContext('2d');
        context.save();
        context.fillStyle = this.getColr();
        context.fillRect(
            this.#pos.x, 
            this.#pos.y,
            BUTTON_WIDTH,
            BUTTON_HEIGHT
        );
        context.restore();
    }
}