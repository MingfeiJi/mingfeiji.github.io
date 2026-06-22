import { MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ParticleStage } from './ParticleStage';
import { labItems, navItems, projects, timelineItems } from './data';

const sceneIds = ['home', 'work', 'lab', 'play', 'system', 'contact'];

function handleInteractiveMove(event: MouseEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  const px = ((event.clientX - rect.left) / rect.width) * 100;
  const py = ((event.clientY - rect.top) / rect.height) * 100;
  const rx = ((event.clientY - rect.top) / rect.height - 0.5) * -4;
  const ry = ((event.clientX - rect.left) / rect.width - 0.5) * 5;
  event.currentTarget.style.setProperty('--px', `${px}%`);
  event.currentTarget.style.setProperty('--py', `${py}%`);
  event.currentTarget.style.setProperty('--rx', `${rx}deg`);
  event.currentTarget.style.setProperty('--ry', `${ry}deg`);
}

function resetInteractiveMove(event: MouseEvent<HTMLElement>) {
  event.currentTarget.style.setProperty('--rx', '0deg');
  event.currentTarget.style.setProperty('--ry', '0deg');
}

export function App() {
  const [activeProject, setActiveProject] = useState(0);
  const [activeScene, setActiveScene] = useState(0);
  const shellRef = useRef<HTMLElement | null>(null);

  const activeMeta = useMemo(() => projects[activeProject], [activeProject]);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-scene-index]'));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          setActiveScene(Number(visible.target.getAttribute('data-scene-index') ?? 0));
        }
      },
      { threshold: [0.38, 0.55, 0.72] }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  function handleShellPointerMove(event: MouseEvent<HTMLElement>) {
    event.currentTarget.style.setProperty('--cursor-x', `${event.clientX}px`);
    event.currentTarget.style.setProperty('--cursor-y', `${event.clientY}px`);
  }

  return (
    <main
      ref={shellRef}
      className={`site-shell scene-${activeScene}${activeScene === 3 ? ' play-mode' : ''}`}
      onMouseMove={handleShellPointerMove}
    >
      <div className="cursor-field" aria-hidden="true" />
      <div className="scene-backdrop" aria-hidden="true">
        <div className={`backdrop-layer backdrop-home ${activeScene === 0 ? 'active' : ''}`}>
          <span className="scene-object origin-emblem" />
          <span className="scene-object origin-orbit orbit-one" />
          <span className="scene-object origin-orbit orbit-two" />
          <span className="scene-object origin-spine" />
        </div>
        <div className={`backdrop-layer backdrop-work ${activeScene === 1 ? 'active' : ''}`}>
          <span className="scene-object work-screen main-screen" />
          <span className="scene-object work-screen side-screen" />
          <span className="scene-object work-pedestal" />
        </div>
        <div className={`backdrop-layer backdrop-lab ${activeScene === 2 ? 'active' : ''}`}>
          <span className="scene-object lab-cage" />
          <span className="scene-object lab-core" />
          <span className="scene-object lab-floor" />
        </div>
        <div className={`backdrop-layer backdrop-play ${activeScene === 3 ? 'active' : ''}`}>
          <span className="scene-object play-vortex-ring ring-a" />
          <span className="scene-object play-vortex-ring ring-b" />
          <span className="scene-object play-vortex-ring ring-c" />
        </div>
        <div className={`backdrop-layer backdrop-system ${activeScene === 4 ? 'active' : ''}`}>
          <span className="scene-object system-honeycomb" />
          <span className="scene-object system-lens" />
          <span className="scene-object system-waterline" />
        </div>
        <div className={`backdrop-layer backdrop-contact ${activeScene === 5 ? 'active' : ''}`}>
          <span className="scene-object contact-ring" />
          <span className="scene-object contact-beam beam-one" />
          <span className="scene-object contact-beam beam-two" />
          <span className="scene-object contact-vessel" />
        </div>
      </div>
      <ParticleStage activeIndex={activeProject} activeScene={activeScene} />
      <Header />
      <SceneProgress activeScene={activeScene} />

      <SceneSection id="home" index={0} className="home-scene">
        <div className="coordinate-mark" aria-hidden="true">
          <span className="scope-icon" />
          <span className="coordinate-dot" />
          <span>31.2304° N, 121.4737° E</span>
        </div>

        <div className="hero-copy">
          <h1>纪鸣飞</h1>
          <div className="hero-position">AI 产品架构师 / 企业 AI 化转型 / FDE</div>
        </div>

        <div className="scroll-prompt">
          <span />
          <p>滑动探索</p>
        </div>

        <aside className="status-panel" aria-label="Current site status">
          <StatusItem label="场景" value="00 / 起点" />
          <StatusItem label="方向" value={activeMeta.role} />
        </aside>

        <StageHud />
      </SceneSection>

      <SceneSection id="work" index={1} className="work-scene">
        <div className="scene-copy side-copy">
          <span>作品</span>
          <h2>项目入口</h2>
          <p>横向滑动</p>
        </div>
        <WorkShowcase activeProject={activeProject} onActiveProject={setActiveProject} />
      </SceneSection>

      <SceneSection id="lab" index={2} className="lab-scene">
        <div className="scene-copy lab-copy">
          <span>实验</span>
          <h2>实验</h2>
        </div>
        <div className="lab-orbit-list">
          {labItems.map((item, index) => (
            <a key={item} href="/" className="lab-node">
              <span>{String(index + 1).padStart(2, '0')}</span>
              {item}
            </a>
          ))}
        </div>
      </SceneSection>

      <SceneSection id="play" index={3} className="play-scene">
        <ParticlePlayground />
      </SceneSection>

      <SceneSection id="system" index={4} className="system-scene">
        <div className="system-panel" onMouseMove={handleInteractiveMove} onMouseLeave={resetInteractiveMove}>
          <span className="system-label">档案</span>
          <h2>AI 产品 / AIGC / Web</h2>
          <div className="system-tags">
            {timelineItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </SceneSection>

      <SceneSection id="contact" index={5} className="contact-scene">
        <div className="contact-orb" aria-hidden="true" />
        <div className="scene-copy contact-copy">
          <span>联系</span>
          <h2>联系</h2>
          <p>AI 产品架构 / 企业 AI 转型 / Agent 原型</p>
          <a href="mailto:1966315939@qq.com">1966315939@qq.com ↗</a>
          <a href="/" style={{ marginTop: '10px' }}>← 返回主站</a>
        </div>
      </SceneSection>
    </main>
  );
}

function SceneSection({
  id,
  index,
  className,
  children
}: {
  id: string;
  index: number;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`scene-section ${className}`} data-scene-index={index}>
      {children}
    </section>
  );
}

function Header() {
  return (
    <header className="top-nav">
      <a className="brand-mark" href="#home" aria-label="返回首页">
        纪
      </a>
      <nav aria-label="Primary navigation">
        {navItems.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
      <a className="contact-link" href="#contact">
        联系
        <span aria-hidden="true">↗</span>
      </a>
    </header>
  );
}

function StatusItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="status-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SceneProgress({ activeScene }: { activeScene: number }) {
  return (
    <div className="scene-progress" aria-hidden="true">
      {sceneIds.map((scene, index) => (
        <a key={scene} href={`#${scene}`} className={index === activeScene ? 'active' : ''}>
          {String(index + 1).padStart(2, '0')}
        </a>
      ))}
    </div>
  );
}

function StageHud() {
  return (
    <div className="frame-lines" aria-hidden="true">
      <span className="frame-corner frame-left" />
      <span className="frame-corner frame-right" />
      <span className="tiny-cross cross-a" />
      <span className="tiny-cross cross-b" />
      <span className="signal-line signal-a" />
      <span className="signal-line signal-b" />
      <span className="scan-window" />
    </div>
  );
}

function ParticlePlayground() {
  function triggerPulse() {
    window.dispatchEvent(new CustomEvent('particle-pulse', { detail: { x: 0, y: 0 } }));
  }

  return (
    <div className="playground-ui">
      <button className="pulse-button" type="button" onClick={triggerPulse} aria-label="激发粒子">
        <span />
        <span />
      </button>
      <div className="play-gesture-field" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

function WorkShowcase({
  activeProject,
  onActiveProject
}: {
  activeProject: number;
  onActiveProject: (index: number) => void;
}) {
  const railRef = useRef<HTMLDivElement | null>(null);

  function handleScroll() {
    const rail = railRef.current;
    if (!rail) return;
    const slideWidth = rail.scrollWidth / projects.length;
    const index = Math.min(projects.length - 1, Math.max(0, Math.round(rail.scrollLeft / slideWidth)));
    onActiveProject(index);
  }

  return (
    <div className="work-showcase">
      <div className="work-question">
        <span>选择入口</span>
        {projects.map((project, index) => (
          <button
            key={project.id}
            type="button"
            className={activeProject === index ? 'active' : ''}
            onClick={() => {
              onActiveProject(index);
              railRef.current?.scrollTo({
                left: index * (railRef.current.scrollWidth / projects.length),
                behavior: 'smooth'
              });
            }}
          >
            -&gt; {project.title}
          </button>
        ))}
      </div>

      <div className="work-slider" ref={railRef} onScroll={handleScroll}>
        {projects.map((project, index) => (
          <a
            key={project.id}
            className={activeProject === index ? 'work-slide active' : 'work-slide'}
            href={project.href}
            target="_blank"
            rel="noreferrer"
            onFocus={() => onActiveProject(index)}
            onMouseEnter={() => onActiveProject(index)}
            onMouseMove={handleInteractiveMove}
            onMouseLeave={resetInteractiveMove}
          >
            <div className="work-slide-media">
              <span className="slide-index">{project.index}</span>
              <h3>{project.title}</h3>
              <p>{project.summary}</p>
              <div className="slide-tags">
                {project.tags.slice(0, 3).map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
            <span className="slide-open">打开 ↗</span>
          </a>
        ))}
      </div>
    </div>
  );
}
