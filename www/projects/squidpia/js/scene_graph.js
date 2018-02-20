/***
 * Scaffolded by Jingjie (Vincent) Zheng on June 24, 2015.
 */

'use strict';

/**
 * A function that creates and returns the scene graph classes.
 */
function createSceneGraphModule() {

    function P(x, y) {
      this.x = x;
      this.y = y;
    }

    /**
     * An abstract graph node in a scene graph.
     * @param id: Node identifier.
     * @param parent: Parent of the node in the scene graph.
     */
    var GraphNode = function(id, parent) {
        // Maintain the identifier.
        this.id = id;

        // Maintain a local transformation that is relative to its parent.
        this.localTransformation = new AffineTransform();

        // Maintain a global transformation that is relative to the canvas coordinate.
        // This matrix is useful when performing a hit detection.
        this.globalTransformation = new AffineTransform();

        // If a valid parent is passed in, save the parent to this node, then add this node to the parent.
        this.parent = typeof parent !== 'undefined' ? parent : null;
        if (parent) {
            parent.addChild(this);
        }

        // Maintain a list of child nodes.
        this.children = [];
        this.points = [];
        // Local bounding box of this node. This should be overridden by concreate graph nodes.
        // The coordinate of the bounding box is from the perspective of the node itself, not 
        // from the canvas.
        this.localBoundingBox = {
            x: 0,
            y: 0,
            w: 0,
            h: 0
        };

        // Indicate whether this node is interactable with a mouse. If it is not interactable with 
        // mouse at all, we do not need to perform a hit detection on it.
        this.isInteractableWithMouse = false;

        // Maintain a list of listners.
        this.listeners = [];
    };

    _.extend(GraphNode.prototype, {
        
        /**
         * Notify all listeners the change in this node.
         */
        notify: function() {
            
            _.each(this.listeners, function(listener) {
               listener.update(); 
            });
        },

        /**
         * Add a listener, if it is not registered with this node.
         * @param listener: Object that listens for the change of the node.
         */
        addListener: function(listener) {
            this.listeners.push(listener);
        },

        /**
         * Remove a listener, if it is registered with this node.
         * @param listener: Listener that is registered with this node. 
         */
        removeListener: function(listener) {
            var index = this.listeners.indexOf(listener);
            if (index !== -1) {
                this.listeners.splice(index, 1);
            }            
        },

        /**
         * Add a child node to this node if it is not appended to this node.
         * 
         * You should point the child's parent to this node and add the child to the children list.
         * You should also recursively update the global transformations of its descendants, as they are
         * appended to a new parent.
         * @param node: Child node to be added.
         */
        addChild: function(node) {
            this.children.push(node); 
        },

        /**
         * Remove a child node of this node, if it is appended to this node.
         * @param node: Child node to be removed.
         */
        removeChild: function(node) {
            var index = this.children.indexOf(node);
            this.children.splice(index, 1);
        },

        /**
         * Apply a Google Closure AffineTransform object to the HTML5 Canvas context.
         * @param context: HTML5 Canvas context.
         * @param transformation: Google Closure AffineTransform object.
         */
        applyTransformationToContext: function(context, transformation) {
            context.transform(transformation.m00_, 
                transformation.m10_,
                transformation.m01_,
                transformation.m11_,
                transformation.m02_,
                transformation.m12_);
        },

        /**
         * Update the global transformation of _ONLY_ this node.
         * Specifically, if it is the root of the scene graph, update itself with its local 
         * transformation, otherwise clone the global transformation of its parent, then concatenate it 
         * with this node's local transformation.
         */
        updateGlobalTransformation: function() {
            
            if (this.parent == null) {
               var clone = this.localTransformation.clone();
                
                this.globalTransformation = clone;
            }
            else {
                this.globalTransformation = this.parent.globalTransformation.clone();
                this.globalTransformation.concatenate(this.localTransformation);
            }
            this.notify();
        },

        /**
         * Update the global transformations of this node and its descendants recursively.
         */
        updateAllGlobalTransformation: function () {
            this.updateGlobalTransformation();
            _.each(this.children, function (i) {
                i.updateAllGlobalTransformation();
            });
        },

        /**
         * Render _ONLY_ this node with the assumption that the node is painted at around the origin. 
         * @param context: Context obtained from HTML5 Canvas.
         */
        renderLocal: function(context) {
                 

        },

        /**
         * Recursively render itself and its descendants.
         * 
         *
         * @param context: Context obtained from HTML Canvas.
         */
        renderAll: function(context) {
            
            context.save();
            this.applyTransformationToContext(context, this.localTransformation);
            this.renderLocal(context); 
            _.each(this.children, function (child) {
                child.renderAll(context); 
            });

            context.restore(); 
        },

        /**
         * Rotate this node and its descendants.
         * 
         *  
         * @param theta: Angle to rotate clockwise.
         * @param x, y: Centre of Rotation.
         */
        rotate: function(theta, x, y) {
            
           // console.log(this.localTransformation);
           // var inverse = this.localTransformation.createInverse(); 
            //console.log(inverse);
           // var temp = this.localTransformation.clone();
            //temp.concatenate(inverse);
            //temp.rotate(theta,x,y);
            //this.localTransformation.concatenate(temp); 
            this.localTransformation.rotate(theta,x,y);
            //console.log(this.localTransformation);
            this.notify();
            console.log('rotated');
       },

        /**
         * Translate this node and its descendants.
         * 
         * @param dx: Distance to translate in the x direction from the node's coordinate system.
         * @param dy: Distance to translate in the y direction from the node's coordinate system.
         */
        translate: function(dx, dy) {
            
            this.localTransformation.translate(dx,dy);
            this.updateAllGlobalTransformation();
            this.notify();
        },

        /**
         * Scale this node and its descendants.
         *
         * @param sx: Scaling factor in the x direction from the node's coordinate system.
         * @param sy: Scaling factor in the y direction from the node's coordinate system.
         */
        scale: function(sx, sy) {
            
            this.localTransformation.scale(sx, sy); 
            this.updateAllGlobalTransformation();
            this.notify();
        },



        /** 
          * Check whether a point is within the local bounding box.
          *
          * @param point: Point to be checked. It is a coordinate represented with list [x y].
          *               It is always the coordinate from the perspective of the canvas, i.e., 
          *               in the world view.
          * 
          * @return false if the node is not interactable with a mouse. When it is, return true if the 
          *         point is in the local bounding box, otherwise false.
          */
        performHitDetection: function(point) {
            
            if (this.isInteractableWithMouse) {
                //this.updateGlobalTransformation();
                var inverse = this.globalTransformation.createInverse();
                var temp = [point.x, point.y]; 
                inverse.transform(temp, 0, temp, 0, 1);
                if ((temp[0] > this.localBoundingBox.x) && (temp[0] < this.localBoundingBox.x + this.localBoundingBox.w)) {
                    if (temp[1] > this.localBoundingBox.y && temp[1] < this.localBoundingBox.y + this.localBoundingBox.h) {
                        return true; 
                    }
                }
                return false; 
            }
            return false; 
        }
    });


    /**
     * RootNode is the root of the scene graph, i.e., it represents the canvas.
     */
    var RootNode = function() {
        // Inherit the constructor of GraphNode.
        GraphNode.apply(this, arguments);

        // Override the local bounding box of this node.
        this.localBoundingBox = {
            x: 0,
            y: 0,
            w: 800,
            h: 600
        };
    }

    // Inherit all other methods of GraphNode.
    _.extend(RootNode.prototype, GraphNode.prototype, {
        
    });

    /**
     * SpaceshipNode, representing the whole spaceship.
     */
    var SpaceshipNode = function() {
        // Inherit the constructor of GraphNode.
        GraphNode.apply(this, arguments);

        

        // Override the local bounding box of this node. You might want to modify this.
        this.localBoundingBox = {
            x: -100,
            y: -165,
            w: 200,
            h: 225
        };
    }

    // Inherit all other methods of GraphNode.
    _.extend(SpaceshipNode.prototype, GraphNode.prototype, {
        // Override the renderLocal function to draw itself in its own coordinate system.
        renderLocal: function(context) {

            

            // You might want to modify this.
                if (this.localTransformation.m12_ < -10) {
                    this.localTransformation.m12_ = 700;
                } else if (this.localTransformation.m12_ > 700) {
                    this.localTransformation.m12_ = -10;
                }

                if (this.localTransformation.m02_ < -30) {
                    this.localTransformation.m02_ = 820; 
                } else if (this.localTransformation.m02_ > 820) {
                    this.localTransformation.m02_ = -30; 
                }
          //this.applyTransformationToContext(context,this.localTransformation);
        }
    });



    /**
     * HeadNode is the child of the spaceship node, representing the head of the spaceship.
     */
    var HeadNode = function() {
        // Inherit the constructor of GraphNode.
        GraphNode.apply(this, arguments);
        this.points = [
            new P(0,-50),
            new P(-30,0),
            new P(30,0)
        ];
        

        // Override the local bounding box of this node, you might want to modify this.
        this.localBoundingBox = {
            x: -45,
            y: -165,
            w: 90,
            h: 65
        };
    }

    // Inherit all other methods of GraphNode.
    _.extend(HeadNode.prototype, GraphNode.prototype, {
        // Override the renderLocal function to draw itself in its own coordinate system.
        renderLocal: function(context) {
           this.applyTransformationToContext(context,this.localTransformation);

        
            
            context.strokeStyle = "rgb(227, 226, 226)";
            context.fillStyle = "rgb(227, 226, 226)";
            context.beginPath();
            context.moveTo(-30,-100);
            context.bezierCurveTo(-60,-90,-20,-110,0,-160);
            context.lineTo(0,-100);
            context.closePath();
            context.lineWidth = 2; 
            context.stroke();
            context.moveTo(30,-100);
            context.bezierCurveTo(60,-90,20,-110,0,-160);
            context.lineTo(0,-100);
            context.closePath();
            context.stroke();
            context.fill();
           



        }
    });




    /**
     * TailNode is a child of the spaceship node, representing the tail of the spaceship.
     */
    var TailNode = function() {
        GraphNode.apply(this, arguments);
        this.localBoundingBox = {
            x: -100,
            y: 0,
            w: 200,
            h: 60
        };
    }
    _.extend(TailNode.prototype, GraphNode.prototype, {
        renderLocal: function(context) {
            
            this.applyTransformationToContext(context, this.localTransformation);
       

            context.strokeStyle = "rgb(227, 226, 226)";
            context.fillStyle = "rgb(227, 226, 226)";
            context.beginPath();
            context.moveTo(0, 0);
            context.bezierCurveTo(0,0,30,5,40,40);      
            context.bezierCurveTo(40,40,50,80,80,15);
            context.lineTo(70,10);
            context.lineTo(90,-5);
            context.lineTo(98,22);
            context.lineTo(88, 18);
            context.bezierCurveTo(80,25,60,85,35,50);
            context.bezierCurveTo(35,50,25,20,0,10);                
            context.closePath();
            context.stroke();
            context.fill();

            context.beginPath();
            context.moveTo(0, 0);
            context.bezierCurveTo(0,0,-30,5,-40,40);      
            context.bezierCurveTo(-40,40,-50,80,-80,15);
            context.lineTo(-70,10);
            context.lineTo(-90,-5);
            context.lineTo(-98,22);
            context.lineTo(-88, 18);
            context.bezierCurveTo(-80,25,-60,85,-35,50);
            context.bezierCurveTo(-35,50,-25,20,0,10);                
            context.closePath();
            context.stroke();
            context.fill();
 
        }
    });



    /**
     * FireNode is a child of the tail node, representing the fire at the end of the spaceship.
     */
    var FireNode = function() {
        var isFire = false;
        GraphNode.apply(this, arguments);
         this.localBoundingBox = {
            x: -30,
            y: 10,
            w: 60,
            h: 10
        };
    }
    _.extend(FireNode.prototype, GraphNode.prototype, {
        renderLocal: function(context) {
            
            this.applyTransformationToContext(context, this.localTransformation);
            if (this.isFire) {
                context.fillStyle = "#333";
                context.strokeStyle = "#5b5a5e";
                context.beginPath();
                context.moveTo(10, 50);
                context.lineTo(5, 20);
                context.lineTo(25, 45);
                context.bezierCurveTo(25, 45, 20, 65, 10, 50);                
                context.closePath();
                context.fill();
                context.stroke();

                context.beginPath();
                context.moveTo(0, 65);
                context.lineTo(-5, 20);
                context.lineTo(-30, 60);
                context.bezierCurveTo(-30, 60, -20, 90, 0, 65);                
                context.closePath();
                context.fill();
                context.stroke();

                context.beginPath();
                context.moveTo(8, 100);
                context.lineTo(10, 60);
                context.lineTo(40, 85);
                context.bezierCurveTo(40, 85, 55, 100, 30, 110);                
                context.bezierCurveTo(30, 110, 15, 115, 8, 100);                
                context.closePath();
                context.fill();
                context.stroke();
            }

       } 
    });



    /**
     * BodyNode is a child of the spaceship node, representing the body of the spaceship.
     */ 
    var BodyNode = function() {
        GraphNode.apply(this, arguments);
        this.isInteractableWithMouse = true;

        this.localBoundingBox = {
            x: -45,
            y: -100,
            w: 90,
            h: 110
        };
    }
    _.extend(BodyNode.prototype, GraphNode.prototype, {
        renderLocal: function(context) {
            
            this.applyTransformationToContext(context,this.localTransformation);   

            context.strokeStyle = "rgb(227, 226, 226)";
            context.fillStyle = "rgb(227, 226, 226)";
            context.beginPath();
            context.moveTo(0, 0);
            context.bezierCurveTo(0,0,35,-1,45,10);        
            context.bezierCurveTo(45,10,45,-5,20,-90);        
            context.lineTo(0,-90);
            context.closePath();
            context.stroke();
            context.fill();

            context.beginPath();
            context.moveTo(0, 0);
            context.bezierCurveTo(0,0,-35,-1,-45,10);        
            context.bezierCurveTo(-45,10,-45,-5,-20,-90);        
            context.lineTo(0,-90);
            context.closePath();
            context.stroke();
            context.fill();
        }
    });



    /**
     * HandleNode is a child of the body node, representing the resizing handle of the spaceship.
     */ 
    var HandleNode = function() {
        GraphNode.apply(this, arguments);
        this.localBoundingBox = {
            x: -30,
            y: 0,
            w: 60,
            h: 10
        };
       this.isInteractableWithMouse = true;
    }
    _.extend(HandleNode.prototype, GraphNode.prototype, {
        renderLocal: function(context) {
            
            context.fillStyle = "#b5b4b4";
            context.fillRect(-20, 0, 40, 10);
            this.applyTransformationToContext(context, this.localTransformation);            
        }
    });


    // Return an object containing all of our classes and constants
    return {
        RootNode: RootNode,
        SpaceshipNode: SpaceshipNode,
        HeadNode: HeadNode,
        TailNode: TailNode,
        FireNode: FireNode,
        BodyNode: BodyNode,
        HandleNode: HandleNode,
    };
}