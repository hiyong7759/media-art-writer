# Canvas Animation Patterns 레퍼런스

## Canvas 2D 기본

### 컨텍스트 설정

```javascript
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// 고해상도 디스플레이 대응
const dpr = window.devicePixelRatio || 1;
canvas.width = width * dpr;
canvas.height = height * dpr;
ctx.scale(dpr, dpr);
```

### 애니메이션 루프

```javascript
let frame = 0;

function animate() {
    // 배경 클리어 (트레일 효과용)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);

    // 완전 클리어
    // ctx.clearRect(0, 0, width, height);

    // 렌더링 로직
    draw();

    frame++;
    requestAnimationFrame(animate);
}
```

## 파티클 시스템

### 기본 파티클

```javascript
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.life = 1;
        this.decay = 0.01;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
    }

    draw(ctx) {
        ctx.globalAlpha = this.life;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    isDead() {
        return this.life <= 0;
    }
}
```

### 파티클 관리

```javascript
const particles = [];
const MAX_PARTICLES = 1000;

function updateParticles() {
    // 업데이트 및 죽은 파티클 제거
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].isDead()) {
            particles.splice(i, 1);
        }
    }

    // 새 파티클 생성
    if (particles.length < MAX_PARTICLES) {
        particles.push(new Particle(width / 2, height / 2));
    }
}
```

## 기하학적 패턴

### 다각형 그리기

```javascript
function drawPolygon(ctx, cx, cy, radius, sides, rotation = 0) {
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2 + rotation;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
}
```

### 별 모양

```javascript
function drawStar(ctx, cx, cy, outerR, innerR, points) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
        const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
        const r = i % 2 === 0 ? outerR : innerR;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
}
```

### 나선 (Spiral)

```javascript
function drawSpiral(ctx, cx, cy, turns, maxRadius) {
    ctx.beginPath();
    const points = turns * 100;
    for (let i = 0; i < points; i++) {
        const t = i / points;
        const angle = t * turns * Math.PI * 2;
        const r = t * maxRadius;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
}
```

## 파동 효과

### 사인파

```javascript
function drawSineWave(ctx, y, amplitude, frequency, phase) {
    ctx.beginPath();
    for (let x = 0; x < width; x++) {
        const waveY = y + Math.sin(x * frequency + phase) * amplitude;
        if (x === 0) ctx.moveTo(x, waveY);
        else ctx.lineTo(x, waveY);
    }
    ctx.stroke();
}
```

### 동심원 파동

```javascript
function drawRipple(ctx, cx, cy, time, count = 5) {
    for (let i = 0; i < count; i++) {
        const phase = (time + i * 0.5) % 3;
        const r = phase * 100;
        const alpha = 1 - phase / 3;

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.stroke();
    }
}
```

## 유기적 움직임

### 펄린 노이즈 근사 (Simplex-like)

```javascript
// 간단한 노이즈 함수
function noise(x, y, t) {
    return (
        Math.sin(x * 0.1 + t) * 0.5 +
        Math.sin(y * 0.1 + t * 0.7) * 0.5 +
        Math.sin((x + y) * 0.05 + t * 0.3) * 0.5
    ) / 1.5;
}
```

### 유동적 움직임

```javascript
function fluidMotion(x, y, t) {
    const angle = noise(x, y, t) * Math.PI * 2;
    return {
        vx: Math.cos(angle),
        vy: Math.sin(angle)
    };
}
```

### 성장 애니메이션

```javascript
class GrowingBranch {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.length = 0;
        this.maxLength = 50 + Math.random() * 50;
        this.speed = 0.5 + Math.random() * 0.5;
    }

    grow() {
        if (this.length < this.maxLength) {
            this.length += this.speed;
            return true;
        }
        return false;
    }

    draw(ctx) {
        const endX = this.x + Math.cos(this.angle) * this.length;
        const endY = this.y + Math.sin(this.angle) * this.length;

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }
}
```

## 그라디언트

### 방사형 그라디언트

```javascript
const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
ctx.fillStyle = gradient;
```

### 선형 그라디언트

```javascript
const gradient = ctx.createLinearGradient(0, 0, width, height);
gradient.addColorStop(0, '#ff0000');
gradient.addColorStop(0.5, '#00ff00');
gradient.addColorStop(1, '#0000ff');
```

## 블렌딩 모드

```javascript
// 가산 혼합 (빛나는 효과)
ctx.globalCompositeOperation = 'lighter';

// 곱하기 (어둡게)
ctx.globalCompositeOperation = 'multiply';

// 오버레이
ctx.globalCompositeOperation = 'overlay';

// 스크린 (밝게)
ctx.globalCompositeOperation = 'screen';

// 기본으로 되돌리기
ctx.globalCompositeOperation = 'source-over';
```

## 변환 (Transform)

```javascript
ctx.save();

// 이동
ctx.translate(cx, cy);

// 회전 (라디안)
ctx.rotate(angle);

// 스케일
ctx.scale(sx, sy);

// 그리기...
drawShape();

ctx.restore();
```

## 그림자 효과

```javascript
ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
ctx.shadowBlur = 10;
ctx.shadowOffsetX = 5;
ctx.shadowOffsetY = 5;

// 네온 글로우 효과
ctx.shadowColor = '#00ffff';
ctx.shadowBlur = 20;
```

## 성능 최적화

### 오프스크린 캔버스

```javascript
const offscreen = document.createElement('canvas');
offscreen.width = width;
offscreen.height = height;
const offCtx = offscreen.getContext('2d');

// 복잡한 것을 오프스크린에 그리기
drawComplexShape(offCtx);

// 메인 캔버스에 복사
ctx.drawImage(offscreen, 0, 0);
```

### 경로 재사용

```javascript
// Path2D로 경로 캐싱
const cachedPath = new Path2D();
cachedPath.arc(0, 0, 10, 0, Math.PI * 2);

// 여러 번 사용
ctx.fill(cachedPath);
```

### 배치 렌더링

```javascript
// 나쁜 예: 매번 상태 변경
particles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 2, 2);
});

// 좋은 예: 색상별로 그룹화
const byColor = groupBy(particles, 'color');
Object.entries(byColor).forEach(([color, group]) => {
    ctx.fillStyle = color;
    group.forEach(p => ctx.fillRect(p.x, p.y, 2, 2));
});
```

## 수학 유틸리티

### 거리 계산

```javascript
function dist(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}
```

### 선형 보간

```javascript
function lerp(a, b, t) {
    return a + (b - a) * t;
}
```

### 값 제한

```javascript
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
```

### 맵핑

```javascript
function map(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) / (inMax - inMin) * (outMax - outMin) + outMin;
}
```

### 이징 함수

```javascript
const easing = {
    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: t => t * t * t,
    easeOutCubic: t => (--t) * t * t + 1,
    easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    easeInElastic: t => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI),
    easeOutElastic: t => t === 1 ? 1 : -Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1
};
```
