let G = 10; // gravitational constant
let planets = []; // array of planets
let selectedPlanet = null; // currently selected planet
let mouseOffset = null; // offset between mouse and selected planet
let mouseHeld = false; // true if mouse is currently held down
let dt = 0.10; // time step

class Planet {
  constructor(x, y, mass) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.mass = mass;
  }

  draw() {
    stroke(0);
    fill(255, 0, 0);
    ellipse(this.pos.x, this.pos.y, this.mass * 2, this.mass * 2);
  }

  isMouseOver() {
    let d = dist(mouseX, mouseY, this.pos.x, this.pos.y);
    return d < this.mass;
  }

  isColliding(other) {
    let d = p5.Vector.dist(this.pos, other.pos);
    return d < this.mass + other.mass;
  }
}

function setup() {
  createCanvas(800, 800);
  // create two planets
  planets.push(new Planet(width/2, height/2, 50));
  planets.push(new Planet(width/2 + 300, height/2, 10));
}

function draw() {
  background(255);
  // update positions and velocities of planets
  for (let i = 0; i < planets.length; i++) {
    let planet = planets[i];
    let acc = createVector(0, 0);
    for (let j = 0; j < planets.length; j++) {
      if (i != j) {
        acc.add(getGravity(planet.pos, planet.mass, planets[j].pos, planets[j].mass));
      }
    }
    planet.vel.add(p5.Vector.mult(acc, dt));
    planet.pos.add(p5.Vector.mult(planet.vel, dt));
    
    // check for collisions with other planets
    for (let j = i+1; j < planets.length; j++) {
      let other = planets[j];
      if (planet.isColliding(other)) {
        let impulse = p5.Vector.sub(other.pos, planet.pos);
        impulse.setMag((planet.vel.mag() + other.vel.mag())/2);
        planet.vel.add(p5.Vector.mult(impulse, -1/planet.mass));
        other.vel.add(p5.Vector.mult(impulse, 1/other.mass));
      }
    }
    
    // check for collisions with canvas borders
    if (planet.pos.x - planet.mass < 0 && planet.vel.x < 0) {
      planet.vel.x *= -1;
    }
    if (planet.pos.x + planet.mass > width && planet.vel.x > 0) {
      planet.vel.x *= -1;
    }
    if (planet.pos.y - planet.mass < 0 && planet.vel.y < 0) {
      planet.vel.y *= -1;
    }
    if (planet.pos.y + planet.mass > height && planet.vel.y > 0) {
      planet.vel.y *= -1;
    }
  }
  // draw planets
  for (let planet of planets) {
    planet.draw();
  }
  // handle mouse interaction
  if (selectedPlanet != null) {
    if (mouseHeld) {
      // move selected planet to mouse position
      selectedPlanet.pos.x = mouseX - mouseOffset.x;
      selectedPlanet.pos.y = mouseY - mouseOffset.y;
    } else {
      // throw selected planet based on mouse velocity
      selectedPlanet.vel = createVector(mouseX - pmouseX, mouseY - pmouseY);
      selectedPlanet = null;
    }
  }
}

function mousePressed() {
  // check if mouse is over a planet
  for (let planet of planets) {
    if (planet.isMouseOver()) {
      selectedPlanet = planet;
      mouseOffset = createVector(mouseX - planet.pos.x, mouseY - planet.pos.y);
      mouseHeld = true;
      break;
    }
  }
}

function mouseReleased() {
  mouseHeld = false;
}

// calculate gravitational force between two planets
function getGravity(pos1, mass1, pos2, mass2) {
  let r = p5.Vector.dist(pos1, pos2);
  let f = G * mass1 * mass2 / (r * r);
  let dir = p5.Vector.sub(pos2, pos1);
  dir.setMag(f);
  return dir;
}
