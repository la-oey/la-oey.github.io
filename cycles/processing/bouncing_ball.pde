int x = 80;
int ball = 48;
boolean left = true;

void setup(){
  background(256);
  size(512, 512);
}

void draw(){
  background(256);
  rect(32, 32, 32, width-2*32);
  rect(width-2*32, 32, 32, width-2*32);
  
  if(left){
    x = x + 4;
  } else{
    x = x - 4;
  }
  if(x > width-2*ball){
    left = false;
  } else if(x < 2*ball){ 
    left = true;
  }
  circle(x, 256, ball);
}
