#import <math.h>
#define bool int
#define true 1
#define false 0

bool ccw(
  float xA, float yA,
  float xB, float yB,
  float xC, float yC)
{
  return (yC - yA) * (xB - xA) > (yB - yA) * (xC - xA);
}

bool ccw2(
  float xAB, float yAB,
  float xAC, float yAC)
{
  return yAC * xAB > yAB * xAC;
}

float squareMagnitude(float x, float y)
{
  return x * x + y * y;
}

float magnitude(float x, float y)
{
  return sqrt(x * x + y * y);
}

float dotProduct(
  float xA, float yA,
  float xB, float yB)
{
  return xA * xB + yA * yB;
}

float vectorProduct(
  float xA, float yA,
  float xB, float yB)
{
  return xA * yB - yA * xB;
}

float squareEuclideanDistance(
  float xA, float yA,
  float xB, float yB)
{
  float dX = xB-xA, dY = yB-yA;
  return dX * dX + dY * dY;
}

float euclideanDistance(
  float xA, float yA,
  float xB, float yB)
{
  float dX = xB-xA, dY = yB-yA;
  return sqrt(dX * dX + dY * dY);
}

float manhattanDistance(
  float xA, float yA,
  float xB, float yB)
{
  float dX = xB-xA, dY = yB-yA;
  return abs(dX + dY);
}

float diagonalDistance(
  float xA, float yA,
  float xB, float yB)
{
  float dX = abs(xB-xA), dY = abs(yB-yA);
  return dX > dY ? dX : dY;
}

bool circlesIntersect(
  float xC1, float yC1, float r1,
  float xC2, float yC2, float r2)
{
  float d = euclideanDistance(xC1, yC1, xC2, yC2);
	return d < r1 + r2 && r1 < d + r2 && r2 < d + r1;
}
bool circleLineIntersect(
  float xC, float yC, float r,
  float xA, float yA, float xB, float yB)
{
  if( (euclideanDistance(xA, yA, xC, yC) < r) != euclideanDistance(xB, yB, xC, yC) < r) return true;

  float xAC = xC - xA, yAC = yC - yA;
  float xU = xB - xA, yU = yB - yA;
  float m = magnitude(xU, yU);
  xU /= m;
  yU /= m;
	float d = dotProduct(xU, yU, xAC, yAC);
	float l = euclideanDistance(xA, yA, xB, yB);
	if(d < 0 || d > l) return false;

  xU = xU*d + xA;
  yU = yU*d + yA;
  return squareEuclideanDistance(xU, yU, xC, yC) <= r*r;
}

float linesIntersect(
  float xA, float yA,
  float xB, float yB,
  float xC, float yC,
  float xD, float yD)
{
  float xAC = xC - xA, yAC = yC - yA;
  float xAD = xD - xA, yAD = yD - yA;
  float xBC = yC - xB, yBC = yC - yB;
  float xBD = xD - xB, yBD = yD - yB;
  if (ccw2(xAC, yAC, xAD, yAD) !=
			ccw2(xBC, yBC, xBD, yBD)) {
	  float xAB = xB - xA, yAB = yB - yA;
	  return ccw2(xAB, yAB, xAC, yAC) !=
	         ccw2(xAB, yAB, xAD, yAD);
	}
	else return false;
}