const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const collisionCanvas = document.getElementById('collisionCanvas');
const collisionCtx = collisionCanvas.getContext('2d');
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;
//敵人出現時間;
let timetoNextEnemy=0;
let EnemyInterval = 500;
let lastTime=0;
let score =0;
let Life = 3;
let GameOver = false; 
ctx.font = '50px Impact';
let Start =0;
let Level ="Eazy";
let bg = new Image();
bg.src="sky.png";
let bg2 = new Image();
bg2.src = "bg2.jpg";
let bg3 = new Image();
bg3.src = "cara.jpg";
let Choose = new Audio();
Choose.src='boom.wav';
let BGM = new Audio();
BGM.src = 'battle.mp3';
let changelevel = 10;
var relen = ctx.measureText("RESTART").width;
var startlen=ctx.measureText("START GAME").width;
var eazylen=ctx.measureText("EAZY").width;// 100
var re_x_start =canvas.width/2 -relen/2;
var start_x_start = canvas.width/2 - startlen/2;
var eazy_x_start = canvas.width/2 - eazylen/2;
var dips = 90,dipsY=40;
// console.log(startlen);
function startMenu(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    collisionCtx.clearRect(0,0,canvas.width,canvas.height);
    setBackGround();
    ctx.fillStyle = 'black';
    ctx.fillText('START GAME',start_x_start,canvas.height/2-dips);
    ctx.fillText('Easy',eazy_x_start,canvas.height/2);
    ctx.fillText('Hard',eazy_x_start,canvas.height/2+dips);
    if(!Start)requestAnimationFrame(startMenu);
}
function setBackGround(){
    ctx.drawImage(bg,0,0,canvas.width,canvas.height);
}
function setBackGround2(){
    
    if(Level == 'Eazy' || Level == 'Normal'){
        Level = 'Normal';
        EnemyInterval = 450;
        ctx.drawImage(bg2,0,0,canvas.width,canvas.height);
    }
    if(Level == 'Hard' || Level =='Extra'){
        Level = 'Extra';
        EnemyInterval = 380;
        ctx.drawImage(bg3,0,0,canvas.width,canvas.height);
    }
    
}
let enemys = [];
class Enemy{
    constructor(){
        // 裁切 x 的長度
        this.spriteWidth = 271;
        //裁切 y 的長度
        this.spriteHeight = 194;
        //圖像大小
        this.sizeModifier = Math.random()*0.6+0.4;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height =this.spriteHeight * this.sizeModifier;
        //起點位置
        this.x = canvas.width;
        this.y = Math.random()*(canvas.height-this.height);
        //移動方向
        this.directtionX = Math.random()*5+3;
        this.directtionY = Math.random()*5-2.5;
        this.markForDelet = false;

        this.image = new Image();
        this.image.src = "raven.png";
        //需要將圖像分成幾分 來製作連續動畫
        this.frame=0;
        this.maxFrame=4;
        //揮動翅膀動畫的時間
        this.timeSinceFlap = 0;
        this.flapInterval = 400;
        //隨機附於顏色
        this.randomColors = [ Math.floor(Math.random()*255), Math.floor(Math.random()*255), Math.floor(Math.random()*255)];
        this.color = 'rgb(' + this.randomColors[0] + ',' + this.randomColors[1] + ',' + this.randomColors[2]+')';
    }
    update(deltatime){
        //碰到最高點跟最低點時，方向反轉
        if(this.y<0 || this.y>canvas.height-this.height){
            this.directtionY = this.directtionY*-1;
        }
        //Object移動的 x,y 變化量 
        this.x -= this.directtionX;
        this.y += this.directtionY;
        //超出Canvas範圍的物件
        if(this.x<0-this.width) {
            this.markForDelet=true;
            Life-=1;
        }
        if(Life<0) GameOver=true;
        //控制揮動翅膀的時間間隔
        this.timeSinceFlap += deltatime;
        if(this.timeSinceFlap > this.flapInterval){
            if(this.frame > this.maxFrame) this.frame=0;
            else this.frame++; 
            this.timeSinceFlap = 0;
        }
    }
    draw(){
        collisionCtx .fillStyle = this.color;
        collisionCtx .fillRect(this.x,this.y,this.width,this.height);//stroke 外框
        ctx.drawImage(this.image,
            this.frame*this.spriteWidth ,0,
            this.spriteWidth,this.spriteHeight,
            this.x,this.y,
            this.width,this.height);
        //draw( img, dx, dy )
        //draw( img, dx, dy, dw, dh )
        //draw( img, sx, sy, sw, sh, dx, dy, dw, dh )
        //sx :　裁切 x 的起點
        //sy :  裁切 y 的起點
        //sw :  裁切 x 的長度
        //sh :  裁切 y 的長度
        //dx :  畫布上放置圖像的x座標
        //dy :  畫布上放置圖像的y座標
        //dw :  (裁切之後)長度,放大或縮小
        //dh :  (裁切之後)寬度,放大或縮小
    }
}
 let explosions=[];
 class Explosion{
    constructor(x,y,size){
        this.image = new Image();
        this.image.src = 'boom.png';
        this.spriteWidth = 200;
        this.spriteHeight = 179;
        this.size = size;
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.sound = new Audio();
        this.sound.src ='boom.wav';
        //動畫的時間
        this.timeSinceLastFrame = 0;
        this.frameInterval = 50 ;
        this.markForDelet = false;
    }
    update(deltatime){
        //
        if(this.frame === 0) this.sound.play();
        this.timeSinceLastFrame += deltatime;
        if(this.timeSinceLastFrame>this.frameInterval){
            this.frame++;
            this.timeSinceLastFrame = 0;
            //動畫播完 標記刪除
            if(this.frame >5 )  this.markForDelet = true;
        }
    }
    draw(){
        ctx.drawImage(this.image,
            this.frame*this.spriteWidth,0,
            this.spriteWidth,this.spriteHeight,
            this.x,this.y,
            this.size,this.size);
    }
 };
function drawScore(){//紀錄分數
    ctx.fillText('LEVEL: '+Level,50,75);
    ctx.fillStyle = 'white';
    ctx.fillText('LEVEL: '+Level,54,80);
    ctx.fillStyle = 'black';
    ctx.fillText('Score: '+score,50,175);
    ctx.fillStyle = 'white';
    ctx.fillText('Score: '+score,54,180);
    ctx.fillStyle = 'black';
    ctx.fillText('LIFE: '+Life,50,275);
    ctx.fillStyle = 'red';
    ctx.fillText('LIFE: '+Life,54,280);
    ctx.fillStyle = 'black';
}
function drawGameover(){//遊戲結算
    BGM.pause();
    ctx.fillStyle = 'red';
    ctx.fillText('RESTART',canvas.width/2-dips,canvas.height/2+dips);
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER ... Your Score is '+score,canvas.width/2,canvas.height/2);
    ctx.textAlign = 'start';    
}

window.addEventListener('click',function(e){

    if(Start == false){
        if(e.x > start_x_start && e.x < (start_x_start + startlen) &&
        e.y <canvas.height/2-dips && e.y > canvas.height/2-dips-dipsY){
        Start = true;
        Choose.play();
        BGM = new Audio();
        BGM.src = 'battle.mp3';
        BGM.volume = 0.3;
        BGM.play();
        animate(0);}

        else if(e.x > eazy_x_start && e.x < (eazy_x_start + eazylen) &&
         e.y < canvas.height/2 && e.y > canvas.height/2-dips-dipsY ){
            Level = "Eazy";
            Choose.play();
            EnemyInterval = 500;
        }

        else if(e.x > eazy_x_start && e.x < (eazy_x_start + eazylen) &&
         e.y < canvas.height/2+dips && e.y > canvas.height/2+dips-dipsY){
            Choose.play();
            Level = "Hard";
            EnemyInterval = 400;//增加出現頻率
        }
    }
    if(GameOver == true){
        if(e.x > re_x_start && e.x < (re_x_start + relen) && e.y < canvas.height/2+dips && e.y > canvas.height/2+dips-dipsY){
            Choose.play();
            GameOver = false;console.log(e.x,e.y);
            Start = false ;
            EnemyInterval = 500;
            score=0;
            Life=3;
            enemys=[];
            explosions=[];
            startMenu(0);
        }
    }
    //讀取滑鼠點擊位置 image.data
    const detectPixelColor = collisionCtx.getImageData(e.x,e.y,1,1);
    // console.log(detectPixelColor.data);
    //點擊位置 image.data 的 顏色資料組
    const pc = detectPixelColor.data;//
    enemys.forEach(Object =>{
        //從陣列中找出該 image 的位置
        if( Object.randomColors[0] === pc[0] && 
            Object.randomColors[1] === pc[1] &&
            Object.randomColors[2] === pc[2] )
            {
                //標記刪除
                Object.markForDelet = true;
                score++;
                //產生爆炸
                explosions.push(new Explosion(Object.x,Object.y,Object.width));
                ///console.log(explosions);
            }
    })
})
function animate(timestamp){
    //清空Canvas
    ctx.clearRect(0,0,canvas.width,canvas.height);
    collisionCtx.clearRect(0,0,canvas.width,canvas.height);
    let deltatime = timestamp - lastTime;
    
    lastTime = timestamp;
    timetoNextEnemy+=deltatime;
    if(timetoNextEnemy>EnemyInterval){
        //新增敵人object
        enemys.push(new Enemy());
        //重設敵人出現時間
        timetoNextEnemy = 0;
        //較大的在前
        enemys.sort(function(a,b){
            return a.width -b.width;
        });
    }
    if(score<changelevel)setBackGround();
    else setBackGround2();
    
    drawScore();
    //更新所有建立的物件
    [...enemys,...explosions].forEach(Object => Object.update(deltatime));
    [...enemys,...explosions].forEach(Object => Object.draw());
    //過濾(把要的元素留下) markForDelet = true
    enemys = enemys.filter(Object => !Object.markForDelet);
    explosions = explosions.filter(Object => !Object.markForDelet);
    //若 gameover為 False, 啟動動畫
    if(!GameOver) requestAnimationFrame(animate);
    else drawGameover();
}
startMenu(0);