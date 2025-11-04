"use client"

import { useEffect, useRef } from "react"

export function VoronoiIllumCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sketchRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined") return

    // Dynamically import p5 to avoid SSR issues
    import("p5").then((p5Module) => {
      const p5 = p5Module.default

      const sketch = (p: any) => {
        let paintShader: any, voronoiShader: any, floodShader: any, illumShader: any
        let distanceShader: any, distanceShowShader: any, blurShader: any
        let prev: any, next: any, sz: number
        let show = "illum"
        let cnv: any
        const num = 7
        let t_var = 8

        // Shader sources
        const vertexShaderSrc = `
precision highp float;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTexCoord;

void main() {
  vTexCoord = aTexCoord;
  vec4 positionVec4 = vec4(aPosition, 1.0);
  gl_Position = uProjectionMatrix * uModelViewMatrix * positionVec4;
}`

        const paintShaderSrc = `
precision highp float;
uniform vec4 u_color;
void main() {
    gl_FragColor = u_color;
}`

        const voronoiShaderSrc = `
precision highp float;
uniform vec2 u_pixel;
uniform sampler2D u_tex;
varying vec2 vTexCoord;

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 regionColor(float regionId) {
    float r = rand(vec2(regionId,1.));
    float g = rand(vec2(regionId,2.));
    float b = rand(vec2(regionId,3.));
    return vec3 (r,g,b);
}

void main() {
    vec4 p = texture2D (u_tex,vTexCoord);
    if (p.a > 0.) {
        gl_FragColor = vec4(regionColor(p.a),1.);
    }
    else if (p.a < 0.) {
        vec2 uv = p.rg;
        vec4 pixel = texture2D (u_tex,uv);
        gl_FragColor = vec4(regionColor(pixel.a), 0.9);
    }
    else {
        gl_FragColor = vec4(1.);
    }
}`

        const floodShaderSrc = `
precision highp float;
uniform vec2 u_pixel;
uniform sampler2D u_tex;
uniform float u_step;
varying vec2 vTexCoord;
#define FAR 1e9

void main() {
    vec4 p = texture2D (u_tex,vTexCoord);
    
    if (p.a > 0.) {
        gl_FragColor = p;
        return;
    }
    
    vec2 closest_pixel = vec2(-1);
    float closest_dist = FAR;
    if (p.a == -1.) {
        closest_pixel = p.rg;
        closest_dist = length((p.rg-vTexCoord)/u_pixel);
    }
    
    for (int y = -1; y <= 1; ++y) {
        for (int x = -1; x <= 1; ++x) { 
            vec2 v = vec2(float(x),float(y)) * u_step;
            vec2 uv = vTexCoord + v * u_pixel;
            if (uv.x < 0. || uv.x >= 1. || uv.y < 0. || uv.y >= 1.) continue;
            vec4 sample = texture2D (u_tex, uv);
            
            if (sample.a >= 1.) {
                float dist = length(v);
                if (dist < closest_dist) {
                    closest_dist = dist;
                    closest_pixel = uv;
                }
            } else if (sample.a == -1.) {
                float dist = length((sample.rg-vTexCoord)/u_pixel);
                if (dist < closest_dist) {
                    closest_dist = dist;
                    closest_pixel = sample.rg;
                }
            }
        }
    }
    if (closest_dist < FAR) p = vec4(closest_pixel,0.,-1.);
    gl_FragColor = p;
}`

        const distanceShaderSrc = `
precision highp float;
uniform vec2 u_pixel;
uniform sampler2D u_tex;
varying vec2 vTexCoord;

void main() {
    vec4 p = texture2D (u_tex,vTexCoord);
    if (p.a > 0.) {
        gl_FragColor = vec4(0.,0.,0.,p.a);
    }
    else if (p.a < 0.) {
        vec2 uv = p.rg; 
        vec4 pixel = texture2D (u_tex,uv);
        float dist = length((p.rg-vTexCoord)/u_pixel);
        gl_FragColor = vec4(dist,0., 0., pixel.a);
    }
    else {
        gl_FragColor = vec4(0.,0.,1.,0.); 
    }
}`

        const distanceShowShaderSrc = `
precision highp float;
uniform sampler2D u_tex;
varying vec2 vTexCoord;

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 regionColor(float regionId) {
    float r = rand(vec2(regionId,1.));
    float g = rand(vec2(regionId,2.));
    float b = rand(vec2(regionId,3.));
    return vec3 (r,g,b);
}

void main() {
    float maxDist = 500.;
    vec4 p = texture2D (u_tex,vTexCoord);
    vec3 basicColor = regionColor(p.a);
    float dist = p.r;
    if (mod(floor(dist),20.) != 0.) {
        float alpha = clamp((maxDist-dist)/maxDist,0.,1.);
        gl_FragColor = vec4(basicColor, alpha); 
    }
    else {
        gl_FragColor = vec4(0., 0., 0., 1.); 
    }
}`

        const blurShaderSrc = `
precision highp float;
uniform sampler2D u_tex;
uniform vec2 u_pixel;
varying vec2 vTexCoord;

#define gaussian_blur mat3(1., 2., 1., 2., 4., 2., 1., 2., 1.) * 0.0625

vec4 convolute(vec2 uv, mat3 kernel) {
    vec4 color = vec4(0.);
    float direction[3];
    direction[0] = -1.;
    direction[1] = 0.;
    direction[2] = 1.;
    for (int x = 0; x < 3; x++) {
        for (int y = 0; y < 3; y++) {
            vec2 offset = vec2(direction[x], direction[y]) * u_pixel;
            color += texture2D(u_tex, uv+offset) * kernel[x][y];
        }
    }
    return color;
}

void main() {
    gl_FragColor = convolute(vTexCoord, gaussian_blur);
}`

        const illumShaderSrc = `
precision highp float;
uniform vec2 u_pixel;
uniform sampler2D u_tex;
uniform float u_time;
varying vec2 vTexCoord;

#define PI 3.141596
#define RAYS_PER_PIXEL 48
#define MAX_RAYMARCH_STEPS 100
#define MAX_DIST 500.0

float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

vec3 lin_to_srgb (vec3 color) {
    vec3 x = color.rgb * 12.92;
    vec3 y = 1.055 * pow(clamp(color, 0.0, 1.0), vec3(0.4166667)) - 0.055;
    vec3 clr = color;
    clr.r = (color.r < 0.0031308) ? x.r : y.r;
    clr.g = (color.g < 0.0031308) ? x.g : y.g;
    clr.b = (color.b < 0.0031308) ? x.b : y.b;
    return clr;
}

vec2 raymarch(vec2 origin, vec2 dir) {
    float current_dist = 0.0;
    for(int i = 0; i < MAX_RAYMARCH_STEPS; i++) {
        vec2 point_coords = origin + dir * current_dist;
        vec2 uv = point_coords * u_pixel;

        if(uv.x > 1.0 || uv.x < 0.0 || uv.y > 1.0 || uv.y < 0.0 || current_dist > MAX_DIST) return vec2(-1);

        vec4 sample = texture2D (u_tex, uv);
        float dist_to_surface = sample.r;

        if(dist_to_surface < 0.001) {
            return vec2 (current_dist, sample.a);
        }

        current_dist += dist_to_surface;
    }
    return vec2(-1);
}

void main() {
    vec3 pixel_col = vec3(0.0);
    vec2 uv = vTexCoord;
    vec2 pos = uv / u_pixel;

    float rand2pi = random(uv * vec2(u_time, -u_time)) * 2.0 * PI;
    float golden_angle = PI * 0.7639320225;

    for(int i = 0; i < RAYS_PER_PIXEL; i++) {
        float cur_angle = rand2pi + golden_angle * float(i);
        vec2 ray_dir = normalize(vec2(cos(cur_angle), sin(cur_angle)));
        vec2 hit = raymarch(pos, ray_dir);
        float dist = hit.x;
        float id = hit.y;
        if(id > 0.) {
            if (mod(id, 2.) < 0.01) {
                if (dist > 0.01) pixel_col += vec3((MAX_DIST-min(dist,MAX_DIST))/MAX_DIST);
                else {
                    gl_FragColor = vec4(1.,1.,1.,1.);
                    return;
                }
            }
        }
    }
    gl_FragColor = vec4 (lin_to_srgb(pixel_col / float(RAYS_PER_PIXEL)), 1.);
}`

        p.setup = () => {
          cnv = p.createCanvas(920, 690, p.WEBGL)
          
          p.pixelDensity(1)
          sz = p.min(p.width, p.height)

          paintShader = p.createShader(vertexShaderSrc, paintShaderSrc)
          voronoiShader = p.createShader(vertexShaderSrc, voronoiShaderSrc)
          floodShader = p.createShader(vertexShaderSrc, floodShaderSrc)
          distanceShader = p.createShader(vertexShaderSrc, distanceShaderSrc)
          distanceShowShader = p.createShader(vertexShaderSrc, distanceShowShaderSrc)
          illumShader = p.createShader(vertexShaderSrc, illumShaderSrc)
          blurShader = p.createShader(vertexShaderSrc, blurShaderSrc)

          prev = p.createFramebuffer({
            format: p.FLOAT,
            depth: false,
            textureFiltering: p.NEAREST,
            antialias: false,
          })
          next = p.createFramebuffer({
            format: p.FLOAT,
            depth: false,
            textureFiltering: p.NEAREST,
            antialias: false,
          })
        }

        p.mouseClicked = () => {
          t_var++
          const monthStr = String(p.month() + 1).padStart(2, "0")
          const dayStr = String(p.day()).padStart(2, "0")
          const hourStr = String(p.hour()).padStart(2, "0")
          const minuteStr = String(p.minute()).padStart(2, "0")
          const secondStr = String(p.second()).padStart(2, "0")
          p.save(`img_${monthStr}-${dayStr}_${hourStr}-${minuteStr}-${secondStr}.jpg`)
        }

        p.keyPressed = () => {
          if (p.key === "S" || p.key === "s") {
            p.save(cnv, "myCanvas.jpg", true)
          } else if (show === "voronoi") {
            show = "distance"
          } else if (show === "distance") {
            show = "illum"
          } else if (show === "illum") {
            show = "voronoi"
          }
        }

        p.draw = () => {
          const t = p.millis() * 0.0001
          p.noStroke()

          // Paint pixels
          paintShader.setUniform("u_color", [0, 0, 0, 1])
          p.shader(paintShader)
          prev.begin()
          p.clear()
          p.noiseSeed(0.5)

          for (let i = 0; i < num; i += 1) {
            paintShader.setUniform("u_color", [0, 0, 0, i + 1])
            const x = p.map(p.noise(i * 10, 0, t), 0, 1, -p.width / 2, p.width / 2)
            const y = p.map(p.noise(i * 10, 100, t), 0, 1, -p.height / 2, p.height / 2)
            p.push()
            p.translate(x, y)
            p.rotate(p.map(p.noise(i * 10, 1000, t * 4), 0, 1, -p.PI, p.PI))
            p.rect(-40, -5, 80, 10)
            p.pop()
          }
          prev.end()

          // Jump flood passes
          for (let i = 12; i >= 0; i--) {
            next.begin()
            p.clear()
            p.shader(floodShader)
            floodShader.setUniform("u_tex", prev.color)
            floodShader.setUniform("u_step", 1 << i)
            floodShader.setUniform("u_pixel", [1 / p.width, 1 / p.height])
            p.plane(p.width, p.height)
            next.end()
            ;[next, prev] = [prev, next]
          }

          // Display
          if (show === "voronoi") {
            p.shader(voronoiShader)
            voronoiShader.setUniform("u_tex", prev.color)
            voronoiShader.setUniform("u_pixel", [1 / p.width, 1 / p.height])
            p.plane(p.width, p.height)
          } else {
            // Compute distance field
            next.begin()
            p.clear()
            p.shader(distanceShader)
            distanceShader.setUniform("u_tex", prev.color)
            distanceShader.setUniform("u_pixel", [1 / p.width, 1 / p.height])
            p.plane(p.width, p.height)
            next.end()

            // Display the distances
            prev.begin()
            p.clear()
            if (show === "distance") {
              p.shader(distanceShowShader)
              distanceShowShader.setUniform("u_tex", next.color)
              p.plane(p.width, p.height)
            } else {
              p.shader(illumShader)
              illumShader.setUniform("u_tex", next.color)
              illumShader.setUniform("u_pixel", [1 / p.width, 1 / p.height])
              illumShader.setUniform("u_time", t)
              p.plane(p.width, p.height)
            }
            prev.end()

            next.begin()
            p.shader(blurShader)
            blurShader.setUniform("u_tex", prev.color)
            blurShader.setUniform("u_pixel", [1 / p.width, 1 / p.height])
            p.plane(p.width, p.height)
            next.end()

            p.shader(blurShader)
            blurShader.setUniform("u_tex", next.color)
            blurShader.setUniform("u_pixel", [1 / p.width, 1 / p.height])
            p.plane(p.width, p.height)
          }
        }
      }

      sketchRef.current = new p5(sketch, containerRef.current)
    })

    return () => {
      if (sketchRef.current) {
        sketchRef.current.remove()
      }
    }
  }, [])

  return <div ref={containerRef} className="w-full h-full" />
}
