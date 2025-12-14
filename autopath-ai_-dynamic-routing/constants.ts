import { Node, Edge } from './types';

// *****************************************************************************
// MODULE: PROCEDURAL GRID GENERATOR
// Reference: Paper Section 4.1
// Description: Generates a 9x9 grid (81 nodes) with hierarchical road levels.
// *****************************************************************************

// Configure grid size
const ROWS = 9;
const COLS = 9;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// Calculate spacing to fit canvas
const PADDING = 50;
const SPACING_X = (CANVAS_WIDTH - PADDING * 2) / (COLS - 1);
const SPACING_Y = (CANVAS_HEIGHT - PADDING * 2) / (ROWS - 1);

// 1. Automatically generate 9x9 nodes (81 nodes)
export const NODES: Node[] = [];

for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    const id = `${r * COLS + c + 1}`; // ID: 1 to 81
    NODES.push({
      id,
      x: PADDING + c * SPACING_X,
      y: PADDING + r * SPACING_Y,
      label: id,
      lightStatus: 'green' // Default green
    });
  }
}

// 2. Automatically generate edges (horizontal and vertical connections)
export const INITIAL_EDGES: Edge[] = [];

const createEdge = (source: string, target: string, baseSpeed: number): Edge => {
  const sNode = NODES.find(n => n.id === source)!;
  const tNode = NODES.find(n => n.id === target)!;
  
  // Calculate pixel distance and convert to km (assume 100px = 1km)
  const dx = sNode.x - tNode.x;
  const dy = sNode.y - tNode.y;
  const pixelDist = Math.sqrt(dx*dx + dy*dy);
  const kmDist = parseFloat((pixelDist / 100).toFixed(2));

  return {
    id: `${source}-${target}`,
    source,
    target,
    length: kmDist,
    limit: 60, // Max speed limit
    baseSpeed,
    currentSpeed: baseSpeed
  };
};

// Generation logic
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    const currentIndex = r * COLS + c + 1;
    const currentId = `${currentIndex}`;

    // Connect to right (if not last column)
    if (c < COLS - 1) {
      const rightId = `${currentIndex + 1}`;
      // Randomly assign base speed simulating road levels (Highway 60, Local 40)
      const isHighway = r % 4 === 0; 
      INITIAL_EDGES.push(createEdge(currentId, rightId, isHighway ? 60 : 40));
    }

    // Connect down (if not last row)
    if (r < ROWS - 1) {
      const downId = `${currentIndex + COLS}`;
      const isHighway = c % 4 === 0;
      INITIAL_EDGES.push(createEdge(currentId, downId, isHighway ? 60 : 40));
    }
  }
}

export const CONSTRAINT_LIMITS = {
  maxChanges: 2,
  minSpeed: 5, // km/h
};