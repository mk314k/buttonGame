import Button from "./Button.js";

let COLORS = ['blue','green','red'];
const BUTTON_HEIGHT =40;
const BUTTON_WIDTH =80;
const CANVAS_HEIGHT = 800;
const CANVAS_WIDTH = 800;
let speed = 8;
let points =0;
const vel = 1;

export default class ButtonSet{
    constructor(){
        this.buttons = [];
    }
    toStr(){
        return `Buttons`;
    }
    pushButton(btn){
        this.buttons.push(btn);
    }
    push(x,y){
        this.buttons.push(new Button(x,y));
    }
    draw(canvas){
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        for (let i=0; i<this.buttons.length; i++){
            for (let j=i+1; j<this.buttons.length; j++){
                let dist = this.buttons[i].distanceNorm(this.buttons[j]);
                if (Math.abs(dist.x)<=1 && Math.abs(dist.y)<=1){
                    if (
                        (this.buttons[i].colr==COLORS[0] && this.buttons[j].colr==COLORS[2]) ||
                        (this.buttons[j].colr==COLORS[0] && this.buttons[i].colr==COLORS[2]) ||
                        (this.buttons[i].colr==COLORS[1] && this.buttons[j].colr==COLORS[2]) ||
                        (this.buttons[i].colr==COLORS[2] && this.buttons[j].colr==COLORS[1])
                    ){
                        this.buttons.splice(j,1);
                        this.buttons.splice(i,1);
                    }else{
                        this.buttons[j].moveDirec = {x:-1*dist.x,y:-1*dist.y};
                        this.buttons[i].moveDirec = {x:dist.x,y:dist.y};
                    }
                }
            }
        }
        for (let button of this.buttons){
            button.move();
            button.draw(canvas);
        }
    }
    hit(pnt){
        for (let button of this.buttons){
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

function refreshScreen() {
    buttons.draw(canvas);
    score.innerHTML =`Points: ${points}`;
}

function getMousePosition(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    let x1 = (event.clientX - rect.left)/rect.width;
    let y1 = (event.clientY - rect.top)/rect.height;
    return {x:x1*canvas.width, y:y1*canvas.height};
}



let buttons = new ButtonSet();
buttons.push(100,100);
let canvas = document.getElementById("canvas");
canvas.height=CANVAS_HEIGHT;
canvas.width=CANVAS_WIDTH;
let score = document.getElementById('score');
canvas.addEventListener("mousedown", function(e)
{
    let pnt = getMousePosition(canvas, e);
    buttons.hit(pnt);
});




var myInterval = setInterval(refreshScreen, 40);


    