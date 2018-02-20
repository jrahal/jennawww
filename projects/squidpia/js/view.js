/***
 * Scaffolded by Jingjie (Vincent) Zheng on June 24, 2015.
 */

'use strict';

/**
 * A function that creates and returns the spaceship model.
 */

function createViewModule() {
  var SpaceshipView = function(model, canvas) {
    /**
     * Obtain the SpaceshipView itself.
     */
    var self = this;
    var tailposition = 0; 
    var isBig = false; 
    var isClicked = false; 
    var clickPoint;
    var stretched = 0; 
    var pointer = document.getElementById('canvas');
    /**
     * Maintain the model.
     */
    this.model = model;

    /**
     * Maintain the canvas and its context.
     */
    this.canvas = canvas;
    this.context = canvas.getContext('2d');


    /**
     * Update the canvas. 
     */
    this.update = function() {
        
        this.context.clearRect(0, 0, canvas.width, canvas.height);
        this.model.rootNode.renderAll(this.context);
    };
    this.model.rootNode.addListener(this);
    this.model.headNode.addListener(this);
    this.model.bodyNode.addListener(this);
    this.model.handleNode.addListener(this);
    this.model.tailNode.addListener(this);
    this.model.rootNode.addListener(this);
    this.model.spaceshipNode.addListener(this);

    /**
     * Handle mousedown events.
     */ 
    canvas.addEventListener('mousedown', function(e) {
        var bound = canvas.getBoundingClientRect();
        var point = {
            x: e.pageX - bound.left,
            y: e.pageY - bound.top
        };
        console.log(point);
        if (model.bodyNode.performHitDetection(point)) {
            clickPoint = point; 
            isClicked = true;
            console.log('body!');
            if (model.handleNode.performHitDetection(point)) {
            }
        }
    });

    /**
     * Handle mousemove events.
     */ 
    canvas.addEventListener('mousemove', function(e) {
        var bound = canvas.getBoundingClientRect();
        var point = {
            x: e.pageX - bound.left,
            y: e.pageY - bound.top
        };
        if (model.bodyNode.performHitDetection(point)) {
            pointer.style.cursor = 'move'; 
        } else {
            pointer.style.cursor = 'default'; 
        }

        if (model.bodyNode.performHitDetection(point) && isClicked) {
            pointer.style.cursor = 'move'; 
            if (model.handleNode.performHitDetection(point)) {
                console.log('handle!');
                if (point.y < clickPoint.y) {
                    if (stretched <= 14) {
                        stretched++; 
                        console.log(stretched);
                        model.bodyNode.scale(1,1.02);
                        model.handleNode.scale(1,1/1.02);
                        model.headNode.translate(0,-Math.pow(1.1,stretched));
                    }
                } else if (point.y > clickPoint.y) {
                    if (stretched >= -18) {
                        stretched--; 
                        console.log(stretched);
                        model.bodyNode.scale(1,1/1.02);
                        model.handleNode.scale(1,1.02);
                        model.headNode.translate(0,Math.pow(1.1,stretched));
                    }
                }
            } else {
                console.log(clickPoint);
                console.log(point);

                setTimeout(function() {
                    model.spaceshipNode.translate((point.x - clickPoint.x)*0.05, (point.y - clickPoint.y)*0.05);

                }, 1000/60);
            }
        }
    });


    /**
     * Handle mouseup events.
     */ 
    canvas.addEventListener('mouseup', function(e) {
      isClicked = false; 
    });

    /**
     * Handle keydown events.
     */ 
    
    var notBig = function() {
        isBig = false; 
        model.spaceshipNode.scale(1/1.2,1/1.2);
    }

    document.addEventListener('keydown', function(e) {
      console.log(e.keyCode);
      console.log(tailposition);
      // move up
    if (e.keyCode == '38') {
        e.preventDefault();
        var speed = -3;
        model.fireNode.isFire = true; 
        if (isBig)
            speed = -6
            if (tailposition > 0) {
                model.spaceshipNode.translate(0, speed);
                model.spaceshipNode.rotate(tailposition * -.03,0,0);
           } else if (tailposition < 0) {
                model.spaceshipNode.translate(0,speed);
                model.spaceshipNode.rotate(tailposition * -.03,0,0);                
           }
        if (isBig) {
            model.spaceshipNode.translate(0,speed);
        }
        model.spaceshipNode.translate(0,speed);
    } // left
     else if (e.keyCode == '37') {
        e.preventDefault();
            if (tailposition * 0.05 < 0.785398163 /2) {
                model.tailNode.rotate(.05,0,0);
                tailposition++;
            }
     } // right
     else if (e.keyCode == '39') {
        e.preventDefault();
            if (tailposition * 0.05 > -0.785398163 /2) {
                model.tailNode.rotate(-.05,0,0);
                tailposition--;
           }

     } // space
     else if (e.keyCode == '32' && !isBig) {
        e.preventDefault();
        isBig = true;
        model.spaceshipNode.scale(1.2,1.2);
        setTimeout(notBig,5000);
     }
    });

    /**
     * Handle keyup events.
     */ 
    document.addEventListener('keyup', function(e) {
      if (e.keyCode == '38') {
        model.fireNode.isFire = false; 
        model.spaceshipNode.translate(0,0);
        } 
    else if (e.keyCode == '32' && isBig) {
        e.preventDefault();
     }
    });

    /**
     * Update the view when first created.
     */
    this.update();
  };

  return {
    SpaceshipView: SpaceshipView
  };
}