var canvas =  document.getElementById("mycanvas")
var ctx = canvas.getContext("2d") 
var ww = window.innerWidth,
    wh = window.innerHeight
var time = 0;
var enemy_level=0
var gaming = 0
var score = 0
var pos_per_side = 3
var enemy_speed
var enemy_spawn_speed=[150,140,130,120,110,100,90,80,70]
var bullet_spawn_speed=[7,6,5,4,3]
var ship_color=["white","#F5E191","#F5AD57","#F57A57","#7E0802"]
var move_speed
var end = 0;
var bullets=[], spawn_pos=[], enemies=[]
var ship, level
var time_tag,time_tag_slow,time_tag_bomb
var ori_time_bomb,ori_time_slow,ori_time_buff
var state, game_int
for(let i=0;i<=pos_per_side+1;i+=1){
	let pos ={
		x: ww-(ww/pos_per_side)*i,
		y: wh-50
	}

	spawn_pos.push(pos)
	pos ={
		x: ww-(ww/pos_per_side)*i,
		y: 50
	}
	spawn_pos.push(pos)
	pos ={
		x: ww-50,
		y: wh-(wh/pos_per_side)*i
	}
	spawn_pos.push(pos)
	pos ={
		x: 50,
		y: wh-(wh/pos_per_side)*i
	}
	spawn_pos.push(pos)
}//生成「會生成敵人的點」的位置陣列
class Ship{
	constructor(args){
	  let def = {
		  x:0, y:0, deg: 0, r: Math.min(ww/15,wh/10,80),
		  level:1
	  }
	  Object.assign(def,args)
	  Object.assign(this,def)
	}
	draw(){
	  ctx.save()
		ctx.shadowBlur=50
		ctx.shadowColor=ship_color[ship.level-1]
		ctx.translate(ww/2,wh/2)
		ctx.beginPath()
			ctx.arc(0,0,this.r,0,Math.PI*2)
			ctx.strokeStyle=ship_color[ship.level-1]
			ctx.lineWidth=15
		ctx.stroke()
		  
		ctx.beginPath()
		/*if (time%50==0){
			TweenMax.to(ship,0.5,{deg: time/20})
			// ship.deg = time/20
		}*/
		  ctx.arc(0,0,this.r*1.65,-Math.PI/4+ this.deg ,Math.PI/4+this.deg )
		ctx.stroke()
		  ctx.rotate(this.deg + Math.PI)
		ctx.beginPath()
		  ctx.fillStyle=ship_color[ship.level-1]
		  let canon=this.r*0.65
		  ctx.fillRect(2*canon,-0.5*canon,canon,canon)
		ctx.stroke()
		ctx.restore()
		ctx.save()
		ctx.translate(ww/2,wh/2)
		ctx.rotate((time*Math.PI/30)*(this.level)*0.5)
		ctx.shadowBlur=50
		ctx.shadowColor=ship_color[ship.level-1]
		ctx.strokeStyle=ship_color[ship.level-1]
		
		for(var i=0;i<3;i++){
			ctx.rotate(Math.PI*2/3)
			ctx.moveTo(0,0)
			ctx.lineTo(this.r,0)
		  }
		  ctx.lineWidth=5
		ctx.stroke()
/*
			ctx.beginPath()
			ctx.arc(Math.cos(deg)*r,Math.sin(deg)*r,40,0,Math.PI*2)
			ctx.fillStyle="white"
			ctx.fill()*/
	  ctx.restore()
	}
	update(){
		if(MousePos.x<0)
		  this.deg = Math.PI-Math.atan(-MousePos.y/MousePos.x)
		else
		  this.deg = -Math.atan((-MousePos.y+0.5*Math.PI)/MousePos.x)
	}
} 
class Bullet{
	constructor(args){
	  let def ={
		  x:0, y:0,
		  v:{
			  x:0,
			  y:0
		  },
		  size:10
	  }
	  Object.assign(def,args)
	  Object.assign(this,def)
	}
	draw(){
	  ctx.save()
		  ctx.translate(this.x,this.y)
		  ctx.fillStyle="white"
		  ctx.fillRect(-(this.size*0.5),-(this.size*0.5),this.size ,this.size)
	  ctx.restore()
	}
	update(){
		/*this.v={
			x:-Math.cos(ship.deg)*2,
			y:-Math.sin(ship.deg)*2
		  }*/
	  this.x+=this.v.x
	  this.y+=this.v.y
	}
	hit(enemy){
		if(Math.abs(this.x-enemy.x)<(this.size+enemy.size)&&Math.abs(this.y-enemy.y)<(this.size+enemy.size)&&enemy.alive){
			//console.log("hit!")
			enemy.size=0
			enemy.alive=0
			score+=get;
		}
	}
	level_up(){
		if(buff.alive){
			if(Math.abs(this.x-buff.x)<(this.size+buff.size)&&Math.abs(this.y-buff.y)<(this.size+buff.size)&&buff.alive){
				//buff.size=0
				buff.alive=0
				if(ship.level<5)
					ship.level++
				buff.v={x:0,y:0}
				time_tag=time+30
				ori_time_buff=time
				console.log("level: "+ship.level)
			}
		}
	}
	hit_slow(){
		if(slow.alive){
			if(Math.abs(this.x-slow.x)<(this.size+slow.size)&&Math.abs(this.y-slow.y)<(this.size+slow.size)&&slow.alive){
				slow.alive=0
				enemies.forEach(enemy=>{
					enemy.v={x:enemy.v.x/3,y:enemy.v.y/3}
				})
				slow.v={x:0,y:0}
				time_tag_slow=time+90
				ori_time_slow=time
			}
		}
	}
	hit_bomb(){
		if(bomb.alive){
			if(Math.abs(this.x-bomb.x)<(this.size+bomb.size)&&Math.abs(this.y-bomb.y)<(this.size+bomb.size)&&bomb.alive){
				//console.log("Bomb hit!")
				bomb.alive=0
				enemies.forEach(enemy=>{
					enemy.alive=0
					enemy.size=0
				})
				bomb.v={x:0,y:0}
				time_tag_bomb=time+200
				ori_time_bomb=time
			}
		}
	}
  }
class Enemy{
  constructor(args){
	  let def ={
		x:0, y:0,
		v:{
			x:0,
			y:0
		},
		size: 20,
		alive:1
	  }
	  Object.assign(def,args)
	  Object.assign(this,def)
  }
  draw(){
	ctx.save()
	  ctx.shadowBlur=30
	  ctx.shadowColor="#E85343"
	  ctx.translate(this.x,this.y)
	  
	  //ctx.fillRect(-5,-5,10 ,10)
	  ctx.beginPath()
	    ctx.fillStyle="red"
	    ctx.arc(0,0,this.size,0,Math.PI*2)
	  ctx.fill();
	  ctx.restore()
  }
  move(){
	  if(this.x>ww/2){
		if(this.x+this.v.x<=ww/2){
			//console.log("check1")
		  this.v.x=0
		  this.v.y=0
		} 
	  }
	  else if(this.x<=ww/2){
		if(this.x+this.v.x>ww/2){
		  //console.log("check2")
		  this.v.x=0
		  this.v.y=0
		}
	  }
	  this.x+=this.v.x
	  this.y+=this.v.y
  }
  collision(){
	  let x=ww/2-this.x
	  let y=wh/2-this.y
	let dis=Math.sqrt(x*x+y*y)
	if(dis<(90+this.size)){
	  end=1
	  this.alive=0
	  gaming = 0
	  GameOver()
	}
  }
}
class Buff{
	constructor(args){
		let def ={
		  x:0, y:0,
		  v:{
			  x:0,
			  y:0
		  },
		  size: 20,
		  alive:0
		}
		Object.assign(def,args)
		Object.assign(this,def)
	}
	draw(){
	  ctx.save()
		ctx.shadowBlur=30
		ctx.shadowColor="lightgreen"
		ctx.translate(this.x,this.y)
		ctx.fillStyle="lightgreen"
		if(this.alive){
			ctx.fillRect(-this.size,-0.5*this.size,this.size*2,this.size)
			ctx.fillRect(-0.5*this.size,-this.size,this.size,this.size*2)
		}
		else if(time<time_tag){
			ctx.fillStyle="lightgreen"
			ctx.font = '30px Arial Bold'
			ctx.globalAlpha=((time_tag-time)/(time_tag-ori_time_buff))
			ctx.fillText("Level up!",-50,25)
			//console.log("Level up!")
		}
		else{
			this.size=0
		}
		ctx.restore()
	}
	move(){
		if(this.x>ww/2){
		  if(this.x+this.v.x<=ww/2){
			  //console.log("check1")
			this.v.x=0
			this.v.y=0
		  } 
		}
		else if(this.x<=ww/2){
		  if(this.x+this.v.x>ww/2){
			//console.log("check2")
			this.v.x=0
			this.v.y=0
		  }
		}
		this.x+=this.v.x
		this.y+=this.v.y
	}
	collision(){
		let x=ww/2-this.x
		let y=wh/2-this.y
	    let dis=Math.sqrt(x*x+y*y)
	  if(dis<(ship.r+this.size)){
		this.size=0
		this.alive=0
	  }
	}
}
class Slow{
	constructor(args){
		let def ={
		  x:0, y:0,
		  v:{
			  x:0,
			  y:0
		  },
		  size: 20,
		  alive:0
		}
		Object.assign(def,args)
		Object.assign(this,def)
	}
	draw(){
	  ctx.save()
		ctx.shadowBlur=30
		ctx.shadowColor="lightblue"
		ctx.translate(this.x,this.y)
		ctx.strokeStyle="lightblue"
		ctx.lineWidth=12
		if(this.alive){
			ctx.beginPath()
			ctx.arc(0,0,this.size,0,Math.PI*2)
			ctx.stroke()
			ctx.beginPath()
			ctx.lineWidth=3
			ctx.moveTo(0,-this.size)
			ctx.lineTo(0,-(this.size+10))
			ctx.stroke()
			ctx.lineWidth=8
			ctx.moveTo(0,3)
			ctx.lineTo(0,-(this.size+5))
			ctx.rotate(Math.PI*1/3)
			ctx.moveTo(0,4)
			ctx.lineTo(0,-this.size)
			ctx.stroke()
		}
		else if(time<time_tag_slow){
			ctx.fillStyle="lightblue"
			ctx.font = '30px Arial Bold'
			ctx.globalAlpha=((time_tag_slow-time)/(time_tag_slow-ori_time_slow))
			ctx.fillText("Slow down!",-50,25)
			//console.log("Slow down")
		}
		else{
			this.size=0
			enemies.forEach(enemy=>{
				enemy.v={x:enemy.v.x*3,y:enemy.v.y*3}
			})
		}
		ctx.restore()
	}
	move(){
		if(this.x>ww/2){
		  if(this.x+this.v.x<=ww/2){
			this.v.x=0
			this.v.y=0
		  } 
		}
		else if(this.x<=ww/2){
		  if(this.x+this.v.x>ww/2){
			this.v.x=0
			this.v.y=0
		  }
		}
		this.x+=this.v.x
		this.y+=this.v.y
	}
	collision(){
		let x=ww/2-this.x
		let y=wh/2-this.y
	    let dis=Math.sqrt(x*x+y*y)
	  if(dis<(ship.r+this.size)){
		this.size=0
		this.alive=0
	  }
	}
  }
class Bomb{
	constructor(args){
		let def ={
		  x:0, y:0,
		  v:{
			  x:0,
			  y:0
		  },
		  size: 20,
		  alive:0
		}
		Object.assign(def,args)
		Object.assign(this,def)
	}
	draw(){
	  ctx.save()
		ctx.shadowBlur=30
		ctx.strokeStyle="yellow"
		ctx.lineWidth=12 
		if(this.alive){
			ctx.save()
			ctx.fillStyle="yellow"
			ctx.shadowBlur=30
			ctx.shadowColor="lightyellow"
			ctx.translate(this.x,this.y)
			ctx.fillRect(-8,0,16,-26)
			ctx.beginPath()
			  ctx.fillStyle="yellow"
			  ctx.arc(0,0,this.size,0,Math.PI*2)
			ctx.fill();
			ctx.restore()
		}
		else if(time<time_tag_bomb){
			ctx.save()
			ctx.translate(this.x,this.y)
			ctx.globalAlpha=((time_tag_bomb-time)/(time_tag_bomb-ori_time_bomb))
			ctx.fillStyle="yellow"
			ctx.font = '30px Arial Bold'
			ctx.fillText("Bomb!",-50,25)
			ctx.restore()
		}
		ctx.restore()
	}
	move(){
		if(this.x>ww/2){
		  if(this.x+this.v.x<=ww/2){
			this.v.x=0
			this.v.y=0
		  } 
		}
		else if(this.x<=ww/2){
		  if(this.x+this.v.x>ww/2){
			this.v.x=0
			this.v.y=0
		  }
		}
		this.x+=this.v.x
		this.y+=this.v.y
	}
	collision(){
		let x=ww/2-this.x
		let y=wh/2-this.y
	    let dis=Math.sqrt(x*x+y*y)
	  if(dis<(ship.r+this.size)){
		this.size=0
		this.alive=0
	  }
	}
}
function RandomInt(start,end){
	let length=end-start
	return start+Math.floor(Math.random()*length+0.01)
}//工具程式：隨機生成start~end之中的一個整數
function start(level){
	state="start"
	switch(level){
		case "easy":
			enemy_speed=[0.15,0.3,0.45,0.6,0.7,0.85,1,1.2,1.3]
			get=5
			break
		case "normal":
			enemy_speed=[0.35,0.5,0.7,0.8,1,1.2,1.5,1.8,2]
			get=10
			break
		case "hard":
			enemy_speed=[0.6,0.75,0.7,1.1,1.3,1.6,1.8,2,2.5]
			get=15
			break
	}//設定各難度參數
	gameStart()
}
function gameStart(){
	end=0
	drawBG()
	drawStart()
	canvas.addEventListener('click', function(evt) {
	  if(!gaming){
		  if(!end){	//start
			  if ((MousePos.x > -100) && (MousePos.x < 100) && (MousePos.y < 50) && (MousePos.y > -50)){
				  setup()
				  game_int = setInterval(update,1000/60);
				  requestAnimationFrame(draw)
			  }
			  else if ((MousePos.x > (-(ww/2))) && (MousePos.x < (-(ww/2)+150)) && (MousePos.y < -(wh/2)+60) && (MousePos.y > -(wh/2))){
				chooseLevel()
			  }
		  }
		  
	  }
	}, false);
}
function GameOver(){
	state="gameover"
	clearInterval(game_int)
	drawBG()
	ctx.save()
    ctx.shadowBlur=30
    ctx.shadowColor="#9C0E09"
    ctx.strokeStyle="#9C0E09"
	ctx.fillStyle="#9C0E09"
	ctx.translate(ww/2,wh/2)
	ctx.lineJoin = "round"
	ctx.lineWidth = 20;
	ctx.strokeRect(-225,-100,440,100)
	ctx.fillRect(-225,-100,440,100)
	ctx.fillStyle="lightgray"
	ctx.font = '80px Arial'
	ctx.strokeStyle="#D50A17"
	ctx.fillText('Game Over',-218,-20)

	ctx.shadowColor="white"
	ctx.fillStyle="white"
	ctx.font = '45px Arial'
	ctx.fillText('score:'+score,-92,75)

	ctx.shadowBlur=30
    ctx.shadowColor="#7A162A"
	ctx.fillStyle = "#7A162A"
	ctx.strokeStyle = "#7A162A"
	ctx.fillRect(-95,113,190,65)
	ctx.lineJoin = "round"
	ctx.lineWidth = 20;
	ctx.strokeRect(-90,120,182,50)
	ctx.fillStyle="lightgray"
	ctx.font = '52px Arial'
	ctx.fillText('Restart',-85,165)
	end=1
	canvas.addEventListener("click",function(evt){
		if(state=="gameover"){
			if ((MousePos.x > -90) && (MousePos.x < 92) && (MousePos.y < 170) && (MousePos.y > 120)){
				chooseLevel()
			}
		}
	})
  ctx.restore()
}//畫出、執行GameOver畫面
function drawStart(){
	ctx.save()
    ctx.shadowBlur=30
    ctx.shadowColor="#D92B25"
    ctx.strokeStyle="#D92B25"
	ctx.fillStyle="#D92B25"
	ctx.translate(ww/2,wh/2)
	ctx.lineJoin = "round"
	ctx.lineWidth = 20;
	ctx.strokeRect(-100,-50,200,100)
	ctx.fillRect(-100,-50,200,100)
	ctx.fillStyle="white"
	ctx.font = '80px Arial'
	ctx.strokeStyle="#D50A17"
	ctx.fillText('Start',-86,28)
  ctx.restore()
  ctx.save()
  	ctx.shadowBlur=30
    ctx.shadowColor="white"
	ctx.fillStyle="white"
	ctx.font = '50px Arial'
	ctx.fillText('Back',13,45)
  ctx.restore()
}//畫出「Start」的圖案
function drawBG(){
  ctx.fillStyle="#001D2E"
  ctx.fillRect(0,0,ww,wh)
  ctx.save()
    ctx.strokeStyle="rgba(255,255,255,0.1)"
    let gutter = 50
    for(var i=0;i*10<ww;i++){
      ctx.moveTo(i*gutter,0)
      ctx.lineTo(i*gutter,wh)
    }
    for(var i=0;i*10<wh;i++){
      ctx.moveTo(0,i*gutter)
      ctx.lineTo(ww,i*gutter)
    }
    ctx.stroke()
  ctx.restore()
}//畫出背景
function drawScore(){
	ctx.save()
	ctx.translate(0,0)
	ctx.fillStyle="lightgray"
	ctx.font = '30px Arial'
	ctx.fillText("score:"+score,ww-250,50)
	ctx.restore()
}//畫出分數
function setup(){
	time_tag=1
	time_tag_slow=1
	time_tag_bomb=1
	enemy_level=0
	ship.level=1
	gaming=1
	time=1
	score=0
	let i=0
	enemies.forEach(enemy=>{
		let speed = Math.random()+enemy_speed[enemy_level]
		enemy.x=spawn_pos[i].x
		enemy.y=spawn_pos[i].y
		enemy.v.x=(ww/2-enemy.x)*(0.002*speed)
		enemy.v.y=(wh/2-enemy.y)*(0.002*speed)
		enemy.alive=1
		enemy.size=20
		i++
	})
	
}//初始化各個參數
function drawLevel(){
	canvas.width = ww
	canvas.height = wh
	ctx.fillStyle="#001D2E"
	ctx.fillRect(0,0,ww,wh)
	ctx.save()
	  ctx.strokeStyle="rgba(255,255,255,0.1)"
	  let gutter = 50
	  for(var i=0;i*10<ww;i++){
		ctx.moveTo(i*gutter,0)
		ctx.lineTo(i*gutter,wh)
	  }
	  for(var i=0;i*10<wh;i++){
		ctx.moveTo(0,i*gutter)
		ctx.lineTo(ww,i*gutter)
	  }
	  ctx.stroke()
	//Level  
    ctx.shadowBlur=30
    ctx.shadowColor="white"
	ctx.translate(ww/2,wh/2)
	ctx.font = '80px Arial'
	ctx.fillStyle="white"
	ctx.fillText('Level',-95,-240)
	//Easy
	ctx.shadowColor="#0C8638"
	ctx.strokeStyle="#0C8638"
	ctx.fillStyle="#0C8638"
	ctx.lineJoin = "round"
	ctx.lineWidth = 20;
	ctx.strokeRect(-130,-170,260,85)
	ctx.fillRect(-130,-170,260,85)
	ctx.fillStyle="white"
	ctx.font = '80px Arial'
	ctx.strokeStyle="#D50A17"
	ctx.fillText('Easy',-86,-100)
	//Normal
	ctx.shadowColor="#C9B70C"
	ctx.strokeStyle="#C9B70C"
	ctx.fillStyle="#C9B70C"
	ctx.strokeRect(-130,-25,260,85)
	ctx.fillRect(-130,-25,260,85)
	ctx.fillStyle="white"
	ctx.font = '75px Arial'
	ctx.fillText('Normal',-120,43)
	//Hard
	ctx.shadowColor="#8F1501"
	ctx.strokeStyle="#8F1501"
	ctx.fillStyle="#8F1501"
	ctx.strokeRect(-130,120,260,85)
	ctx.fillRect(-130,120,260,85)
	ctx.fillStyle="white"
	ctx.font = '75px Arial'
	ctx.fillText('Hard',-86,190)
  ctx.restore()
}//畫出選擇難度畫面
function update(){
	if(!end){
		if((time+1)%500==0){
			if(enemy_level<enemy_speed.length-1){
				enemy_level++
			}
		}					//每過固定時間升級敵人
		if(time%bullet_spawn_speed[ship.level-1]==0){
			var b = new Bullet({
				x: ww/2-Math.cos(ship.deg)*(ship.r+50),
				y: wh/2-Math.sin(ship.deg)*(ship.r+50),
				v: {
				x:-Math.cos(ship.deg)*10,
				y:-Math.sin(ship.deg)*10
				}
			})
			bullets.push(b)
		}	//bullet		//生成子彈
		if((time+1)%enemy_spawn_speed[enemy_level]==0){
			enemies.forEach(enemy=>{
				if(!enemy.alive){
					ctx.save()
					ctx.translate(0,0)
					let j = Math.floor(Math.random()*spawn_pos.length)
					let speed = Math.random()+enemy_speed[enemy_level]
					enemy.x=spawn_pos[j].x+RandomInt(-50,50)
					enemy.y=spawn_pos[j].y+RandomInt(-50,50)
					enemy.v.x=(ww/2-enemy.x)*(0.002*speed)
					enemy.v.y=(wh/2-enemy.y)*(0.002*speed)
					enemy.alive=1
					enemy.size=20
					if((slow.alive==0&&time<=time_tag_slow)&&time>10)
						enemy.v={x:enemy.v.x/3,y:enemy.v.y/3}
					ctx.restore()
					//if(bomb.alive)
				}
			})
		}	//respawn enemy	//重新生成敵人
		if((time+1)%500==0){
			if(ship.level<5){
				let speed = Math.random()/2+0.5	//0.5~1
				buff.x=spawn_pos[RandomInt(0,pos_per_side*2)].x
				buff.y=spawn_pos[RandomInt(0,pos_per_side*2)].y
				buff.v.x=(ww/2-buff.x)*(0.004*speed)
				buff.v.y=(wh/2-buff.y)*(0.004*speed)
				buff.alive=1
				buff.size=20
			}
			
		}	//spawn buff	//生成、移動藍色道具
		if((time+1)%700==0){
			let speed = Math.random()/2+0.5	//0.5~1
			slow.x=spawn_pos[RandomInt(0,pos_per_side*2)].x
			slow.y=spawn_pos[RandomInt(0,pos_per_side*2)].y
			slow.v.x=(ww/2-slow.x)*(0.004*speed)
			slow.v.y=(wh/2-slow.y)*(0.004*speed)
			slow.alive=1
			slow.size=20
		}	//slow down		//生成、移動藍色道具
		if((time+1)%900==0){
			//console.log("bomb alive")
			let speed = Math.random()/2+0.5	//0.5~1
			bomb.x=spawn_pos[RandomInt(0,pos_per_side*2)].x
			bomb.y=spawn_pos[RandomInt(0,pos_per_side*2)].y
			bomb.v.x=(ww/2-bomb.x)*(0.004*speed)
			bomb.v.y=(wh/2-bomb.y)*(0.004*speed)
			bomb.alive=1
			bomb.size=20
		}	//bomb 			//生成、移動黃色道具  
		slow.move()
		slow.collision()
		bomb.move()
		bomb.collision()
		buff.move()
		buff.collision()
		ship.update()
		bullets.forEach(bullet => {
			bullet.update()
			bullet.level_up()
			bullet.hit_slow()
			bullet.hit_bomb()
			enemies.forEach(enemy=>{
				bullet.hit(enemy)
			})
		})	//check hit  確認子彈是否擊中任何物體
		enemies.forEach(enemy=>{
			if(enemy.alive){
				enemy.move()
				enemy.collision()
			}
		})
		time++
	}
	else{
		clearInterval(game_int)
	}
}
function draw(){
	if(end==0){
		drawBG()
		drawScore()
		ship.draw()
		bullets.forEach(bullet =>{
			bullet.draw()
		});
		enemies.forEach(enemy=>{
			enemy.draw()
		})
		buff.draw()
		if((slow.alive==1||time<=time_tag_slow)&&time>10)
			slow.draw()
		bomb.draw()
		requestAnimationFrame(draw)
	}
	else if(end==2){
		drawPass()
		window.cancelAnimationFrame(draw)
	}
} 
function chooseLevel(){
	state="level"
	drawLevel()
	canvas.addEventListener('click', function(evt) {
		if(state=="level"){
			//Easy -130,-170,260,85
			if ((MousePos.x > -130) && (MousePos.x < 130) && (MousePos.y > -170) && (MousePos.y < -85) ){
				level="easy"
				start(level)
			}
			//Normal -130,-25,260,85
			else if ((MousePos.x > -130) && (MousePos.x < 130) && (MousePos.y > -25) && (MousePos.y < 60) ){
				level="normal"
				start(level)
			}
			//Hard -130,120,260,85
			else if ((MousePos.x > -130) && (MousePos.x < 130) && (MousePos.y > 120) && (MousePos.y < 205) ){
				level="hard"
				start(level)
			}
		}
	  }, false);
}
var buff = new Buff
var slow = new Slow
var bomb = new Bomb
ship=new Ship({
	deg:0
})//建立船體
spawn_pos.forEach(pos => {
  var enemy = new Enemy
  enemies.push(enemy)
})//建立敵人
var MousePos={
	x: 0,y: 0
}
canvas.addEventListener("mousemove",function(evt){
	MousePos.x=evt.x-ww/2
	MousePos.y=evt.y-wh/2
})

chooseLevel()		//觸發遊戲