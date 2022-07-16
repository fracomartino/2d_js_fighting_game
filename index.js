const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

c.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 0.27;
const players_width = 40;
const players_height = 120;

class Sprite {
  constructor({ position, speed, color, offset }) {
    this.position = position;
    this.speed = speed;
    this.height = players_height;
    this.width = players_width;
    this.lastkey;
    this.color = color;
    this.attackbox = {
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      offset: offset,
      height: 20,
      width: 40,
    };
    this.health = 100;
    this.isAttacking;
  }

  draw() {
    c.fillStyle = this.color;
    c.fillRect(this.position.x, this.position.y, this.width, this.height);

    if (this.isAttacking == true) {
      c.fillStyle = "yellow";
      c.fillRect(
        this.attackbox.position.x,
        this.attackbox.position.y,
        this.attackbox.width,
        this.attackbox.height
      );
    }
  }

  update() {
    this.draw();

    this.attackbox.position.x = this.position.x + this.attackbox.offset;
    this.attackbox.position.y = this.position.y;

    this.position.x += this.speed.x;
    this.position.y += this.speed.y;

    if (this.position.y + this.height >= canvas.height) {
      this.speed.y = 0;
    } else this.speed.y += gravity;
  }

  attack() {
    this.isAttacking = true;
    setTimeout(() => {
      this.isAttacking = false;
    }, 100);
  }
}

const player = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  speed: {
    x: 0,
    y: 0,
  },
  offset: players_width,
  color: "red",
});

const enemy = new Sprite({
  position: {
    x: 400,
    y: 200,
  },
  speed: {
    x: 0,
    y: 0,
  },
  offset: -players_width,
  color: "green",
});

const keys = {
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },

  ArrowRight: {
    pressed: false,
  },
  ArrowLeft: {
    pressed: false,
  },
};

function rectangle_detection({ rectangle_1, rectangle_2 }) {
  return (
    // if all 4 conditiones true => return true
    rectangle_1.attackbox.position.x + rectangle_1.attackbox.width >=
      rectangle_2.position.x && //x detection
    rectangle_1.attackbox.position.x <=
      rectangle_2.position.x + rectangle_2.width &&
    rectangle_1.attackbox.position.y + rectangle_1.attackbox.height >=
      rectangle_2.position.y && //y detection
    rectangle_1.attackbox.position.y <=
      rectangle_2.attackbox.position.y + rectangle_2.height
  );
}

function determineWinner({player, enemy, timerId}){
    document.querySelector('#verdict').style.display = 'flex'
    clearTimeout(timerId)
    
        if(player.health == enemy.health){
            document.querySelector('#verdict').innerHTML = 'Tie'
        } else if ( player.health > enemy.health){
            document.querySelector('#verdict').innerHTML = 'Player 1 wins'
        } else if (player.health < enemy.health){
            document.querySelector('#verdict').innerHTML = 'Player 2 wins'
        }
}

//timer decreasing
let timer = 10
let timerId
function decreaseTimer() {
    if (timer > 0) {
        timerId = setTimeout(decreaseTimer, 1000); //calls decreaseTimer function every 1000 ms || setTimeout returns a value every second
        timer--
        document.querySelector("#timer").innerHTML = timer
    }

    if (timer == 0){
        determineWinner({player, enemy})
    }
}

decreaseTimer()

function movement() {
  window.requestAnimationFrame(movement);
  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.update();
  enemy.update();

  player.speed.x = 0;
  enemy.speed.x = 0;

  //key detection
  //player
  if (keys.a.pressed && player.lastkey == "a") {
    player.speed.x = -4;
  } else if (keys.d.pressed && player.lastkey == "d") {
    player.speed.x = 4;
  }
  //enemy
  if (keys.ArrowLeft.pressed && enemy.lastkey == "ArrowLeft") {
    enemy.speed.x = -4;
  } else if (keys.ArrowRight.pressed && enemy.lastkey == "ArrowRight") {
    enemy.speed.x = 4;
  }

  //collision detection
  if (
    rectangle_detection({
      rectangle_1: player,
      rectangle_2: enemy,
    }) &&
    player.isAttacking
  ) {
    player.isAttacking = false;
    enemy.health -= 20;
    document.querySelector("#enemyHealth").style.width = enemy.health + "%";
  }
  if (
    rectangle_detection({
      rectangle_1: enemy,
      rectangle_2: player,
    }) &&
    enemy.isAttacking
  ) {
    enemy.isAttacking = false;
    player.health -= 20;
    document.querySelector("#playerHealth").style.width = player.health + "%";
  }

  //determine winner if one player dies
  if (player.health <= 0 || enemy.health <= 0){
    determineWinner({player, enemy, timerId})
  }
}

movement();

//funzione che si attiva solo se viene registrato l'event
window.addEventListener("keydown", (event) => {
  switch (event.key) {
    //player keys detection
    case "d":
      keys.d.pressed = true;
      player.lastkey = "d";
      break;
    case "a":
      keys.a.pressed = true;
      player.lastkey = "a";
      break;
    case "w":
      if (player.position.y >= canvas.height - player.height) {
        player.speed.y = -12;
      }
      break;
    case " ":
      player.attack();
      break;

    //enemy keys detection
    case "ArrowRight":
      keys.ArrowRight.pressed = true;
      enemy.lastkey = "ArrowRight";
      break;
    case "ArrowLeft":
      keys.ArrowLeft.pressed = true;
      enemy.lastkey = "ArrowLeft";
      break;
    case "ArrowUp":
      if (enemy.position.y >= canvas.height - enemy.height) {
        enemy.speed.y = -12;
      }
      break;
    case "ArrowDown":
      enemy.attack();
      break;
  }
});

window.addEventListener("keyup", (event) => {
  switch (event.key) {
    //player
    case "d":
      keys.d.pressed = false;
      break;
    case "a":
      keys.a.pressed = false;
      break;
  }

  //enemy
  switch (event.key) {
    case "ArrowRight":
      keys.ArrowRight.pressed = false;
      break;
    case "ArrowLeft":
      keys.ArrowLeft.pressed = false;
      break;
  }
});

enemy.draw();
player.draw();
