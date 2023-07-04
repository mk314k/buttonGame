import Button from "./Button.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, COLORS } from "./utility.js";

class ButtonGame{
    #score;
    #canvas;
    #scoreElement;
    #buttons;
    #speed;

    constructor(canvas){
        this.#score = 0;
        this.#speed = 2;
        this.#buttons = [];
        this.#canvas = canvas;
        this.#scoreElement = document.getElementById("score");
        this.updateScore();
    }
    updateScore(){
        this.#scoreElement.innerHTML = `Points: ${this.#score}`;
    }
    handleClick(event){
        let rect = this.#canvas.getBoundingClientRect();
        let x1 = CANVAS_WIDTH * (event.clientX - rect.left) / rect.width;
        let y1 = CANVAS_HEIGHT * (event.clientY - rect.top) / rect.height;
        if (this.#buttons.length==0){
            this.#push({x:x1, y:y1}, {x:this.#speed, y:this.#speed})
        }else{
            this.#hit({x:x1, y:y1})
        }
    }
    #push(point, velocity){
        this.#buttons.push(new Button(point, velocity));
    }
    redrawCanvas(){
        if (this.#buttons.length>0){
            const context = this.#canvas.getContext('2d');
            context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            for (let i=0; i<this.#buttons.length; i++){
                for (let j=i+1; j<this.#buttons.length; j++){
                    let dist = this.#buttons[i].distNeutralized(this.#buttons[j]);
                    if (Math.abs(dist.x)<=1 && Math.abs(dist.y)<=1){
                        if (dist.neutralized){
                            this.#buttons.splice(j,1);
                            this.#buttons.splice(i,1);
                        }else{
                            this.#buttons[j].velocity = {x:-1*this.#speed*dist.distX,y:-1*this.#speed*dist.distY};
                            this.#buttons[i].velocity = {x:this.#speed*dist.distX,y:this.#speed*dist.distY};
                        }
                    }
                }
            }
            for (let button of this.#buttons){
                button.move();
                button.draw(this.#canvas);
            }
        }
    }
    #hit(point){
        for (let button of this.#buttons){
            if (button.contains(point)){
                let result = button.magicHit();
                console.log(result);
                if (result.burst){
                    this.#push(
                        {x:button.center().x,y:button.center().y},
                        {x:-1*button.velocity.x, y:-1*button.velocity.y}
                    );
                }
                if (result.scoreUpdate){
                    this.#score += 5;
                    this.updateScore();
                }
                break;
            }
        }
    }
    get board(){
        return this.#buttons;
    }

}

const canvas = document.getElementById("canvas");
canvas.height=CANVAS_HEIGHT;
canvas.width=CANVAS_WIDTH;

const game = new ButtonGame(canvas);

canvas.addEventListener("mousedown", function(e)
{
    game.handleClick(e);
});


function refreshScreen() {
    game.redrawCanvas();
}

var myInterval = setInterval(refreshScreen, 40);


// social icons
const links = new Map();
links['github'] = 'https://github.com/mk314k';
links['facebook'] = 'https://www.facebook.com/mk3.14k/';
links['envelope'] = 'mailto:mk314k@mit.edu';
links['linkedin'] = 'https://www.linkedin.com/in/mk314k/';

function getIcon(iLink='facebook', iClass= 'fa-brands'){
    return `
    <div class="icon">
        <a href="${links[iLink]}">
            <i class="${iClass} fa-${iLink}"></i>
        </a>
    </div>
    `;
}

const socialIcons = document.getElementById("social-icons");
socialIcons.innerHTML = `
${getIcon('facebook', 'fa-brands')}
${getIcon('envelope', 'fa')}
${getIcon('github', 'fa-brands')}
${getIcon('linkedin', 'fa-brands')}
`

    