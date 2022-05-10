const urlid = 'c3cb20c3ad524955a3bb4d0f95b7ba4c';

var win = document.querySelector('.window');
var iframe = document.querySelector('#api-frame');
var cameraPath = [
    [0, 0, 800],
    [300, 300, 1200]
];

var cameraPosition = null;
var initialCameraPosition = null;
var initialTouch = null;
var isDragging = false;
var cameraSpeed = -0.001;
var cameraScrollSpeed = 1.5;

function updateCamera() {
    if (viewer.api && viewer.camera && cameraPosition) {
        viewer.api.setCameraLookAt(cameraPosition, viewer.camera.target, 0);
    }
    requestAnimationFrame(updateCamera);
}

var viewer = new Viewer(urlid, iframe, function() {

    // Camera Set Up
    cameraPosition = vec3.fromValues( // Get position
        viewer.camera.position[0],
        viewer.camera.position[1],
        viewer.camera.position[2]
    );

    win.addEventListener('touchstart', onPointerStart);
    win.addEventListener('mousedown', onPointerStart);
    win.addEventListener('touchmove', onPointerMove);
    win.addEventListener('mousemove', onPointerMove);
    win.addEventListener('touchend', onPointerEnd);
    win.addEventListener('mouseup', onPointerEnd);
    updateCamera();

    // Get Object IDs and integrate into the scroll
    viewer.api.getSceneGraph(function(err, result) {
        let objs = result.children[0].children[0].children[0].children[0].children;
        console.log(objs);
        let ids = [];
        objs.forEach(el => {
            if (el.name.includes("Areas")) {
                ids.push(el.instanceID)
            }
        });
        console.log(ids);
        let past_prog = 0 // I'll use this to determine direction
        let hidden = [];
        let h_range = null;
        let getRange = 0;


        //I have all object IDS HERe

        var scrollWindow = new ScrollWindow(win, function(progress) {
            // Viewer visibility
            var start = 10
            var end = 90
            var objs_count = ids.length
            var viewerEl = document.querySelector('.viewer');
            if (progress < start || progress > end) {
                viewerEl.classList.remove('visible'); // Make iframe invisible
                ids.forEach(el => { // Reset hidden values in iframe
                    viewer.api.show(el);
                })
            } else {
                viewerEl.classList.add('visible');
            }

            // Which way is the site being scrolled
            if (progress > start & progress < end) {
                let dir = null;
                if (past_prog - progress > 0) {
                    dir = 'up'
                } else {
                    dir = 'down'
                }

                if (dir == 'down') { // Hide thing on the way down
                    console.log('Going Down');
                    let getRange = Math.round((objs_count / (end - start)) * progress);
                    let pastRange = Math.round((objs_count / (end - start)) * past_prog)
                    let temp = ids.slice(pastRange, getRange); //All objects until now. This can be simplified
                    temp.forEach(el => {
                        viewer.api.hide(el)
                    });

                }

                if (dir == 'up') { // Show stuff on the way up
                    let maxRange = Math.round((objs_count / (end - start)) * progress)
                    let temp = ids.slice(maxRange, ids.length);
                    temp.forEach(el => {
                        viewer.api.show(el)
                    });
                }

                if (cameraPosition) {
                    var cameraProgress = Math.min(100, progress * cameraScrollSpeed);
                    //x
                    cameraPosition[0] = cameraPath[0][0] + ((cameraPath[0][0] - cameraPath[1][0]) / 100) * cameraProgress;
                    //y
                    cameraPosition[1] = cameraPath[0][1] + ((cameraPath[0][1] - cameraPath[1][1]) / 100) * cameraProgress;
                }
                past_prog = progress;
            };

        });




    });

});

function onPointerStart(e) {
    if (!cameraPosition) {
        return;
    }
    var x = e.touches ? e.touches[0].screenX : e.screenX;
    var y = e.touches ? e.touches[0].screenY : e.screenY;
    isDragging = true;
    initialTouch = [x, y];
    initialCameraPosition = vec3.clone(cameraPosition);
}

function onPointerMove(e) {
    if (!cameraPosition) {
        return;
    }

    if (!isDragging) {
        return;
    }

    var x = e.touches ? e.touches[0].screenX : e.screenX;
    var y = e.touches ? e.touches[0].screenY : e.screenY;
    var delta = [x - initialTouch[0], y - initialTouch[1]];
    var angle = Math.PI * delta[0] * cameraSpeed;
    var out = vec3.create();
    var cameraTargetVec = vec3.create(
        viewer.camera.target[0],
        viewer.camera.target[1],
        viewer.camera.target[2]
    );
    vec3.rotateZ(out, initialCameraPosition, cameraTargetVec, angle);
    vec3.set(cameraPosition, out[0], out[1], cameraPosition[2]);
}

function onPointerEnd(e) {
    isDragging = false;
}