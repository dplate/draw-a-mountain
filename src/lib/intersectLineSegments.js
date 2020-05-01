export default (line1, line2) => {
  const diff1X = line1.end.x - line1.start.x;
  const diff1Y = line1.end.y - line1.start.y;

  const diff2X = line2.end.x - line2.start.x;
  const diff2Y = line2.end.y - line2.start.y;

  const diff3X = line2.end.x - line1.start.x;
  const diff3Y = line2.end.y - line1.start.y;

  const det = diff1X * diff2Y - diff2X * diff1Y;
  if (det === 0) {
    return false;
  } else {
    const lambda = (diff2Y * diff3X - diff2X * diff3Y) / det;
    const gamma = (diff1X * diff3Y - diff1Y * diff3X) / det;
    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
  }
};