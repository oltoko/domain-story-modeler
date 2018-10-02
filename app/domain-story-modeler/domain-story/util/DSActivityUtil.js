import { calculateDeg } from './DSUtil';

'use strict';

/**
 * Utility functions that deal with activities
*/

// get a list of activities, that originate from an actor-type
export function getActivitesFromActors(canvasObjects) {
  var activiesFromActors = [];

  canvasObjects.forEach(element => {
    if (element.type.includes('domainStory:activity')) {
      if (element.source.type.includes('domainStory:actor')) {
        activiesFromActors.push(element);
      }
    }
    if (element.type.includes('domainStory:group')) {
      var groupChildren = element.children;
      groupChildren.forEach(child => {
        if (child.type.includes('domainStory:activity')) {
          if (child.source.type.includes('domainStory:actor')) {
            activiesFromActors.push(child);
          }
        }
      });
    }
  });
  return activiesFromActors;
}

// get the IDs of activities with their associated number, only returns activities that are originating from an actor
export function getNumbersAndIDs(canvas) {
  var iDWithNumber = [];
  var canvasObjects = canvas._rootElement.children;
  var activities = getActivitesFromActors(canvasObjects);

  for (var i = activities.length - 1; i >= 0; i--) {
    var id = activities[i].businessObject.id;
    var number = activities[i].businessObject.number;
    iDWithNumber.push({ id: id, number: number });
  }
  return iDWithNumber;
}

// position Functions

// calculate the center between two points
export function calculateXY(startPoint, endPoint) {
  var centerPoint;

  if (startPoint >= endPoint) {
    centerPoint = (startPoint - endPoint) / 2 + endPoint;
  } else {
    centerPoint = (endPoint - startPoint) / 2 + startPoint;
  }

  return centerPoint;
}

// determine the position of the label at the activity
export function labelPosition(waypoints) {
  var amountWaypoints = waypoints.length;
  var determinedPosition = {};
  var xPos = 0;
  var yPos = 0;

  if (amountWaypoints > 2) {
    var angleActivity = new Array(amountWaypoints - 1);
    for (var i = 0; i < amountWaypoints - 1; i++) { // calculate the angles of the activities
      angleActivity[i] = calculateDeg(waypoints[i], waypoints[i + 1]);
    }

    var selectedActivity = selectPartOfActivity(waypoints, angleActivity);

    xPos = labelPositionX(waypoints[selectedActivity], waypoints[selectedActivity + 1]);
    yPos = labelPositionY(waypoints[selectedActivity], waypoints[selectedActivity + 1]);

    determinedPosition = {
      x: xPos,
      y: yPos,
      selected: selectedActivity
    };

    return determinedPosition;

  } else {
    xPos = labelPositionX(waypoints[0], waypoints[1]);
    yPos = labelPositionY(waypoints[0], waypoints[1]);

    determinedPosition = {
      x: xPos,
      y: yPos,
      selected: 0
    };

    return determinedPosition;
  }
}

// calculate the X position of the label
export function labelPositionX(startPoint, endPoint) {
  var angle = calculateDeg(startPoint, endPoint);
  var offsetX = 0;
  var scaledangle = 0;
  if (angle == 0 || angle == 180 || angle == 90 || angle == 270) {
    offsetX = 0;
  }
  else if (angle > 0 && angle < 90) { // endpoint in upper right quadrant
    offsetX = 5 - angle / 6;
  }
  else if (angle > 90 && angle < 180) { // endpoint in upper left quadrant
    scaledangle = angle - 90;
    offsetX = 5 - scaledangle / 18;
  }
  else if (angle > 180 && angle < 270) { // endpoint in lower left quadrant
    scaledangle = angle - 180;
    offsetX = scaledangle / 18;
  }
  else if (angle > 270) { // endpoint in lower right quadrant
    scaledangle = angle - 270;
    offsetX = 5 - scaledangle / 6;
  }
  return offsetX + calculateXY(startPoint.x, endPoint.x);
}

// calculate the Y position of the label
export function labelPositionY(startPoint, endPoint) {
  var angle = calculateDeg(startPoint, endPoint);
  var offsetY = 0;
  var scaledangle = 0;

  if (angle == 0 || angle == 180) {
    offsetY = 15;
  }
  else if (angle == 90 || angle == 270) {
    offsetY = 0;
  }
  else if (angle > 0 && angle < 90) { // endpoint in upper right quadrant
    offsetY = 15 - angle / 6;
  }
  else if (angle > 90 && angle < 180) { // endpoint in upper left quadrant
    scaledangle = angle - 90;
    offsetY = -scaledangle / 9;
  }
  else if (angle > 180 && angle < 270) { // endpoint in lower left quadrant
    scaledangle = angle - 180;
    offsetY = 15 - scaledangle / 3;
  }
  else if (angle > 270) { // endpoint in lower right quadrant
    scaledangle = angle - 270;
    offsetY = -scaledangle / 9;
  }
  return offsetY + calculateXY(startPoint.y, endPoint.y);
}

// select at which part of the activity the label should be attached to
export function selectPartOfActivity(waypoints, angleActivity) {
  var selectedActivity = 0;
  var i = 0;
  var linelength = 49;

  for (i = 0; i < waypoints.length; i++) {
    if ((angleActivity[i] == 0) || (angleActivity[i] == 180)) {
      var length = Math.abs(waypoints[i].x - waypoints[i + 1].x);
      if (length > linelength) {
        selectedActivity = i;
      }
    }
  }
  return selectedActivity;
}