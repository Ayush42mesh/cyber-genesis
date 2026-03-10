import { useEffect, useRef } from 'react';

export default function ParticlesCanvas() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const cv = canvasRef.current;
        if (!cv) return;
        const cx = cv.getContext('2d');
        let W, H, pts = [], animationFrameId;

        function rCv() {
            W = cv.width = window.innerWidth;
            H = cv.height = window.innerHeight;
        }
        rCv();
        window.addEventListener('resize', rCv);

        class P {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * W;
                this.y = Math.random() * H;
                this.r = Math.random() * 1.4 + 0.3;
                this.vy = -(Math.random() * 0.4 + 0.08);
                this.vx = (Math.random() - 0.5) * 0.18;
                this.a = Math.random() * 0.35 + 0.06;
                this.c = Math.random() > 0.7 ? '#b44fff' : Math.random() > 0.5 ? '#00ff88' : '#00d4ff';
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.y < -5) this.reset();
            }
            draw() {
                cx.beginPath();
                cx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                cx.fillStyle = this.c;
                cx.globalAlpha = this.a;
                cx.fill();
                cx.globalAlpha = 1;
            }
        }

        for (let i = 0; i < 110; i++) pts.push(new P());

        function loop() {
            cx.clearRect(0, 0, W, H);
            pts.forEach(p => { p.update(); p.draw(); });
            animationFrameId = requestAnimationFrame(loop);
        }
        loop();

        return () => {
            window.removeEventListener('resize', rCv);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas id="particles" ref={canvasRef}></canvas>;
}
