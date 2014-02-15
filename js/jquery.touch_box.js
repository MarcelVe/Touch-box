/**
    Touch box - Enabled resize, drag & rotate of DOM elements on the web touch devices & modern browsers.
    Copyright (C) 2013 Dannie Hansen
 
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
**/
;(function ($) {
    "use strict";
    
    var undef, zindex = 400, propNameTransform = 'Transform', propNameTransformOrigin = 'TransformOrigin', transformProps = [
		'O',
		'ms',
		'Webkit',
		'Moz'
	], i = transformProps.length, div = document.createElement('div'), divStyle = div.style;
    
    while(i--) {
        if((transformProps[i]+propNameTransform) in divStyle) {
            propNameTransform = transformProps[i]+propNameTransform;
            propNameTransformOrigin = transformProps[i]+propNameTransformOrigin;
        }
    }
    
    function getRotationAngle(touch1X, touch1Y, touch2X, touch2Y) {
        var x = touch1X - touch2X,
            y = touch1Y - touch2Y,
            radiant = Math.atan2(y, x);
		
        return (radiant * 180 / Math.PI);	
    }
    
    $.fn.TouchBox = function (options) {
        var defaults = {
            drag: false,
            resize: false,
            rotate: false,
            callback_touches: null,
            callback_size_change: null,
            callback_position_change: null,
            callback_degree_change: null
        }
        
        if(options != undef) $.extend(defaults, options);
        
        this.each(function () {
            var $this = $(this),
                touches = 0,
                diffX = 0,
                diffY = 0,
                startWidth = 0,
                startHeight = 0,
                startDistance = 0,
                ignoreTouch = false,
                startX = 0,
                startY = 0,
                rotatePoint1X = 0,
                rotatePoint1Y = 0,
                rotatePoint2X = 0,
                rotatePoint2Y = 0,
                rotation = false,
                startDegree = 0,
                currDegree = 0,
                _startDegree = 0;
            
            if(defaults.rotate) this.style[propNameTransformOrigin] = 'center center';
            
			$this[0]['draggable'] = false;
			
            $this.bind('touchstart mousedown', function (e) {
				zindex += 1;
				
				$this.css({ zIndex: zindex });
				
				touches = (typeof e.pageX != 'undefined' ? 1 : e.originalEvent.touches.length);
				
				if(ignoreTouch) ignoreTouch = false;
				
				var pageX = (typeof e.pageX != 'undefined' ? e.pageX : e.originalEvent.touches[0].pageX),
					pageY = (typeof e.pageY != 'undefined' ? e.pageY : e.originalEvent.touches[0].pageY);
				
				if(!ignoreTouch) {
					var offsetLeft = parseFloat($this.css('left'),10),
						offsetTop = parseFloat($this.css('top'),10),
						x = pageX,
						y = pageY;
					
					startX = offsetLeft;
					startY = offsetTop;
					
					diffX = x - offsetLeft;
					diffY = y - offsetTop;
				}
				
				if(defaults.rotate) {
					if(touches == 1) {
						rotatePoint1X = pageX;
						rotatePoint1Y = pageY;
					} else if(touches == 2) {
						rotatePoint2X = e.originalEvent.touches[1].pageX;
						rotatePoint2Y = e.originalEvent.touches[1].pageY;
						
						startDegree = getRotationAngle(rotatePoint1X, rotatePoint1Y, rotatePoint2X, rotatePoint2Y);
						_startDegree = currDegree;
						
						rotation = true;
					}
				}
				
				if(defaults.resize && touches == 2) {
					startWidth = $this.width();
					startHeight = $this.height();
					var x = e.originalEvent.touches[0].pageX,
						y = e.originalEvent.touches[0].pageY,
						x2 = e.originalEvent.touches[1].pageX,
						y2 = e.originalEvent.touches[1].pageY,
						xd = x2 - x,
						yd = y2 - y,
						distance = Math.sqrt(xd*xd + yd*yd);
					
					startDistance = distance;
				}
            }).bind('touchmove mousemove', function (e) {
				if(defaults.callback_touches != null) defaults.callback_touches.apply(this, [touches]);
				
				if(defaults.resize && touches == 2) {
					var x = e.originalEvent.touches[0].pageX,
						y = e.originalEvent.touches[0].pageY,
						x2 = e.originalEvent.touches[1].pageX,
						y2 = e.originalEvent.touches[1].pageY,
						xd = x2 - x,
						yd = y2 - y,
						distance = Math.sqrt(xd*xd + yd*yd),
						halfDistance = ((distance - startDistance)/2),
						newWidth = (startWidth + (distance - startDistance)),
						newHeight = (startHeight + (distance - startDistance)),
						newLeft = (startX-halfDistance),
						newTop = (startY-halfDistance);
					
					$this.css({
						width: newWidth+'px',
						height: newHeight+'px',
						left: newLeft+'px',
						top: newTop+'px'
					});
					
					if(defaults.callback_size_change != null) defaults.callback_size_change.apply(this, [newWidth, newHeight]);
					if(defaults.callback_position_change != null) defaults.callback_position_change.apply(this, [newLeft, newTop]);
				}
				
				if(defaults.drag && !ignoreTouch && touches == 1) {
					var x = (typeof e.pageX != 'undefined' ? e.pageX : e.originalEvent.touches[0].pageX),
						y = (typeof e.pageY != 'undefined' ? e.pageY : e.originalEvent.touches[0].pageY),
						newLeft = (x - diffX),
						newTop = (y - diffY);
					
					$this.css({
						left: newLeft+'px',
						top: newTop+'px'
					});
					
					if(defaults.callback_position_change != null) defaults.callback_position_change.apply(this, [newLeft, newTop]);
				}
				
				if(defaults.rotate && rotation) {
					var lastDegrees = currDegree,
					degrees = (startDegree - getRotationAngle(e.originalEvent.touches[0].pageX, e.originalEvent.touches[0].pageY, e.originalEvent.touches[1].pageX, e.originalEvent.touches[1].pageY) - _startDegree) * -1;
					currDegree = degrees;
					this.style[propNameTransform] = 'rotate('+Math.floor(degrees)+'deg)';
					
					if(defaults.callback_degree_change != null) defaults.callback_degree_change.apply(this, [lastDegrees, degrees]);
				}
				
				e.preventDefault();
            }).bind('touchend mouseup', function (e) {
				touches -= 1;
				
				if(touches == 1) ignoreTouch = true;
				
				rotation = false;
				
				if(defaults.callback_touches != null) defaults.callback_touches.apply(this, [touches]);
            });
        });
    };
    
    $(document).ready(function () {
        var $boxes = $('.touch-box');
		
        if($boxes.length > 0) {
            $boxes.each(function () {
                var $this = $(this),
                    options = {
                        'drag': false,
                        'resize': false,
                        'rotate': false
                    },
                    resize = $this.attr('data-resize'),
                    drag = $this.attr('data-drag'),
                    rotate = $this.attr('data-rotate');
                
                if(resize != undef && resize == 'true') options['resize'] = true;
                if(drag != undef && drag == 'true') options['drag'] = true;
                if(rotate != undef && rotate == 'true') options['rotate'] = true;
                
                $this.TouchBox(options);
            });
        }
    });
})(jQuery);