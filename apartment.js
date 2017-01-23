module.exports = {
  floorplan: {
    height: 456,
    width: 240,
    wallWidth: 1,
    lightSize: 8,
    lightHitTargetSize: 35,
    boxes: [
      { id: 1, x:   5, y:   5, w: 230, h: 446 }, // Apartment
      { id: 2, x:   5, y: 160, w: 110, h:  70 }, // Stairs
      { id: 3, x:   5, y: 230, w:  60, h:  90 }, // Bathroom
      { id: 4, x:   5, y: 320, w: 130, h: 131 }, // Bedroom
      { id: 5, x: 135, y: 320, w: 100, h: 131 }, // Office
      { id: 6, x: 160, y: 160, w:  75, h: 160 }  // Kitchen
    ]
  },
  lights: [
    { id: 5, name: 'Window',        cx:  75, cy:  15 },
    { id: 2, name: 'Bloom',         cx: 130, cy:  15 },
    { id: 8, name: 'Dining',        cx: 175, cy:  78 },
    { id: 6, name: 'Half wall',     cx:  40, cy: 150 },
    { id: 1, name: 'Stairs',        cx:  80, cy: 170 },
    { id: 4, name: 'Mud room',      cx:  40, cy: 220 },
    { id: 3, name: 'Top of Stairs', cx:  75, cy: 260 },
    //{ id: 7, name: 'Strips',        cx: -99, cy: -99 } // TODO - place in apartment somewhere
  ]
}
