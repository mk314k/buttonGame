import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./utility.js";

class ButtonGame{
    #score;
    #canvas;
    #scoreElement;
    #buttons;

    constructor(canvas){
        this.#score =0;
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
        let x1 = (event.clientX - rect.left)/rect.width;
        let y1 = (event.clientY - rect.top)/rect.height;
        console.log(`x1: ${x1}  y1 ${y1}`);
        return {x:x1*CANVAS_WIDTH, y:y1*CANVAS_HEIGHT};
    }
    pushButton(btn){
        this.buttons.push(btn);
    }
    push(x,y){
        this.buttons.push(new Button(x,y));
    }
    redrawCanvas(){
        if (this.#buttons.length>0){
            const context = this.#canvas.getContext('2d');
            context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            for (let i=0; i<this.#buttons.length; i++){
                for (let j=i+1; j<this.#buttons.length; j++){
                    let dist = this.#buttons[i].distanceNorm(this.#buttons[j]);
                    if (Math.abs(dist.x)<=1 && Math.abs(dist.y)<=1){
                        if (
                            (this.#buttons[i].colr==COLORS[0] && this.#buttons[j].colr==COLORS[2]) ||
                            (this.#buttons[j].colr==COLORS[0] && this.#buttons[i].colr==COLORS[2]) ||
                            (this.#buttons[i].colr==COLORS[1] && this.#buttons[j].colr==COLORS[2]) ||
                            (this.#buttons[i].colr==COLORS[2] && this.#buttons[j].colr==COLORS[1])
                        ){
                            this.#buttons.splice(j,1);
                            this.#buttons.splice(i,1);
                        }else{
                            this.#buttons[j].moveDirec = {x:-1*dist.x,y:-1*dist.y};
                            this.#buttons[i].moveDirec = {x:dist.x,y:dist.y};
                        }
                    }
                }
            }
            for (let button of this.#buttons){
                button.move();
                button.draw(canvas);
            }
        }
    }
    #hit(pnt){
        for (let button of this.#buttons){
            if (button.contains(pnt)){
                if (button.hit()){
                    button.leftTop.x -=BUTTON_WIDTH/2;
                    button.leftTop.y-=BUTTON_HEIGHT/2;
                    this.push(button.center().x,button.center().y);
                }
                break;
            }
        }
    }

}



// function getMousePosition(canvas, event) {
//     let rect = canvas.getBoundingClientRect();
//     let x1 = (event.clientX - rect.left)/rect.width;
//     let y1 = (event.clientY - rect.top)/rect.height;
//     return {x:x1*canvas.width, y:y1*canvas.height};
// }



// const score = document.getElementById('score');
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
    game.updateScore();
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

    