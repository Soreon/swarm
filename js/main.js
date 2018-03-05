/* eslint-env browser */

Math.TAU = Math.PI * 2;
const creatures = [];
const creatureSize = 10;
const creatureNoseSize = 15;
const numberOfCreatures = 100;
const maxSpeed = 4;
const defaultSightθ = Math.TAU / 16;
const sightIncrement = defaultSightθ / 2;
const creatureViewSize = 75;
const creatureRepulsionSize = 25;
const canvasWidth = 1200;
const canvasHeight = 900;
const frameRat = 60;

function isTooCloseToNeighbours(neighbours, nX, nY) {
  for (let i = 0; i < neighbours.length; i += 1) {
    if (Math.hypot(neighbours[i].x - nX, neighbours[i].y - nY) < creatureRepulsionSize) {
      return true;
    }
  }
  return false;
}

function createCreatures(number) {
  let tx;
  let ty;
  let iter;
  for (let i = 0; i < number; i += 1) {
    iter = 0;
    do {
      tx = random(0, canvasWidth);
      ty = random(0, canvasHeight);
      iter += 1;
      if (iter > 1000) {
        return;
      }
    } while (isTooCloseToNeighbours(creatures, tx, ty));
    creatures[i] = {
      x: tx,
      y: ty,
      θ: random(Math.TAU),
      v: random(maxSpeed / 2) + (maxSpeed / 2),
      neighbours: [],
      averages: {},
    };
  }
}

function nextStep() {
  let nextX;
  let nextY;
  let nextθ;
  let localSightθ;
  let tooClose;
  for (let i = 0; i < creatures.length; i += 1) {
    localSightθ = defaultSightθ;
    do {
      if (Object.keys(creatures[i].averages).length !== 0) {
        nextθ = creatures[i].averages.θ + random(-localSightθ, localSightθ);
      } else {
        nextθ = creatures[i].θ + random(-localSightθ, localSightθ);
      }
      nextX = creatures[i].x + Math.round(creatures[i].v * Math.cos(nextθ));
      nextY = creatures[i].y + Math.round(creatures[i].v * Math.sin(nextθ));
      tooClose = isTooCloseToNeighbours(creatures[i].neighbours, nextX, nextY);
      if (nextX < 0 || nextY < 0 || nextX > width || nextY > height || tooClose) {
        if (localSightθ > Math.TAU) {
          nextX = creatures[i].x;
          nextY = creatures[i].y;
          break;
        }
        localSightθ += sightIncrement;
      }
    } while (nextX < 0 || nextY < 0 || nextX > width || nextY > height || tooClose);

    creatures[i].x = nextX;
    creatures[i].y = nextY;
    creatures[i].θ = nextθ % Math.TAU;
  }
}

function setup() { // eslint-disable-line no-unused-vars
  frameRate(frameRat);
  createCanvas(canvasWidth, canvasHeight);
  createCreatures(numberOfCreatures);
}

function computeAverage(creature) {
  creature.averages = {};
  if (creature.neighbours.length > 0) {
    let sumθx = 0;
    let sumθy = 0;
    let sumX = 0;
    let sumY = 0;
    const cluster = creature.neighbours.slice(0);
    cluster.push(creature);
    const retObj = {};
    for (let i = 0; i < cluster.length; i += 1) {
      sumθx += Math.cos(cluster[i].θ);
      sumθy += Math.sin(cluster[i].θ);
      sumX += cluster[i].x;
      sumY += cluster[i].y;
    }
    retObj.θ = Math.atan2(sumθy, sumθx);
    retObj.x = sumX / cluster.length;
    retObj.y = sumY / cluster.length;
    creature.averages = retObj;
  }
}

function computeAverages() {
  for (let i = 0; i < creatures.length; i += 1) {
    computeAverage(creatures[i]);
  }
}

function computeMetricNeighbours() {
  for (let i = 0; i < creatures.length; i += 1) creatures[i].neighbours = [];
  for (let i = 0; i < creatures.length; i += 1) {
    for (let j = i + 1; j < creatures.length; j += 1) {
      if (Math.hypot(creatures[j].x - creatures[i].x, creatures[j].y - creatures[i].y) <= creatureViewSize) {
        creatures[i].neighbours.push(creatures[j]);
        creatures[j].neighbours.push(creatures[i]);
      }
    }
  }
}

function drawCreature(creature) {
  // Créature
  stroke(0);
  fill(255);
  ellipse(creature.x, creature.y, creatureSize);

  // Nez de la créature
  const tx = creatureNoseSize * Math.cos(creature.θ);
  const ty = creatureNoseSize * Math.sin(creature.θ);
  stroke(color(255, 0, 0));
  line(creature.x, creature.y, creature.x + tx, creature.y + ty);
}

function drawNeighboursLinks(creature) {
  for (let i = 0; i < creature.neighbours.length; i += 1) {
    stroke(color(0, 255, 255));
    line(creature.x, creature.y, creature.neighbours[i].x, creature.neighbours[i].y);
  }
}

function drawViews(creature) {
  stroke('rgba(255, 0, 0, 0.6)');
  fill('rgba(255, 0, 0, 0.3)');
  ellipse(creature.x, creature.y, creatureViewSize * 2);
  ellipse(creature.x, creature.y, creatureRepulsionSize * 2);
}

function drawAverages() {
  for (let i = 0; i < creatures.length; i += 1) {
    const tx = 10 * Math.cos(creatures[i].averages.θ);
    const ty = 10 * Math.sin(creatures[i].averages.θ);
    stroke(color(255, 0, 255));
    line(creatures[i].averages.x, creatures[i].averages.y, creatures[i].averages.x + tx, creatures[i].averages.y + ty);

    fill(color(255, 0, 255));
    ellipse(creatures[i].averages.x, creatures[i].averages.y, 5);
  }
}

function draw() { // eslint-disable-line no-unused-vars
  clear();
  computeMetricNeighbours();
  nextStep();
  computeAverages();

  for (let i = 0; i < creatures.length; i += 1) {
    drawCreature(creatures[i]);
    drawNeighboursLinks(creatures[i]);
    // drawViews(creatures[i]);
  }
  // drawAverages();
}
