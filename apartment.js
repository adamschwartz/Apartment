module.exports = {
  floorplan: {
    height: 380,
    width: 200,
    wallWidth: 2,
    lightSize: 8,
    lightHitTargetSize: 16,
    boxes: [
      { id: 1, x:   2, y:   2, w: 196, h: 376 },
      { id: 2, x:   2, y: 120, w:  80, h:  80 },
      { id: 3, x:   2, y: 200, w:  50, h:  80 },
      { id: 4, x:   2, y: 280, w: 110, h:  98 },
      { id: 5, x: 112, y: 280, w:  86, h:  98 },
      { id: 6, x: 140, y: 160, w:  58, h: 120 }
    ]
  },
  lights: [
    { id: 5, name: 'Window',        cx:  70, cy:   8 },
    { id: 2, name: 'Bloom',         cx: 100, cy:   8 },
    { id: 8, name: 'Dining',        cx: 150, cy:  60 },
    { id: 6, name: 'Half wall',     cx:  34, cy: 110 },
    { id: 1, name: 'Stairs',        cx:  54, cy: 130 },
    { id: 4, name: 'Mud room',      cx:  25, cy: 190 },
    { id: 3, name: 'Top of Stairs', cx:  58, cy: 220 },
    { id: 7, name: 'Strips',        cx: -10, cy: -10 } // TODO - place in apartment somewhere
  ]
}
