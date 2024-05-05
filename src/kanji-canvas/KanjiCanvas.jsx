import React, { useEffect, useState } from 'react';
import refPatterns from "./ref-patterns";

const strokeColors = ['#bf0000', '#bf5600', '#bfac00', '#7cbf00', '#26bf00', '#00bf2f', '#00bf85', '#00a2bf', '#004cbf', '#0900bf', '#5f00bf', '#b500bf', '#bf0072', '#bf001c', '#bf2626', '#bf6b26', '#bfaf26', '#89bf26', '#44bf26', '#26bf4c', '#26bf91', '#26a8bf', '#2663bf', '#2d26bf', '#7226bf', '#b726bf', '#bf2682', '#bf263d', '#bf4c4c', '#bf804c'];

let flagOver = false;
let flagDown = false;
let prevX = 0;
let currX = 0;
let prevY = 0;
let currY = 0;
let dotFlag = false;
let recordedPattern = [];
let currentLine = null;

const KanjiCanvas = () => {
    const [initialized, setInitialized] = useState(false);
    const canvas = React.useRef();
    
    let canvasElement = null;
    let canvasContext = null;

    useEffect(() => {
      canvasElement = canvas.current;
      canvasContext = canvasElement.getContext('2d');

      if (!initialized) {
        init();
        setInitialized(true);
      }
    });

    const init = () => {
        canvasElement.tabIndex = 0;
    }

    const draw = (color) => {
        canvasContext.beginPath();
        canvasContext.moveTo(prevX, prevY);
        canvasContext.lineTo(currX, currY);
        canvasContext.strokeStyle = color ?? '#333';
        canvasContext.lineCap = 'round';
        canvasContext.lineWidth = 4;
        canvasContext.stroke();
        canvasContext.closePath();
    };
  
    const deleteLast = () => {
        canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);

        for (let i = 0; i < recordedPattern.length - 1; i++) {
          const stroke_i = recordedPattern[i];
      
          for (let j = 0; j < stroke_i.length - 1; j++) {
            prevX = stroke_i[j][0];
            prevY = stroke_i[j][1];
      
            currX = stroke_i[j + 1][0];
            currY = stroke_i[j + 1][1];
      
            draw();
          }
        }
      
        recordedPattern.pop();
    };
  
    const erase = () => {
        canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
        recordedPattern = [];
    };
  
    const findxy = (res) => (e) => {
        const touch = e.changedTouches ? e.changedTouches[0] : null;
        
        if (touch) e.preventDefault(); // prevent scrolling while drawing to the canvas
        
        if (res == 'down') {
          const rect = canvasElement.getBoundingClientRect();
          prevX = currX;
          prevY = currY;
          currX = (touch ? touch.clientX : e.clientX) - rect.left;
          currY = (touch ? touch.clientY : e.clientY) - rect.top;
          currentLine = [[currX, currY]];
          
          flagDown = true;
          flagOver = true;
          dotFlag = true;
          if (dotFlag) {
            canvasContext.beginPath();
            canvasContext.fillRect(currX, currY, 2, 2);
            canvasContext.closePath();
            dotFlag = false;
          }
        }
        if (res == 'up') {
          flagDown = false;
          if (flagOver) {
            recordedPattern.push(currentLine);
          }
        }
        
        if (res == "out") {
          flagOver = false;
          if (flagDown) {
            recordedPattern.push(currentLine);
          }
          flagDown = false;
        }
        
        if (res == 'move') {
          if (flagOver && flagDown) {
            const rect = canvasElement.getBoundingClientRect();
            prevX = currX;
            prevY = currY;
            currX = (touch ? touch.clientX : e.clientX) - rect.left;
            currY = (touch ? touch.clientY : e.clientY) - rect.top;
            currentLine.push([prevX, prevY]);
            currentLine.push([currX, currY]);
            draw();
          }
        }
    };
  
    // redraw to current canvas according to 
    // what is currently stored in KanjiCanvas["recordedPattern_" + id]
    // add numbers to each stroke
    const redraw = () => {
        canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);

        for (let i = 0; i < recordedPattern.length; i++) {
          const stroke_i = recordedPattern[i];
      
          for (let j = 0; j < stroke_i.length - 1; j++) {
            prevX = stroke_i[j][0];
            prevY = stroke_i[j][1];
      
            currX = stroke_i[j + 1][0];
            currY = stroke_i[j + 1][1];
      
            draw();
          }
        }
  
      // draw stroke numbers
      if (canvasElement.dataset.strokeNumbers != 'false') {
        for (let i = 0; i < recordedPattern.length; i++) {
            const stroke_i = recordedPattern[i];
            const x = stroke_i[Math.floor(stroke_i.length / 2)][0] + 5;
            const y = stroke_i[Math.floor(stroke_i.length / 2)][1] - 5;
        
            canvasContext.font = "20px Arial";
        
            // outline
            canvasContext.lineWidth = 3;
            canvasContext.strokeStyle = alterHex(strokeColors[i] ? strokeColors[i] : "#333333", 60, 'dec');
            canvasContext.strokeText((i + 1).toString(), x, y);
        
            // fill
            canvasContext.fillStyle = strokeColors[i] ? strokeColors[i] : "#333";
            canvasContext.fillText((i + 1).toString(), x, y);
          }
      }
    };
    
    
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
    
  
    // linear normalization for KanjiCanvas["recordedPattern_" + id]
    const normalizeLinear = () => {
      const normalizedPattern = new Array();
      const newHeight = 256;
      const newWidth = 256;
      let xMin = 256;
      let xMax = 0;
      let yMin = 256;
      let yMax = 0;
      // first determine drawn character width / length
      for (let i = 0; i < recordedPattern.length; i++) {
        const stroke_i = recordedPattern[i];
        for (let j = 0; j < stroke_i.length; j++) {
          const x = stroke_i[j][0];
          const y = stroke_i[j][1];
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
      const oldWidth  = Math.abs(xMax - xMin);
  
      for (let i = 0; i < recordedPattern.length; i++) {
        const stroke_i = recordedPattern[i];
        const normalized_stroke_i = [];
        for (let j = 0; j < stroke_i.length; j++) {
          const x = stroke_i[j][0];
          const y = stroke_i[j][1];
          const xNorm = (x - xMin) * (newWidth / oldWidth);
          const yNorm = (y - yMin) * (newHeight / oldHeight);
          normalized_stroke_i.push([xNorm, yNorm]);
        }
        normalizedPattern.push(normalized_stroke_i);
      }
      recordedPattern = normalizedPattern;
      redraw();
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
        
        for (const stroke of recordedPattern) {
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
        
        const m00_ = m00(recordedPattern);
        const m01_ = m01(recordedPattern);
        const m10_ = m10(recordedPattern);

        const xc = m10_ / m00_;
        const yc = m01_ / m00_;
        
        const xc_half = aranWidth / 2;
        const yc_half = aranHeight / 2;
        
        const mu20_ = mu20(recordedPattern, xc);
        const mu02_ = mu02(recordedPattern, yc);
        
        const alpha = aranWidth / (4 * Math.sqrt(mu20_ / m00_)) || 0;
        const beta = aranHeight / (4 * Math.sqrt(mu02_ / m00_)) || 0;
        const nf = [];
        for (const stroke of recordedPattern) {
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
      const fineClassification = (inputPattern, inputCandidates) => {
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
        let outStr = "";
        for(let i=0;i<Math.min(candidates.length, 10);i++) {
            outStr += refPatterns[candidates[i][0]][0];
            outStr += "  ";
        }
        return outStr;
      };
    
      const recognize = () => {
        const mn = momentNormalize();
        const extractedFeatures = extractFeatures(mn, 20.);
        let map = getMap(extractedFeatures, refPatterns[0][2], endPointDistance);
        map = completeMap(extractedFeatures, refPatterns[0][2], endPointDistance, map);
        const candidates = coarseClassification(extractedFeatures);
        
        redraw();

        // display candidates in the specified element
        if (canvasElement.dataset.candidateList) {
            document.getElementById(canvasElement.dataset.candidateList).innerHTML = fineClassification(extractedFeatures, candidates);
        } 
        // otherwise log the result to the console if no candidateList is specified
        else {
            return fineClassification(extractedFeatures, candidates);
        }
      };
    
    return (
        <>
            <button onClick={recognize}>Recognize</button>
            <button onClick={erase}>Erase</button>
            <button onClick={deleteLast}>Undo</button>
            <canvas
                style={{ border: '1px solid black' }}
                id='canvas'
                ref={canvas}
                onMouseMove={ findxy('move') }    
                onMouseDown={ findxy('down') }
                onMouseUp={ findxy('up') }
                onMouseOut={ findxy('out') }
                onMouseOver={ findxy('over') }
                onTouchMove={ findxy('move') }
                onTouchStart={ findxy('down') }
                onTouchEnd={ findxy('up') }
            />
        </>
    )
}

export default KanjiCanvas;