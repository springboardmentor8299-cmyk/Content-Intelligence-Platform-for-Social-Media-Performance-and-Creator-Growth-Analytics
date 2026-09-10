import React, { useEffect, useRef } from 'react';

export const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Particle color palette matching specifications: Primary Blue, Cyan, Purple, Pink
    const colors = ['#4A7CF7', '#00D4FF', '#7C5CFC', '#FF6B9D'];

    // Particle pool setup
    const particleCount = Math.min(Math.floor((canvas.width * canvas.height) / 12000), 75);
    const particles = [];

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 2.5 + 1;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.alpha = Math.random() * 0.6 + 0.2;
        this.pulseSpeed = Math.random() * 0.02 + 0.005;
        this.pulseDirection = Math.random() > 0.5 ? 1 : -1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off canvas boundaries smoothly
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        // Alpha pulsing effect
        this.alpha += this.pulseSpeed * this.pulseDirection;
        if (this.alpha >= 0.85 || this.alpha <= 0.2) {
          this.pulseDirection *= -1;
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Connect nearby particles with subtle glowing lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const lineAlpha = (1 - dist / 140) * 0.25;
            ctx.strokeStyle = particles[i].color;
            ctx.globalAlpha = lineAlpha;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Update & Draw particles
      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Canvas for particle system */}
      <canvas ref={canvasRef} className="particle-canvas" />

      {/* Floating Animated Gradient Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#4A7CF7]/25 blur-[120px] animate-pulse-slow" />
      <div className="absolute top-1/2 -right-32 w-[30rem] h-[30rem] rounded-full bg-[#00D4FF]/20 blur-[140px] animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
      <div className="absolute -bottom-32 left-1/3 w-[26rem] h-[26rem] rounded-full bg-[#7C5CFC]/20 blur-[130px] animate-pulse-slow" style={{ animationDelay: '3s' }} />
    </div>
  );
};
