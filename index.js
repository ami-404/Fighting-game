const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 770;
canvas.height = 360;
// canvas.width = 1024;
// canvas.height = 576;

c.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 0.7

const background = new sprite({
  position: {
    x: 0,
    y: 0
  },
  imageSrc: './img/background.png'
})

const shop = new sprite({
  position: {
    x: 460,
    y: 76
  },
  imageSrc: './img/shop.png',
  scale: 1.75,
  framesMax: 6
})

const player = new fighter({
  position: {
    x: 0,
    y: 0
  },
  velocity: {
    x: 0,
    y: 0
  },
  offset: {
    x: 0,
    y: 0
  },
  imageSrc: './img/smurai_mack/Idle.png',
  scale: 2.16,
  framesMax: 8,
  offset: {
    x: 215,
    y: 144
  },
  sprites: {
    idle: {
      imageSrc: './img/smurai_mack/Idle.png',
      framesMax: 8
    },
    run: {
      imageSrc: './img/smurai_mack/Run.png',
      framesMax: 8
    },
    jump: {
      imageSrc: './img/smurai_mack/Jump.png',
      framesMax: 2
    },
    fall: {
      imageSrc: './img/smurai_mack/Fall.png',
      framesMax: 2
    },
    attack1: {
      imageSrc: './img/smurai_mack/Attack1.png',
      framesMax: 6
    },
    takeHit: {
      imageSrc: './img/smurai_mack/Take Hit - white silhouette.png',
      framesMax: 4
    },
    death: {
      imageSrc: './img/smurai_mack/Death.png',
      framesMax: 6
    }
  },
  attackBox: {
    offset: {
      x: 40,
      y: 20
    },
    width: 150,
    height: 50
  }
})

const enemy = new fighter({
  position: {
    x: 400,
    y: 100
  },
  velocity: {
    x: 0,
    y: 0
  },
  color: 'blue',
  offset: {
    x: -50,
    y: 0
  },
  imageSrc: '/img/Kenji/Idle.png',
  scale: 2.16,
  framesMax: 4,
  offset: {
    x: 215,
    y: 154
  },
  sprites: {
    idle: {
      imageSrc: '/img/kenji/Idle.png',
      framesMax: 4
    },
    run: {
      imageSrc: '/img/kenji/Run.png',
      framesMax: 8
    },
    jump: {
      imageSrc: '/img/kenji/Jump.png',
      framesMax: 2
    },
    fall: {
      imageSrc: '/img/kenji/Fall.png',
      framesMax: 2
    },
    attack1: {
      imageSrc: '/img/kenji/Attack1.png',
      framesMax: 4
    },
    takeHit: {
      imageSrc: '/img/kenji/Take hit.png',
      framesMax: 3
    },
    death: {
      imageSrc: '/img/kenji/Death.png',
      framesMax: 7
    }
  },
  attackBox: {
    offset: {
      x: -180,
      y: 30
    },
    width: 140,
    height: 50
  }
})

const keys = {
  left: {
    pressed: false
  },
  right: {
    pressed: false
  },
  up: {
    pressed: false
  },
  arrowLeft: {
    pressed: false
  },
  arrowRight: {
    pressed: false
  },
  arrowUp: {
    pressed: false
  }
}

decreaseTimer()

function animate() {
  window.requestAnimationFrame(animate)
  c.fillStyle = 'black'
  c.fillRect(0, 0, canvas.width, canvas.height)
  background.update()
  shop.update()
  c.fillStyle = '#FFFFFF0D'
  c.fillRect(0, 0, canvas.width, canvas.height)
  player.update()
  enemy.update()

  player.velocity.x = 0
  enemy.velocity.x = 0

  // player movement

  if (keys.left.pressed && player.lastKey === 'left') {
    player.velocity.x = -5
    player.switchSprite('run')
  } else if (keys.right.pressed && player.lastKey === 'right') {
    player.velocity.x = 5
    player.switchSprite('run')
  }
  else {
    player.switchSprite('idle')
  }
  if (player.velocity.y < 0) {
    player.switchSprite('jump')
  } else if (player.velocity.y > 0) {
    player.switchSprite('fall')

  }
  else if (keys.up.pressed) {
    player.velocity.y = -15
    keys.up.pressed = false
  }


  // enemy movement
  if (keys.arrowLeft.pressed && enemy.lastKey === 'arrowLeft') {
    enemy.switchSprite('run')
    enemy.velocity.x = -5
  } else if (keys.arrowRight.pressed && enemy.lastKey === 'arrowRight') {
    enemy.switchSprite('run')
    enemy.velocity.x = 5
  }
  else {
    enemy.switchSprite('idle')
  }
  if (enemy.velocity.y < 0) {
    enemy.switchSprite('jump')
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprite('fall')

  }
  else if (keys.arrowUp.pressed) {
    enemy.velocity.y = -15
    keys.arrowUp.pressed = false
  }

  // detect collision & enemy get hit
  if (
    rectangularCollision({
      rectangle1: player,
      rectangle2: enemy
    }) && player.isAttacking && player.framesCurrent === 4
  ) {
    enemy.takeHit()
    player.isAttacking = false

   //  document.querySelector('#enemyhealth').style.width = enemy.health + '%'
    gsap.to('#enemyhealth', {
      width: enemy.health + '%'
    })
   //  console.log('attacked', enemy.health)
  }

  // if player missed
  else if (player.isAttacking && player.framesCurrent === 4) {
    player.isAttacking = false
  }

  // player get hit

  if (
    rectangularCollision({
      rectangle1: enemy,
      rectangle2: player
    }) && enemy.isAttacking && enemy.framesCurrent === 2
  ) {
    player.takeHit()
    enemy.isAttacking = false
    // document.querySelector('#playerhealth').style.width = player.health + '%'
    gsap.to('#playerhealth', {
      width: player.health + '%'
    })
    // console.log('enemy attacking')
  }

  // if enemy missed
  else if (enemy.isAttacking && enemy.framesCurrent === 2) {
    enemy.isAttacking = false
  }

  // based on health
  if (player.health <= 0 || enemy.health <= 0) {
    determineWinner({ player, enemy, timerId })
  }
}

animate()

/* window.addEventListener('keyattack', (event) => {
  switch (event.key) {
    case 'd':
      console.log('d pressed')
      break;
  }
  console.log(event.key)
}) */

function movePlayer(diraction) {
  if (!player.dead) {
    switch (diraction) {
      case 'up':
        keys.up.pressed = true
        // console.log('player moved: up')
        break;
      case 'left':
        keys.left.pressed = true
        player.lastKey = 'left'
        // console.log('player moved: left', player.position.x)
        break;
      case 'right':
        keys.right.pressed = true
        player.lastKey = 'right'
       //  console.log('player moved: right', player.position.x)
        break;
      case 'attack':
        player.strike()
        // console.log('player function:  attack')
        break;
      case 'end':
        keys.right.pressed = false;
        keys.left.pressed = false;
        keys.up.pressed = false;
        break;
    }
  }
  // enemy controls
  if (!enemy.dead) {
    switch (diraction) {
      case 'arrowUp':
        keys.arrowUp.pressed = true
        // console.log('enemy: moved up', enemy.velocity.y)
        break;
      case 'arrowLeft':
        keys.arrowLeft.pressed = true
        enemy.lastKey = 'arrowLeft'
        // console.log('enemy: moved left', enemy.position.x)
        break;
      case 'arrowRight':
        keys.arrowRight.pressed = true
        enemy.lastKey = 'arrowRight'
       //  console.log('enemy: moved right', enemy.position.x)
        break;
      case 'arrowAttack':
        //  enemy.isAttacking = true
        enemy.strike()
       //  console.log('enemy function: attack')
        break;
      case 'arrowEnd':
        keys.arrowRight.pressed = false;
        keys.arrowLeft.pressed = false;
        keys.arrowUp.pressed = false;
        break;

      default:
        player.velocity.x = 0;
        enemy.velocity.x = 0;
    }
  }
}

document.getElementById("up").addEventListener("touchstart", () => {
  movePlayer('up');
});
document.getElementById("up").addEventListener("touchend", () => {
  movePlayer('end');
});
document.getElementById("left").addEventListener("touchstart", () => {
  movePlayer('left');
});
document.getElementById("left").addEventListener("touchend", () => {
  movePlayer('end');
});
document.getElementById("right").addEventListener("touchstart", () => {
  movePlayer('right');
});
document.getElementById("right").addEventListener("touchend", () => {
  movePlayer('end');
});
document.getElementById("attack").addEventListener("touchstart", () => {
  movePlayer('attack');
});
document.getElementById("attack").addEventListener("touchend", () => {
  movePlayer('end');
});

// enemy controls

document.getElementById("arrow-up").addEventListener("touchstart", () => {
  movePlayer('arrowUp');
});
document.getElementById("arrow-up").addEventListener("touchend", () => {
  movePlayer('arrowEnd');
});
document.getElementById("arrow-left").addEventListener("touchstart", () => {
  movePlayer('arrowLeft');
});
document.getElementById("arrow-left").addEventListener("touchend", () => {
  movePlayer('arrowEnd');
});
document.getElementById("arrow-right").addEventListener("touchstart", () => {
  movePlayer('arrowRight');
});
document.getElementById("arrow-right").addEventListener("touchend", () => {
  movePlayer('arrowEnd');
});
document.getElementById("arrow-attack").addEventListener("touchstart", () => {
  movePlayer('arrowAttack');
});
document.getElementById("arrow-attack").addEventListener("touchend", () => {
  movePlayer('arrowEnd');
});
