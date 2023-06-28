let COLORS = ['blue','green','red'];
const BUTTON_HEIGHT =40;
const BUTTON_WIDTH =80;
const CANVAS_HEIGHT = 800;
const CANVAS_WIDTH = 800;
let speed = 8;
let points =0;
const vel = 1;

class Button{
    constructor(leftX,leftY){
        this.colr = COLORS[0];
        this.leftTop = {x:leftX, y:leftY};
        this.moveDirec = {x:vel,y:vel};
        const d = new Date();
        this.initialTime = d.getTime();
    }
    toStr(){
        return `Button ${this.colr}, ${this.getColr()}`;
    }
    center(){
        return {x:this.leftTop.x+BUTTON_WIDTH/2, y:this.leftTop.y+BUTTON_HEIGHT/2};
    }
    timeDiff(){
        const d = new Date();
        return (Math.abs(d.getTime() - this.initialTime))/1000;
    }
    getColr(){
        if (this.colr===COLORS[0]){
            let tm = this.timeDiff();
            return COLORS[Math.floor((tm))%3];
        }
        return this.colr;
    }
    move(){
        let newX = this.leftTop.x + speed*this.moveDirec.x;
        let newY = this.leftTop.y + speed*this.moveDirec.y;
        if (newX<0 || newX>=CANVAS_WIDTH-BUTTON_WIDTH){
            this.moveDirec.x*=-1;
        }else{
            this.leftTop.x=newX;
        }
        if (newY<0 || newY>=CANVAS_HEIGHT-BUTTON_HEIGHT){
            this.moveDirec.y*=-1;
        }else{
            this.leftTop.y=newY;
        }
    }
    distanceNorm(btn){
        return {x:(this.center().x-btn.center().x)/BUTTON_WIDTH, y:(this.center().y-btn.center().y)/BUTTON_HEIGHT};
    }

    hit(){
        if (this.colr===COLORS[0]){
            points +=5;
            this.colr = this.getColr();
        }
        return (this.colr === COLORS[0]);
    }
    contains(xy){
        return (Math.abs(xy.x-this.center().x)<=BUTTON_WIDTH/2 && Math.abs(xy.y-this.center().y)<=BUTTON_HEIGHT/2);
    }
    draw(canvas){
        const context = canvas.getContext('2d');
        context.save();
        context.fillStyle = this.getColr();
        context.fillRect(this.leftTop.x, this.leftTop.y,BUTTON_WIDTH,BUTTON_HEIGHT);
        context.restore();
    }
}

class ButtonSet{
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
    root.innerHTML =`<p>Points: ${points}</p>`;
}

function getMousePosition(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    let x1 = (event.clientX - rect.left)/rect.width;
    let y1 = (event.clientY - rect.top)/rect.height;
    console.log({x:x1*canvas.width, y:y1*canvas.height});
    return {x:x1*canvas.width, y:y1*canvas.height};
}



let buttons = new ButtonSet();
buttons.push(100,100);
let canvas = document.getElementById("canvas");
canvas.height=CANVAS_HEIGHT;
canvas.width=CANVAS_WIDTH;
let root = document.getElementById('root');
canvas.addEventListener("mousedown", function(e)
{
    let pnt = getMousePosition(canvas, e);
    buttons.hit(pnt);
});




var myInterval = setInterval(refreshScreen, 40);

    