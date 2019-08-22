var canvas = document.querySelector("canvas"),
    context = canvas.getContext("2d"),
    offscreen = document.querySelector(".offscreen"),
    offscreenContext = offscreen.getContext("2d")
    ;

var width = window.innerWidth || document.body.clientWidth,
    height = window.innerHeight || document.body.clientHeight;
 
canvas.width = width;
canvas.height = height;
offscreen.width = width;
offscreen.height = height;

// defining boids    
var numBoids = 200,
    flockmateRadius = 50,
    separationDistance = 30,
    maxVelocity = 4,  
    activity = [],
    boids1,
    boids2; // boids pool 
var i = 0;
//emotions (joy, sadness, fear)
var coefs= [
    {
        separation: 0.03,
        alignment: 0.03,
        cohesion: 0.03
    }, 
    {
        separation: 0.03,
        alignment: 0.01,
        cohesion: 0.01
    },
    {
        separation: 0.01,
        alignment: 0.03,
        cohesion: 0.03       
    }, 
    {
        separation: 0.01,
        alignment: 0.03,
        cohesion: 0.03       
    }
];


var time = [],
    totalNum = [],
    joy = [], 
    sadness = [];
    

var emotionaData = $.getJSON("/data/emoTweets.json", function(json){
                $.each(json, function(i){
                    time.push(json[i].time);
                    totalNum.push(json[i].total_tweets);
                    joy.push(json[i].total_tweets*json[i].joy_score);
                    sadness.push(json[i].total_tweets*json[i].joy_score);
                });
             setInterval(updateTime, 500);         
});


function updateTime() {
    i ++;
//   console.log(totalNum[i]);
    document.getElementById("time").innerHTML = time[i];
    document.getElementById("total-tweets").innerHTML = totalNum[i] + "  tweets";
//    boids1[i] = totalNum[i]* joy[i];
    numBoids = joy[i];
//    console.log(numBoids);
}

var forces = {
      alignment: new Vec2(),
      cohesion: new Vec2(),
      separation: new Vec2()
    }; 
    
offscreenContext.globalAlpha = 0.98;
context.globalAlpha = 1;
restart();
window.requestAnimationFrame(tick);


boids1 = createBoids(); 
boids2 = createBoids();  

function tick() {
      
  // set up two canvases
  offscreenContext.clearRect(0, 0, width, height);
  offscreenContext.drawImage(canvas, 0, 0, width, height);
  context.clearRect(0, 0, width, height);
  context.drawImage(offscreen, 0, 0, width, height);

  updateBoid(boids1, 0)
  updateBoid(boids2, 1)   
//  updateBoid(boids3, 2) 
  window.requestAnimationFrame(tick);
  
}

function updateBoid(boids, n) {
 boids.forEach( function(b) {
    b.acceleration = new Vec2(); 

    boids.forEach(function(b2){
      if (b === b2) return;
        
      //distance between b and b2
      var diff = b2.position.clone().subtract(b.position),
          distance = diff.length();

      // separation force applied    
      if (distance && distance < separationDistance) {
        forces.separation.add(diff.clone().scaleTo(-1 / distance)).active = true;
      }
        
      // cohesion (distance) & alignment (velocity) forces applied 
      if (distance < flockmateRadius) {
        forces.cohesion.add(diff).active = true;
        forces.alignment.add(b2.velocity).active = true;
      }

    });  


    for (var key in forces) {
      if (forces[key].active) {
        forces[key].scaleTo(maxVelocity)
          .subtract(b.velocity)
          .truncate(coefs[n][String(key)])
          ;
        b.acceleration.add(forces[key]);
      }
    } 
    b.position.add(b.velocity.add(b.acceleration).truncate(maxVelocity)); 
    
      boundaries(b); 
      drawBoids(b);
 }) 
}

    

    
function boundaries(b) {
   if (b.position.y > height) {
      b.velocity.y *= -1 ;
  } else if (b.position.y < 0) {
      b.velocity.y *= -1;
  }    
    

  if (b.position.x > width) {
    b.velocity.x *= -1;
  } else if (b.position.x < 0) {
    b.velocity.x *= -1;
  }     
}
    
function drawBoids(b) {
  context.beginPath();  
  context.arc(b.position.x, b.position.y, 1, 0, 2 * Math.PI);
  context.fill();
}  
    
function createBoids() {
  return d3.range(numBoids).map(function(d){
    return {
      position: new Vec2(Math.random() * width, Math.random() * height),
      velocity: new Vec2(1 - Math.random() * 2, 1 - Math.random() * 2).scale(maxVelocity)
    };
  }); 
}

function restart() {
  offscreenContext.clearRect(0, 0, width, height);
  context.clearRect(0, 0, width, height);  

}