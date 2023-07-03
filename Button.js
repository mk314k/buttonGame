


export default class Button{
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
    draw(canvas) {
        const context = canvas.getContext('2d');
        context.save();
      
        // Define the button styles
        const buttonColor = this.getColr();
        const buttonBorderWidth = 2;
        const buttonBorderColor = '#333';
        const buttonCornerRadius = 8;
      
        // Draw the button background with rounded corners
        context.fillStyle = buttonColor;
        context.beginPath();
        context.moveTo(this.leftTop.x + buttonCornerRadius, this.leftTop.y);
        context.lineTo(this.leftTop.x + BUTTON_WIDTH - buttonCornerRadius, this.leftTop.y);
        context.quadraticCurveTo(this.leftTop.x + BUTTON_WIDTH, this.leftTop.y, this.leftTop.x + BUTTON_WIDTH, this.leftTop.y + buttonCornerRadius);
        context.lineTo(this.leftTop.x + BUTTON_WIDTH, this.leftTop.y + BUTTON_HEIGHT - buttonCornerRadius);
        context.quadraticCurveTo(this.leftTop.x + BUTTON_WIDTH, this.leftTop.y + BUTTON_HEIGHT, this.leftTop.x + BUTTON_WIDTH - buttonCornerRadius, this.leftTop.y + BUTTON_HEIGHT);
        context.lineTo(this.leftTop.x + buttonCornerRadius, this.leftTop.y + BUTTON_HEIGHT);
        context.quadraticCurveTo(this.leftTop.x, this.leftTop.y + BUTTON_HEIGHT, this.leftTop.x, this.leftTop.y + BUTTON_HEIGHT - buttonCornerRadius);
        context.lineTo(this.leftTop.x, this.leftTop.y + buttonCornerRadius);
        context.quadraticCurveTo(this.leftTop.x, this.leftTop.y, this.leftTop.x + buttonCornerRadius, this.leftTop.y);
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
        context.fillRect(this.leftTop.x, this.leftTop.y,BUTTON_WIDTH,BUTTON_HEIGHT);
        context.restore();
    }
}