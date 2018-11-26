# angular.keruC
Seat map picker using AngularJs 1.x and HTML5 Canvas

Demo: https://shadahm.github.io/angular.keruC

# How to use
**Note**: Current version of keruC is stil work-in-progress. Use at your own risk.  

Include keruC in your HTML file (reference after Angular):
```html
<script type="text/javascript" src="/angular.keruc.js"></script>
```

In your controller, you will need a data for your seatmap:
```javascript
angular.module('yourApp')
	.controller('yourController', function($scope) {
		$scope.seatsData = getSeatsData(); 
	}); 
```
Put this element where you'd like your seat map to be:
```html
<div ng-controller="yourController">
	<keruc-seatpicker data-data="seatsData"></keruc-seatpicker>
</div>
```
## Data structure
`$scope.seatsData` in the above example, needs to abide to a specific data structure: (here visualized in TypeScript)
```typescript
class SeatsData {
    rows : Row[];
}

class Row {
    rowname : string; 
    nodes : Node[];
}

class Node {
    type : NodeType;
    uniqueName : string; // this must be unique
    displayName : string; // this property will be what's displayed on the seats of your seat map
    selected : NodeState; 
}

enum NodeType {
    Void, // will be rendered as a blank 'square', i.e for aisles
    Seat 
}

enum NodeState {
    Vacant,
    Occupied,
    Selected
}
```

## Customize
You can customize your seat picker by specifying these following attributes:
```html
<keruc-seatpicker
    data-data="seatsData"
    data-canvas-width="500"
    data-canvas-height="500"
    data-vacant-colour-bg="#76D75D"
    data-vacant-colour-fg="#C1F2B4"
    data-occupied-colour-bg="#F56979"
    data-occupied-colour-fg="#BB1F31"
    data-selected-colour-bg="#7854AF"
    data-selected-colour-fg="#472085"
></keruc-seatpicker>
```
**Note**: What you're also seeing here are the default values where these attributes are not specified. 

## Attach your callbacks
It is also possible to call a function in your controller scope when:

1. User selects a node (a seat)
2. User deselects a node
3. User attempting to click on a disallowed node (occupied seat)

To attach your callback, simply specify them in the following attributes:
```html
<keruc-seatpicker
    data-data="seatsData"
    data-on-selected="onSeatSelected($node)"
    data-on-deselected="onSeatDeselected($node)"
    data-on-disallowed-selected="onDisallowedSelected($node)"
></keruc-seatpicker>
```
The `$node` will be injected into your callback function where you can access them like so:
```javascript
$scope.onSeatSelected = function(node) {
	console.log('user selected ', node.displayName); 
}
```
