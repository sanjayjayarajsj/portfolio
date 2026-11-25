import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  HostListener,
  inject,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css']
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  @ViewChild('liquidCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  firstNameChars = 'Sanjay'.split('');
  lastNameChars = 'Jayaraj'.split('');

  private platformId = inject(PLATFORM_ID);
  private gl: WebGLRenderingContext | null = null;
  private animationFrameId: number | null = null;
  private program: WebGLProgram | null = null;

  // Shader uniforms
  private uResolutionLoc: WebGLUniformLocation | null = null;
  private uMouseLoc: WebGLUniformLocation | null = null;
  private uTimeLoc: WebGLUniformLocation | null = null;
  private uVelocityLoc: WebGLUniformLocation | null = null;

  private mouseX = 0;
  private mouseY = 0;
  private targetMouseX = 0;
  private targetMouseY = 0;
  private velocity = 0;
  private startTime = Date.now();

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId) && this.canvasRef) {
      this.initWebGL();
    }
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(e: MouseEvent): void {
    const rect = this.canvasRef?.nativeElement.getBoundingClientRect();
    if (!rect) return;

    this.targetMouseX = e.clientX - rect.left;
    this.targetMouseY = e.clientY - rect.top;

    const dx = this.targetMouseX - this.mouseX;
    const dy = this.targetMouseY - this.mouseY;
    const speed = Math.sqrt(dx * dx + dy * dy);
    this.velocity = Math.min(this.velocity + speed * 0.08, 2.5);
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(e: TouchEvent): void {
    if (e.touches.length === 0) return;
    const rect = this.canvasRef?.nativeElement.getBoundingClientRect();
    if (!rect) return;

    this.targetMouseX = e.touches[0].clientX - rect.left;
    this.targetMouseY = e.touches[0].clientY - rect.top;
    this.velocity = Math.min(this.velocity + 1.2, 2.5);
  }

  @HostListener('window:resize', [])
  onResize(): void {
    if (this.gl && this.canvasRef) {
      this.resizeCanvas();
    }
  }

  private initWebGL(): void {
    const canvas = this.canvasRef.nativeElement;
    this.gl = canvas.getContext('webgl', { alpha: true, antialias: true });
    if (!this.gl) return;

    const gl = this.gl;
    this.resizeCanvas();

    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_position + 1.0) * 0.5;
        v_uv.y = 1.0 - v_uv.y;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      uniform sampler2D u_texture;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_time;
      uniform float u_velocity;
      varying vec2 v_uv;

      void main() {
        vec2 uv = v_uv;
        vec2 mouseUv = u_mouse / u_resolution;
        mouseUv.y = 1.0 - mouseUv.y;

        float d = distance(uv, mouseUv);

        // Fluid ripple ring with dispersion
        float ripple = sin(d * 32.0 - u_time * 4.5) * exp(-d * 5.0) * u_velocity * 0.035;

        // Ambient gentle undulation
        float ambient = sin(uv.x * 5.0 + u_time * 0.6) * cos(uv.y * 5.0 + u_time * 0.5) * 0.003;

        vec2 dir = (d > 0.001) ? normalize(uv - mouseUv) : vec2(0.0);
        vec2 distortedUv = uv + dir * ripple + ambient;

        // Chromatic dispersion along ripple edge
        float r = texture2D(u_texture, distortedUv + dir * ripple * 0.35).r;
        float g = texture2D(u_texture, distortedUv).g;
        float b = texture2D(u_texture, distortedUv - dir * ripple * 0.35).b;

        gl_FragColor = vec4(r, g, b, 1.0);
      }
    `;

    const vs = this.compileShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = this.compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    this.program = gl.createProgram();
    if (!this.program) return;
    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.warn('WebGL link error', gl.getProgramInfoLog(this.program));
      return;
    }

    gl.useProgram(this.program);

    // Quad geometry
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posAttr = gl.getAttribLocation(this.program, 'a_position');
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    this.uResolutionLoc = gl.getUniformLocation(this.program, 'u_resolution');
    this.uMouseLoc = gl.getUniformLocation(this.program, 'u_mouse');
    this.uTimeLoc = gl.getUniformLocation(this.program, 'u_time');
    this.uVelocityLoc = gl.getUniformLocation(this.program, 'u_velocity');

    // Load texture
    const texture = gl.createTexture();
    const image = new Image();
    image.src = '/hero/aura.webp';
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

      this.render();
    };
  }

  private compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn('Shader compile failed', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    this.gl?.viewport(0, 0, canvas.width, canvas.height);
  }

  private render = (): void => {
    if (!this.gl || !this.program) return;
    const gl = this.gl;
    const canvas = this.canvasRef.nativeElement;

    // Smooth cursor interpolation
    this.mouseX += (this.targetMouseX * (canvas.width / canvas.clientWidth) - this.mouseX) * 0.12;
    this.mouseY += (this.targetMouseY * (canvas.height / canvas.clientHeight) - this.mouseY) * 0.12;
    this.velocity *= 0.94; // slow decay

    const time = (Date.now() - this.startTime) * 0.001;

    gl.useProgram(this.program);
    gl.uniform2f(this.uResolutionLoc, canvas.width, canvas.height);
    gl.uniform2f(this.uMouseLoc, this.mouseX, this.mouseY);
    gl.uniform1f(this.uTimeLoc, time);
    gl.uniform1f(this.uVelocityLoc, this.velocity);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    this.animationFrameId = requestAnimationFrame(this.render);
  };
}
