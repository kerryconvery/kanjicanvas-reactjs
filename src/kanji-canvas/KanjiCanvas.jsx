import React, { forwardRef, useImperativeHandle, useRef, useLayoutEffect } from 'react';
import PropTypes from 'prop-types'
import refPatterns from "./ref-patterns";

const strokeColors = ['#bf0000', '#bf5600', '#bfac00', '#7cbf00', '#26bf00', '#00bf2f', '#00bf85', '#00a2bf', '#004cbf', '#0900bf', '#5f00bf', '#b500bf', '#bf0072', '#bf001c', '#bf2626', '#bf6b26', '#bfaf26', '#89bf26', '#44bf26', '#26bf4c', '#26bf91', '#26a8bf', '#2663bf', '#2d26bf', '#7226bf', '#b726bf', '#bf2682', '#bf263d', '#bf4c4c', '#bf804c'];
const defaultAxesColor = '#BCBDC3';

export const KanjiCanvas = forwardRef(({ axesColor, onRecognized, onErase, onUndo }, ref) => {
    const canvasRef = useRef(null);
    const canvasElement = useRef(null);
    const canvasContext = useRef(null);
    const flagOver = useRef(false);
    const flagDown = useRef(false);
    const prevX = useRef(0);
    const currX = useRef(0);
    const prevY = useRef(0);
    const currY = useRef(0);
    const dotFlag = useRef(false);
    const recordedPattern = useRef([]);
    const currentLine = useRef(null);
    
    useLayoutEffect(() => {
      canvasElement.current = canvasRef.current;
      canvasContext.current = canvasElement.current.getContext('2d');

      window.addEventListener('resize', onResize, false)
      resizeCanvasToDisplaySize(canvasElement.current)
      init();
    }, []);

    const onResize = () => {
      resizeCanvasToDisplaySize(canvasElement.current);
    }

    function resizeCanvasToDisplaySize(canvas) {
      const { width, height } = canvas.getBoundingClientRect()
  
      if (canvas.width !== width || canvas.height !== height) {
        erase()
        canvas.width = width
        canvas.height = height
        drawAxes();
      }
    }

    const init = () => {
        canvasElement.current.tabIndex = 0;
        drawAxes();
    }

    const draw = (color) => {
        canvasContext.current.beginPath();
        canvasContext.current.moveTo(prevX.current, prevY.current);
        canvasContext.current.lineTo(currX.current, currY.current);
        canvasContext.current.strokeStyle = color ?? '#333';
        canvasContext.current.lineCap = 'round';
        canvasContext.current.lineWidth = 4;
        canvasContext.current.stroke();
        canvasContext.current.closePath();
    };

    const clearCanvas = () => {
      canvasContext.current.clearRect(0, 0, canvasElement.current.width, canvasElement.current.height);
      drawAxes();
    }
  
    const findxy = (res) => (e) => {
        const touch = e.changedTouches ? e.changedTouches[0] : null;
        
        if (touch) e.preventDefault(); // prevent scrolling while drawing to the canvas
        
        if (res == 'down') {
          const rect = canvasElement.current.getBoundingClientRect();
          prevX.current = currX.current;
          prevY.current = currY.current;
          currX.current = (touch ? touch.clientX : e.clientX) - rect.left;
          currY.current = (touch ? touch.clientY : e.clientY) - rect.top;
          currentLine.current = [[currX.current, currY.current]];
          
          flagDown.current = true;
          flagOver.current = true;
          dotFlag.current = true;
          if (dotFlag.current) {
            canvasContext.current.beginPath();
            canvasContext.current.fillRect(currX.current, currY.current, 2, 2);
            canvasContext.current.closePath();
            dotFlag.current = false;
          }
        }
        if (res == 'up') {
          flagDown.current = false;
          if (flagOver.current) {
            recordedPattern.current.push(currentLine.current);
          }
        }
        
        if (res == "out") {
          flagOver.current = false;
          if (flagDown.current) {
            recordedPattern.current.push(currentLine.current);
          }
          flagDown.current = false;
        }
        
        if (res == 'move') {
          if (flagOver.current && flagDown.current) {
            const rect = canvasElement.current.getBoundingClientRect();
            prevX.current = currX.current;
            prevY.current = currY.current;
            currX.current = (touch ? touch.clientX : e.clientX) - rect.left;
            currY.current = (touch ? touch.clientY : e.clientY) - rect.top;
            currentLine.current.push([prevX.current, prevY.current]);
            currentLine.current.push([currX.current, currY.current]);
            draw();
          }
        }
    };
  
    // redraw to current canvas according to 
    // what is currently stored in KanjiCanvas["recordedPattern.current_" + id]
    // add numbers to each stroke
    const redraw = () => {
        clearCanvas();

        for (let i = 0; i < recordedPattern.current.length; i++) {
          const stroke_i = recordedPattern.current[i];
      
          for (let j = 0; j < stroke_i.length - 1; j++) {
            prevX.current = stroke_i[j][0];
            prevY.current = stroke_i[j][1];
      
            currX.current = stroke_i[j + 1][0];
            currY.current = stroke_i[j + 1][1];
      
            draw();
          }
        }
    };

    const scaleImage = () => {
      clearCanvas();

      for (let i = 0; i < recordedPattern.current.length; i++) {
        const stroke_i = recordedPattern.current[i];
    
        for (let j = 0; j < stroke_i.length - 1; j++) {
          prevX.current = stroke_i[j][0];
          prevY.current = stroke_i[j][1];
    
          currX.current = stroke_i[j + 1][0];
          currY.current = stroke_i[j + 1][1];
    
          draw();
        }
      }
    };
    
    const drawStrokeNumbers = () => {
      redraw();

      // draw stroke numbers
      if (canvasElement.current.dataset.strokeNumbers != 'false') {
        for (let i = 0; i < recordedPattern.current.length; i++) {
            const stroke_i = recordedPattern.current[i];
            const x = stroke_i[Math.floor(stroke_i.length / 2)][0] + 5;
            const y = stroke_i[Math.floor(stroke_i.length / 2)][1] - 5;
        
            canvasContext.current.font = "20px Arial";
        
            // outline
            canvasContext.current.lineWidth = 3;
            canvasContext.current.strokeStyle = alterHex(strokeColors[i] ? strokeColors[i] : "#333333", 60, 'dec');
            canvasContext.current.strokeText((i + 1).toString(), x, y);
        
            // fill
            canvasContext.current.fillStyle = strokeColors[i] ? strokeColors[i] : "#333";
            canvasContext.current.fillText((i + 1).toString(), x, y);
          }
      }
    }
    
    // modifies hex colors to darken or lighten them
    // ex: alterHex(strokeColors[0], 60, 'dec'); // decrement all colors by 60 (use 'inc' to increment)
    const alterHex = (hex, number, action) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      const color = [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      
      for (let i = 0; i < color.length; i++) {
        switch (action) {
          case 'inc' :
            color[i] = ((color[i] + number) > 255 ? 255 : color[i] + number).toString(16);
            break;
            
          case 'dec' :
            color[i] = ((color[i] - number) < 0 ? 0 : color[i] - number).toString(16);
            break;
            
          default :
            break;
        }
        
        // add trailing 0
        if (color[i].length == 1) color[i] = color[i] + '0';
      }
      
      return '#' + color.join('');
    };
    
     // helper functions for moment normalization 
     const m10 = (pattern) => {
          let sum = 0;
          for(let i=0;i<pattern.length;i++) {
              const stroke_i = pattern[i];
              for(let j=0;j<stroke_i.length;j++) {
                  sum += stroke_i[j][0];
              }			
          }
          return sum;
      };
      
      const m01 = (pattern) => {
          let sum = 0;
          for(let i=0;i<pattern.length;i++) {
              const stroke_i = pattern[i];
              for(let j=0;j<stroke_i.length;j++) {
                  sum += stroke_i[j][1];
              }			
          }
          return sum;
      };
          
      const m00 = (pattern) => {
          let sum = 0;
          for(let i=0;i<pattern.length;i++) {
             const stroke_i = pattern[i];
             sum += stroke_i.length;
          }
          return sum;
      };
      
      const mu20 = (pattern, xCenter) => {
        let sum = 0;
        for (const stroke of pattern) {
          for (const [x, y] of stroke) {
            const diff = x - xCenter;
            sum += diff * diff;
          }
        }
        return sum;
      };

      
       const mu02 = (pattern, yc) => {
          let sum = 0;
          for(let i=0;i<pattern.length;i++) {
              const stroke_i = pattern[i];
              for(let j=0;j<stroke_i.length;j++) {
                  const diff = stroke_i[j][1] - yc;
                  sum += (diff * diff);
              }			
          }
          return sum;
      };
     
     const aran = (width, height) => {
          let r1 = 0.;
          if(height > width) {
              r1 = width / height;
          } else {
              r1 = height / width;
          }
          
          const a = Math.PI / 2.;
          const b = a * r1;
          const b1 = Math.sin(b);
          const c = Math.sqrt(b1);
          const d = c;
          
          const r2 = Math.sqrt(Math.sin((Math.PI/2.) * r1));
          return r2;
      };
      
       const chopOverbounds = (pattern) => {
          const chopped = new Array();
          for(let i=0;i<pattern.length;i++) {
            const stroke_i = pattern[i];
            const c_stroke_i = new Array();
              for(let j=0;j<stroke_i.length;j++) {
                  let x = stroke_i[j][0];
                  let y = stroke_i[j][1];			
                  if(x < 0) { x = 0; }
                  if(x>=256) { x = 255; }
                  if(y < 0) { y = 0; }
                  if(y>=256) { y = 255; }
                  c_stroke_i.push([x,y]);
              }
              chopped.push(c_stroke_i);
          }
          return chopped;		
      };
      
      const transform = (pattern, x_, y_) => {
        const pt = new Array();
          for(let i=0;i<pattern.length;i++) {
              const stroke_i = pattern[i];
              const c_stroke_i = new Array();
              for(let j=0;j<stroke_i.length;j++) {
                const x = stroke_i[j][0]+x_;
                const y = stroke_i[j][1]+y_;
                c_stroke_i.push([x,y]);
              }
              pt.push(c_stroke_i);
          }
          return pt;			
      };
  
      // main function for moment normalization
      const momentNormalize = () => {
        const newHeight = 256;
        const newWidth = 256;
        let xMin = newWidth;
        let xMax = 0;
        let yMin = newHeight;
        let yMax = 0;
        
        for (const stroke of recordedPattern.current) {
          for (const [x, y] of stroke) {
            if (x < xMin) {
              xMin = x;
            }
            if (x > xMax) {
              xMax = x;
            }
            if (y < yMin) {
              yMin = y;
            }
            if (y > yMax) {
              yMax = y;
            }
          }
        }

        const oldHeight = Math.abs(yMax - yMin);
        const oldWidth = Math.abs(xMax - xMin);
        
        const r2 = aran(oldWidth, oldHeight);
        
        let aranWidth = newWidth;
        let aranHeight = newHeight;
        
        if (oldHeight > oldWidth) {
          aranWidth = r2 * newWidth;
        } else {
          aranHeight = r2 * newHeight;
        }
        
        const xOffset = (newWidth - aranWidth) / 2;
        const yOffset = (newHeight - aranHeight) / 2;
        
        const m00_ = m00(recordedPattern.current);
        const m01_ = m01(recordedPattern.current);
        const m10_ = m10(recordedPattern.current);

        const xc = m10_ / m00_;
        const yc = m01_ / m00_;
        
        const xc_half = aranWidth / 2;
        const yc_half = aranHeight / 2;
        
        const mu20_ = mu20(recordedPattern.current, xc);
        const mu02_ = mu02(recordedPattern.current, yc);
        
        const alpha = aranWidth / (4 * Math.sqrt(mu20_ / m00_)) || 0;
        const beta = aranHeight / (4 * Math.sqrt(mu02_ / m00_)) || 0;
        const nf = [];
        for (const stroke of recordedPattern.current) {
          const nsi = stroke.map(([x, y]) => {
            const newX = alpha * (x - xc) + xc_half;
            const newY = beta * (y - yc) + yc_half;
            return [newX, newY];
          });
          nf.push(nsi);
        }
        
        return transform(nf, xOffset, yOffset);
      };
      
    // distance functions
    const euclid = (x1y1, x2y2) => {
        const a = x1y1[0] - x2y2[0];
        const b = x1y1[1] - x2y2[1];
        const c = Math.sqrt( a*a + b*b );
        return c;
    };
  
    // extract points in regular intervals
    const extractFeatures = (kanji, interval) => {
        const extractedPattern = [];
        const nrStrokes = kanji.length;
        for(let i = 0; i < nrStrokes; i++) {
            const stroke_i = kanji[i];
            const extractedStroke_i = [];
            let dist = 0.0;
            let j = 0;
            while(j < stroke_i.length) {
                // always add first point
                if(j==0) {
                    const x1y1 = stroke_i[0];
                    extractedStroke_i.push(x1y1);
                }
                if(j > 0) {
                    const x1y1 = stroke_i[j-1];
                    const x2y2 = stroke_i[j];
                    dist += euclid(x1y1, x2y2);
                }
                if((dist >= interval) && (j>1)) {
                    dist = dist - interval;
                    const x1y1 = stroke_i[j];
                    extractedStroke_i.push(x1y1);
                }
                j++;
            }
            // if we so far have only one point, always add last point
            if(extractedStroke_i.length == 1) {
                const x1y1 = stroke_i[stroke_i.length-1];
                extractedStroke_i.push(x1y1);
            } else {
                if(dist > (0.75 * interval)) {
                    const x1y1 = stroke_i[stroke_i.length-1];
                    extractedStroke_i.push(x1y1);
                }                
            }
            extractedPattern.push(extractedStroke_i);
        }
        return extractedPattern;
     };

     const endPointDistance = (pattern1, pattern2) => {
        let dist = 0;
        const l1 = typeof pattern1 === 'undefined' ? 0 : pattern1.length;
        const l2 = typeof pattern2 === 'undefined' ? 0 : pattern2.length;
        if(l1 === 0 || l2 === 0) {
            return 0;
        } else {
            let x1y1 = pattern1[0];
            let x2y2 = pattern2[0];
            dist += (Math.abs(x1y1[0] - x2y2[0]) + Math.abs(x1y1[1] - x2y2[1]));
            x1y1 = pattern1[l1-1];
            x2y2 = pattern2[l2-1];
            dist += (Math.abs(x1y1[0] - x2y2[0]) + Math.abs(x1y1[1] - x2y2[1]));
        }
        return dist;
     };
     
    const initialDistance = (pattern1, pattern2) => {
        const l1 = pattern1.length;
        const l2 = pattern2.length;
        const lmin = Math.min(l1, l2);
        const lmax = Math.max(l1, l2);
        let dist = 0;
        for(let i = 0; i < lmin; i++) {
            const x1y1 = pattern1[i];
            const x2y2 = pattern2[i];
            dist += (Math.abs(x1y1[0] - x2y2[0]) + Math.abs(x1y1[1] - x2y2[1]));
        }
        return dist * (lmax / lmin);
     };
     
     // given to pattern, determine longer (more strokes)
     // and return quadruple with sorted patterns and their
     // stroke numbers [k1,k2,n,m] where n >= m and 
     // they denote the #of strokes of k1 and k2
     const getLargerAndSize = (pattern1, pattern2) => {
        const l1 = typeof pattern1 === 'undefined' ? 0 : pattern1.length;
        const l2 = typeof pattern2 === 'undefined' ? 0 : pattern2.length;
        // definitions as in paper 
        // i.e. n is larger 
        let n = l1;
        let m = l2;
        let k1 = pattern1;
        let k2 = pattern2;
        if(l1 < l2) {
            m = l1;
            n = l2;
            k1 = pattern2;
            k2 = pattern1;
        } 
        return [k1, k2, n, m];
     };
     
     const wholeWholeDistance = (pattern1, pattern2) => {
         const a = getLargerAndSize(pattern1, pattern2);
         let dist = 0;
         for(let i = 0; i < a[3]; i++) {
             const j_of_i = parseInt(parseInt(a[2] / a[3]) * i);
             const x1y1 = a[0][j_of_i];
             const x2y2 = a[1][i];
             dist += (Math.abs(x1y1[0] - x2y2[0]) + Math.abs(x1y1[1] - x2y2[1]));
         }
         return parseInt(dist / a[3]);
     };
     
     // initialize N-stroke map by greedy initialization
     const initStrokeMap = (pattern1, pattern2, distanceMetric) => {
         // [k1, k2, n, m]
         // a[0], a[1], a[2], a[3]
         const a = getLargerAndSize(pattern1, pattern2);
         // larger is now k1 with length n
         const map = new Array();
         for(let i=0;i<a[2];i++) {
            map[i] = -1;
         }
         const free = new Array();
         for(let i=0;i<a[2];i++) {
            free[i] = true;
         }
         for(let i=0;i<a[3];i++) {
             let minDist = 10000000;
             let min_j = -1;
             for(let j=0;j<a[2];j++) {
                 if(free[j] == true) {
                     const d = distanceMetric(a[0][j],a[1][i]);
                       if(d < minDist) {
                        minDist = d;
                        min_j = j;
                     }
                 }
             }
             free[min_j] = false;
             map[min_j] = i;
         }	   
         return map;   
      };
  
      // get best N-stroke map by iterative improvement
      const getMap = (pattern1, pattern2, distanceMetric) => {
        const a = getLargerAndSize(pattern1, pattern2);
        // larger is now k1 with length n
        const L = 3;
        const map = initStrokeMap(a[0], a[1], distanceMetric);
        for(let l = 0; l < L; l++) {
            for(let i = 0; i < map.length; i++) {
                if(map[i] !== -1) {
                    let dii = distanceMetric(a[0][i], a[1][map[i]]);
                    for(let j = 0; j < map.length; j++) {
                        // we need to check again, since 
                        // manipulation of map[i] can occur within
                        // the j-loop
                        if(map[i] !== -1) {
                            if(map[j] !== -1) {
                                const djj = distanceMetric(a[0][j], a[1][map[j]]);
                                const dij = distanceMetric(a[0][j], a[1][map[i]]);
                                const dji = distanceMetric(a[0][i], a[1][map[j]]);
                                if(dji + dij < dii + djj) {
                                    const mapj = map[j];
                                    map[j] = map[i];
                                    map[i] = mapj;
                                    dii = dij;
                                }
                            } else {
                                const dij = distanceMetric(a[0][j], a[1][map[i]]);
                                if(dij < dii) {
                                    map[j] = map[i];
                                    map[i] = -1;
                                    dii = dij;
                                }
                            }
                        }
                    }         
                }
            }
        }
        return map;  
      };
      
      // from optimal N-stroke map create M-N stroke map
      const completeMap = (pattern1, pattern2, distanceMetric, map) => {
        const a = getLargerAndSize(pattern1, pattern2);
        if(!map.includes(-1)) {
            return map;
        }
        // complete at the end
        let lastUnassigned = map[map.length];
        let mapLastTo = -1;
        for(let i = map.length - 1; i >= 0; i--) {
            if(map[i] == -1) {
                lastUnassigned = i;
            } else {
                mapLastTo = map[i];
                break;
            }
        }
        for(let i = lastUnassigned; i < map.length; i++) {
            map[i] = mapLastTo;
        }
        // complete at the beginning
        let firstUnassigned = -1;
        let mapFirstTo = -1;
        for(let i = 0; i < map.length; i++) {
            if(map[i] == -1) {
                firstUnassigned = i;
            } else {
                mapFirstTo = map[i];
                break;
            }
        }     
        for(let i = 0; i <= firstUnassigned; i++) {
            map[i] = mapFirstTo;
        }
        // for the remaining unassigned, check
        // where to "split"
        for(let i = 0; i < map.length; i++) {
            if(i + 1 < map.length && map[i + 1] == -1) {
                // we have a situation like this:
                //   i       i+1   i+2   ...  i+n 
                //   start   -1    ?     -1   stop
                let start = i;
        
                let stop = i + 1;
                while(stop < map.length && map[stop] == -1) {
                    stop++;
                }
        
                let div = start;
                let max_dist = 1000000;
                for(let j = start; j < stop; j++) {
                    let stroke_ab = a[0][start];
                    // iteration of concat, possibly slow
                    // due to memory allocations; optimize?!
                    for(let temp = start + 1; temp <= j; temp++) {
                        stroke_ab = stroke_ab.concat(a[0][temp]);
                    }
                    let stroke_bc = a[0][j + 1];
        
                    for(let temp = j + 2; temp <= stop; temp++) {
                        stroke_bc = stroke_bc.concat(a[0][temp]);
                    }
        
                    let d_ab = distanceMetric(stroke_ab, a[1][map[start]]);
                    let d_bc = distanceMetric(stroke_bc, a[1][map[stop]]);          
                    if(d_ab + d_bc < max_dist) {
                        div = j;
                        max_dist = d_ab + d_bc;
                    }
                }
                for(let j = start; j <= div; j++) {
                    map[j] = map[start];
                }
                for(let j = div + 1; j < stop; j++) {
                    map[j] = map[stop];
                }
            } 
        }
        return map;
      };
      
      // given two patterns, M-N stroke map and distanceMetric function,
      // compute overall distance between two patterns
      const computeDistance = (pattern1, pattern2, distanceMetric, map) => {
        const a = getLargerAndSize(pattern1, pattern2);
        let dist = 0.0;
        let idx = 0;
        while(idx < a[2]) {
            const stroke_idx = a[1][map[idx]];
            const start = idx;
            let stop = start + 1;
            while(stop < map.length && map[stop] == map[idx]) {
                stop++;
            }
            let stroke_concat = a[0][start];
            for(let temp = start + 1; temp < stop; temp++) {
                stroke_concat = stroke_concat.concat(a[0][temp]);
            }
            dist += distanceMetric(stroke_idx, stroke_concat);
            idx = stop;
        }
        return dist;
      };
      
      // given two patterns, M-N strokemap, compute weighted (respect stroke
      // length when there are concatenated strokes using the wholeWhole distance
      const computeWholeDistanceWeighted = (pattern1, pattern2, map) => {
        const a = getLargerAndSize(pattern1, pattern2);
        let dist = 0.0;
        let idx = 0;
        while(idx < a[2]) {
            const stroke_idx = a[1][map[idx]];
            const start = idx;
            let stop = start + 1;
            while(stop < map.length && map[stop] == map[idx]) {
                stop++;
            }
            let stroke_concat = a[0][start];
            for(let temp = start + 1; temp < stop; temp++) {
                stroke_concat = stroke_concat.concat(a[0][temp]);
            }
            
            let dist_idx = wholeWholeDistance(stroke_idx, stroke_concat);

            if(stop > start + 1) {
                // concatenated stroke, adjust weight
                let mm = typeof stroke_idx === 'undefined' ? 0 : stroke_idx.length;
                let nn = stroke_concat.length;
                if(nn < mm) {
                    const temp = nn;
                    nn = mm;
                    mm = temp;
                }
                dist_idx = dist_idx * (nn / mm);
            }
            dist += dist_idx;
            idx = stop;
        }
        return dist;
      };
      
      // apply coarse classficiation w.r.t. inputPattern
      // considering _all_ referencePatterns using endpoint distance
      const coarseClassification = (inputPattern) => {
        const inputLength = inputPattern.length;
        let candidates = [];
        for(let i=0;i<refPatterns.length;i++) {
            const iLength = refPatterns[i][1];
            if(inputLength < iLength + 2 && inputLength > iLength-3) {
                const iPattern = refPatterns[i][2];
                let iMap = getMap(iPattern, inputPattern, endPointDistance);
                iMap = completeMap(iPattern, inputPattern, endPointDistance, iMap);
                const dist = computeDistance(iPattern, inputPattern, endPointDistance, iMap);
                let m = iLength;
                let n = iPattern.length;
                if(n < m) {
                    const temp = n;
                    n = m;
                    m = temp;
                }
                candidates.push([i, (dist * (m/n))]);
            }
        }
        candidates.sort((a, b) => a[1] - b[1]);
        
        return candidates;
      };
      
      // fine classfication. returns best 100 matches for inputPattern
      // and candidate list (which should be provided by coarse classification
      const refineClassification = (inputPattern, inputCandidates) => {
        const inputLength = inputPattern.length;
        let candidates = [];
        for(let i=0;i<Math.min(inputCandidates.length, 100);i++) {
            const j = inputCandidates[i][0];
            const iLength = refPatterns[j][1];
            const iPattern = refPatterns[j][2];
            if(inputLength < iLength + 2 && inputLength > iLength-3) {
                let iMap = getMap(iPattern, inputPattern,initialDistance);
                iMap = completeMap(iPattern, inputPattern, wholeWholeDistance, iMap);
                let dist = computeWholeDistanceWeighted(iPattern, inputPattern, iMap);
                let n = inputLength;
                let m = iPattern.length;
                if(m > n) {
                    m = n;
                }
                dist = dist / m;
                candidates.push([j, dist]);
            }
        }
        candidates.sort((a, b) => a[1] - b[1]);

        const candidateStrings = []
        for(let i=0;i<Math.min(candidates.length, 10);i++) {
            candidateStrings.push(refPatterns[candidates[i][0]][0]);
        }
        return candidateStrings;
      };

      const recognize = () => {
        const mn = momentNormalize();
        const extractedFeatures = extractFeatures(mn, 20.);
        let map = getMap(extractedFeatures, refPatterns[0][2], endPointDistance);
        map = completeMap(extractedFeatures, refPatterns[0][2], endPointDistance, map);
        const candidates = coarseClassification(extractedFeatures);
        
        drawStrokeNumbers();

        const refinedClassfications =  refineClassification(extractedFeatures, candidates);

        if (onRecognized) {
            onRecognized(refinedClassfications)
        }
    }

    
    const deleteLast = () => {
        clearCanvas();

        for (let i = 0; i < recordedPattern.current.length - 1; i++) {
        const stroke_i = recordedPattern.current[i];
    
        for (let j = 0; j < stroke_i.length - 1; j++) {
            prevX.current = stroke_i[j][0];
            prevY.current = stroke_i[j][1];
    
            currX.current = stroke_i[j + 1][0];
            currY.current = stroke_i[j + 1][1];
    
            draw();
        }
        }
    
        recordedPattern.current.pop();

        if (onUndo) {
          onUndo();
        }
    };


    const erase = () => {
      clearCanvas();  
      recordedPattern.current = [];

      if (onErase) {
        onErase();
      }
    };
    
    const drawAxis = (startPosition, endPosition) => {
        canvasContext.current.beginPath();
        canvasContext.current.moveTo(startPosition.x, startPosition.y);
        canvasContext.current.lineTo(endPosition.x, endPosition.y);
        canvasContext.current.strokeStyle = axesColor ?? defaultAxesColor;
        canvasContext.current.lineCap = 'round';
        canvasContext.current.lineWidth = 1;
        canvasContext.current.setLineDash([2,3]);
        canvasContext.current.stroke();
        canvasContext.current.closePath();     
    }

    const drawHorizontalAxis = () => {
      const startPosition = {
        x: 0,
        y: canvasElement.current.height / 2
      }

      const endPosition = {
        x: canvasElement.current.width,
        y: canvasElement.current.height / 2
      }
      drawAxis(startPosition, endPosition)
    }

    const drawVerticalAxis = () => {
      const startPosition = {
        x: canvasElement.current.width / 2,
        y: 0
      }

      const endPosition = {
        x: canvasElement.current.width / 2,
        y: canvasElement.current.height
      }
      drawAxis(startPosition, endPosition)
    }

    const drawAxes = () => {
      drawHorizontalAxis()
      drawVerticalAxis()
    }

    useImperativeHandle(ref, () => ({
        recognize,
        erase,
        undo: deleteLast
    }))

    return (
        <canvas
            ref={canvasRef}
            style={{ height: '100%', width: '100%'}}
            onMouseMove={ findxy('move') }    
            onMouseDown={ findxy('down') }
            onMouseUp={ findxy('up') }
            onMouseOut={ findxy('out') }
            onMouseOver={ findxy('over') }
            onTouchMove={ findxy('move') }
            onTouchStart={ findxy('down') }
            onTouchEnd={ findxy('up') }
        />
    )
})

KanjiCanvas.propTypes = {
    axesColor: PropTypes.string,
    onRecognized: PropTypes.func,
    onErase: PropTypes.func,
    onUndo: PropTypes.func,
}

export const useKanjiCanvas = () => {
    const canvasRef = useRef(null);

    return {
        recognize: () => canvasRef.current.recognize(),
        erase: () => canvasRef.current.erase(),
        undo: () => canvasRef.current.undo(),
        canvasRef,
    }
}