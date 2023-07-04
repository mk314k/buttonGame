import { COLORS, vel, speed, CANVAS_HEIGHT, CANVAS_WIDTH, BUTTON_WIDTH, BUTTON_HEIGHT } from "./utility.js";

const BUTTON_INITIAL_VELOCITY = 1;

export default class Button{
    #color;
    #pos;

    constructor(leftX, leftY){
        this.#color = COLORS[0];
        this.#pos = {x:leftX, y:leftY}; // Left Top Position
        this.velocity = {x:BUTTON_INITIAL_VELOCITY, y:BUTTON_INITIAL_VELOCITY};
        if (this.#pos.x < CANVAS_WIDTH/2){
            this.velocity.x *=-1;
        }
        if (this.#pos.y < CANVAS_HEIGHT/2){
            this.velocity.y *=-1;
        }
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
    move(){
        let newX = this.#pos.x + this.velocity.x;
        let newY = this.#pos.y + this.velocity.y;
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
    distanceNorm(button){
        return {
            x:(this.center().x - button.center().x) / BUTTON_WIDTH, 
            y:(this.center().y - button.center().y) / BUTTON_HEIGHT
        };
    }

    magicHit(){
        if (this.#color===COLORS[0]){
            this.#pos.x -= BUTTON_WIDTH / 2;
            this.#pos.y -= BUTTON_HEIGHT / 2;
            this.#color = this.color;
        }
        return (this.#color === COLORS[0]);
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