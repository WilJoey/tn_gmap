var drawingManager;
var selectedShape;
var gmap;
var shapes = [];

$(document).ready(initialize);

function initialize() {
    var mapOptions = {
        center: new google.maps.LatLng(25.039059, 121.517647),
        zoom: 17,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    gmap = new google.maps.Map(document.getElementById("dvMap"), mapOptions);
    var polyOption = {
        strokeWeight: 1,
        fillColor: '#1E90FF',
        strokeColor: '#1E90FF',
        fillOpacity: 0.45,
        editable: true
    };
    drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: null, //google.maps.drawing.OverlayType.POLYGON,
        drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [
                //google.maps.drawing.OverlayType.RECTANGLE,
                google.maps.drawing.OverlayType.POLYGON
            ]
        },
        polygonOptions: polyOption,
        rectangleOptions: polyOption,
        map: gmap
    });
    //drawingManager.setMap(gmap);

    google.maps.event.addListener(drawingManager, 'overlaycomplete', function(e) {

        // Switch back to non-drawing mode after drawing a shape.
        drawingManager.setDrawingMode(null);
        // Add an event listener that selects the newly-drawn shape when the user
        // mouses down on it.
        //e.overlay.type = e.type;
        google.maps.event.addListener(e.overlay, 'click', function() {
            setSelection(e.overlay);
        });
        shapes.push(e.overlay);
        setSelection(e.overlay);

    });

    // Clear the current selection when the drawing mode is changed, or when the
    // map is clicked.
    google.maps.event.addListener(drawingManager, 'drawingmode_changed', clearSelection);
    google.maps.event.addListener(gmap, 'click', clearSelection);
    google.maps.event.addDomListener(document.getElementById('delete-button'), 'click', deleteSelectedShape);
    google.maps.event.addDomListener(document.getElementById('area-button'), 'click', function() {
        var sum = 0;
        for (var s in shapes) {
            var shape = shapes[s];
            sum += google.maps.geometry.spherical.computeArea(shape.getPath());
        }
        var pp = parseFloat(document.getElementById('people-text').value);
        var total = parseInt(sum * pp);
        //console.log("面積：" + sum + " 平方公尺，總計約：" + total + " 人。");
        $("#dvInfo").html("面積：" + Math.round(sum * 100) / 100 + " 平方公尺<br/>總計約：" + total + " 人。");
    });
    google.maps.event.addDomListener(document.getElementById('clear-button'), 'click', clearShapes);
    google.maps.event.addDomListener(document.getElementById('sample-button'), 'click', loadSampleShapes);

}


function clearSelection() {
    if (selectedShape) {
        selectedShape.setEditable(false);
        selectedShape = null;
    }
}

function setSelection(shape) {
    clearSelection();
    selectedShape = shape;
    shape.setEditable(true);
    //selectColor(shape.get('fillColor') || shape.get('strokeColor'));
}

function deleteSelectedShape() {
    if (selectedShape) {
        var idx = shapes.indexOf(selectedShape);
        if (idx != -1) {
            shapes.pop(idx);
        }
        selectedShape.setMap(null);
    }
}

function clearShapes() {
    selectedShape = null;
    for (var s in shapes) {
        shapes[s].setMap(null);
    }
    shapes = [];
}

function loadSampleShapes() {
    clearShapes();
    for (var s in SAMPLE_PATHS) {
        var paths = SAMPLE_PATHS[s];
        var coords = [];
        for (var c in paths) {
            var node = paths[c];
            coords.push(new google.maps.LatLng(node.lat, node.lng));
        }
        var poly = new google.maps.Polygon({
            paths: coords,
            strokeColor: '#1E90FF',
            strokeOpacity: 1,
            strokeWeight: 1,
            fillColor: '#1E90FF',
            fillOpacity: 0.45
        });
        createPolygon(poly);
    }
}

function createPolygon(polygon) {
    google.maps.event.addListener(polygon, 'click', function() {
        setSelection(polygon);
    });
    polygon.setMap(gmap);
    shapes.push(polygon);
}

function getselectedShapePath() {
    var path2 = [];
    var a = selectedShape.getPath();
    a.forEach(function(d, i) {
        path2.push({
            "lat": d.lat(),
            "lng": d.lng()
        });
    });
    return JSON.stringify(path2);
}