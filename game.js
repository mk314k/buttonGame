import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./utility.js";

class ButtonGame{
    #score;
    #canvas;
    #scoreElement;

    constructor(){
        this.#score =0;
        this.#canvas = document.getElementById("canvas");
        this.#scoreElement = document.getElementById("score");
        this.updateScore();
    }
    redrawCanvas(){
        this.points +=0;
    }
    get score(){
        return this.#score;
    }
    updateScore(){
        this.#scoreElement.innerHTML = `Points: ${this.#score}`;
    }

}

function refreshScreen() {
    game.redrawCanvas();
    game.updateScore();
    // console.log("updated");
}

// function getMousePosition(canvas, event) {
//     let rect = canvas.getBoundingClientRect();
//     let x1 = (event.clientX - rect.left)/rect.width;
//     let y1 = (event.clientY - rect.top)/rect.height;
//     return {x:x1*canvas.width, y:y1*canvas.height};
// }

const game = new ButtonGame();

// const score = document.getElementById('score');
// const canvas = document.getElementById("canvas");
// canvas.height=CANVAS_HEIGHT;
// canvas.width=CANVAS_WIDTH;


// canvas.addEventListener("mousedown", function(e)
// {
//     let pnt = getMousePosition(canvas, e);
//     buttons.hit(pnt);
// });




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

    