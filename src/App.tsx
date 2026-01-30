import { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { 
  OrbitControls, 
  Environment, 
  ContactShadows,
  Float,
  Sphere,
  Box,
  Torus,
  TorusKnot,
  RoundedBox,
  Icosahedron,
  Octahedron,
  Dodecahedron
} from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'

// Material presets with PBR properties
const materials = {
  // Metals
  chrome: {
    name: 'Chrome',
    category: 'metal',
    color: '#e8e8e8',
    metalness: 1,
    roughness: 0.05,
    envMapIntensity: 1.5,
  },
  gold: {
    name: 'Gold',
    category: 'metal',
    color: '#ffd700',
    metalness: 1,
    roughness: 0.1,
    envMapIntensity: 1.2,
  },
  copper: {
    name: 'Copper',
    category: 'metal', 
    color: '#b87333',
    metalness: 1,
    roughness: 0.15,
    envMapIntensity: 1.0,
  },
  brushedSteel: {
    name: 'Brushed Steel',
    category: 'metal',
    color: '#8a8a8a',
    metalness: 0.95,
    roughness: 0.35,
    envMapIntensity: 0.8,
  },
  blackMetal: {
    name: 'Anodized Black',
    category: 'metal',
    color: '#1a1a1a',
    metalness: 0.9,
    roughness: 0.2,
    envMapIntensity: 1.0,
  },
  
  // Plastics
  glossyPlastic: {
    name: 'Glossy Plastic',
    category: 'plastic',
    color: '#ff3366',
    metalness: 0,
    roughness: 0.1,
    envMapIntensity: 0.8,
  },
  mattePlastic: {
    name: 'Matte Plastic',
    category: 'plastic',
    color: '#3366ff',
    metalness: 0,
    roughness: 0.7,
    envMapIntensity: 0.3,
  },
  satin: {
    name: 'Satin Finish',
    category: 'plastic',
    color: '#33ff66',
    metalness: 0,
    roughness: 0.4,
    envMapIntensity: 0.5,
  },
  
  // Ceramics
  porcelain: {
    name: 'Porcelain',
    category: 'ceramic',
    color: '#f5f5f0',
    metalness: 0,
    roughness: 0.15,
    envMapIntensity: 0.6,
  },
  ceramic: {
    name: 'Glazed Ceramic',
    category: 'ceramic',
    color: '#2255aa',
    metalness: 0.05,
    roughness: 0.08,
    envMapIntensity: 0.7,
  },
  
  // Rubber/Soft
  rubber: {
    name: 'Rubber',
    category: 'soft',
    color: '#222222',
    metalness: 0,
    roughness: 0.9,
    envMapIntensity: 0.1,
  },
  velvet: {
    name: 'Velvet',
    category: 'soft',
    color: '#660033',
    metalness: 0,
    roughness: 0.95,
    envMapIntensity: 0.05,
  },
  
  // Special
  glass: {
    name: 'Glass',
    category: 'special',
    color: '#ffffff',
    metalness: 0,
    roughness: 0,
    transmission: 0.95,
    thickness: 0.5,
    envMapIntensity: 1.0,
  },
  emission: {
    name: 'Emissive',
    category: 'special',
    color: '#02d7f2',
    metalness: 0,
    roughness: 0.5,
    emissive: '#02d7f2',
    emissiveIntensity: 2,
    envMapIntensity: 0.3,
  },
  holographic: {
    name: 'Holographic',
    category: 'special',
    color: '#ff00ff',
    metalness: 1,
    roughness: 0.1,
    iridescence: 1,
    iridescenceIOR: 1.5,
    envMapIntensity: 1.5,
  },
}

type MaterialKey = keyof typeof materials

// Object shapes
const shapes = {
  sphere: 'Sphere',
  cube: 'Cube',
  roundedBox: 'Rounded Box',
  torus: 'Torus',
  torusKnot: 'Torus Knot',
  icosahedron: 'Icosahedron',
  octahedron: 'Octahedron',
  dodecahedron: 'Dodecahedron',
}

type ShapeKey = keyof typeof shapes

// Environment presets
const environments = {
  studio: 'studio',
  city: 'city',
  sunset: 'sunset',
  dawn: 'dawn',
  night: 'night',
  forest: 'forest',
  apartment: 'apartment',
  warehouse: 'warehouse',
  park: 'park',
  lobby: 'lobby',
}

type EnvKey = keyof typeof environments

// Shape component
function Shape({ shape, materialProps }: { shape: ShapeKey; materialProps: any }) {
  const { transmission, thickness, emissive, emissiveIntensity, iridescence, iridescenceIOR, ...baseProps } = materialProps
  
  // Use MeshPhysicalMaterial for glass/transmission, otherwise MeshStandardMaterial
  const isPhysical = transmission || iridescence
  
  const material = isPhysical ? (
    <meshPhysicalMaterial
      {...baseProps}
      transmission={transmission}
      thickness={thickness}
      iridescence={iridescence}
      iridescenceIOR={iridescenceIOR}
    />
  ) : (
    <meshStandardMaterial
      {...baseProps}
      emissive={emissive ? new THREE.Color(emissive) : undefined}
      emissiveIntensity={emissiveIntensity || 0}
    />
  )
  
  switch (shape) {
    case 'sphere':
      return <Sphere args={[1, 64, 64]}>{material}</Sphere>
    case 'cube':
      return <Box args={[1.6, 1.6, 1.6]}>{material}</Box>
    case 'roundedBox':
      return <RoundedBox args={[1.5, 1.5, 1.5]} radius={0.15} smoothness={4}>{material}</RoundedBox>
    case 'torus':
      return <Torus args={[0.8, 0.35, 32, 64]}>{material}</Torus>
    case 'torusKnot':
      return <TorusKnot args={[0.7, 0.25, 128, 32]}>{material}</TorusKnot>
    case 'icosahedron':
      return <Icosahedron args={[1, 0]}>{material}</Icosahedron>
    case 'octahedron':
      return <Octahedron args={[1.2, 0]}>{material}</Octahedron>
    case 'dodecahedron':
      return <Dodecahedron args={[1, 0]}>{material}</Dodecahedron>
    default:
      return <Sphere args={[1, 64, 64]}>{material}</Sphere>
  }
}

// Scene content
function Scene({ 
  shape, 
  materialKey, 
  environment,
  envBlur,
  showEffects 
}: { 
  shape: ShapeKey
  materialKey: MaterialKey
  environment: EnvKey
  envBlur: number
  showEffects: boolean
}) {
  const mat = materials[materialKey]
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} castShadow />
      <directionalLight position={[-5, 3, -5]} intensity={0.3} color="#ff9966" />
      
      {/* Environment map for reflections + background */}
      <Environment key={environment} preset={environment} background={true} blur={envBlur} />
      
      {/* Main object with float animation */}
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
        <Shape shape={shape} materialProps={mat} />
      </Float>
      
      {/* Ground shadows */}
      <ContactShadows 
        position={[0, -1.5, 0]} 
        opacity={0.5} 
        scale={8} 
        blur={2} 
        far={3}
      />
      
      {/* Controls */}
      <OrbitControls 
        enablePan={false}
        minDistance={2.5}
        maxDistance={8}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2}
        autoRotate
        autoRotateSpeed={0.5}
      />
      
      {/* Post-processing */}
      {showEffects && (
        <EffectComposer>
          <Bloom 
            luminanceThreshold={0.8}
            luminanceSmoothing={0.9}
            intensity={0.4}
          />
          <Vignette eskil={false} offset={0.1} darkness={0.5} />
        </EffectComposer>
      )}
    </>
  )
}

// Category badge component
function CategoryBadge({ category }: { category: string }) {
  const colors: Record<string, string> = {
    metal: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    plastic: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    ceramic: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    soft: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    special: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  }
  
  return (
    <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase tracking-wider ${colors[category] || ''}`}>
      {category}
    </span>
  )
}

// Main App
export default function App() {
  const [currentMaterial, setCurrentMaterial] = useState<MaterialKey>('chrome')
  const [currentShape, setCurrentShape] = useState<ShapeKey>('sphere')
  const [currentEnv, setCurrentEnv] = useState<EnvKey>('studio')
  const [envBlur, setEnvBlur] = useState(0.6)
  const [showEffects, setShowEffects] = useState(true)
  const [antialias, setAntialias] = useState(true)
  const [panelOpen, setPanelOpen] = useState(true)
  
  const mat = materials[currentMaterial]
  
  return (
    <div className="h-screen w-screen flex overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${panelOpen ? 'w-72' : 'w-0'} flex-shrink-0 bg-[var(--surface)] border-r border-[var(--border)] overflow-hidden transition-all duration-300`}
      >
        <div className="w-72 h-full overflow-y-auto p-4">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-lg font-bold tracking-wider text-[var(--primary)]">MATERIAL_LAB</h1>
            <p className="text-xs text-[var(--muted)] mt-1">PBR Surface Explorer</p>
          </div>
          
          {/* Shape selector */}
          <div className="mb-6">
            <label className="text-[10px] text-[var(--muted)] uppercase tracking-widest block mb-2">Geometry</label>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(shapes) as ShapeKey[]).map(key => (
                <button
                  key={key}
                  onClick={() => setCurrentShape(key)}
                  className={`text-xs py-1.5 px-2 rounded border transition-all ${
                    currentShape === key 
                      ? 'bg-[var(--primary)]/20 border-[var(--primary)] text-[var(--primary)]' 
                      : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--primary)]/50'
                  }`}
                >
                  {shapes[key]}
                </button>
              ))}
            </div>
          </div>
          
          {/* Material selector */}
          <div className="mb-6">
            <label className="text-[10px] text-[var(--muted)] uppercase tracking-widest block mb-2">Material</label>
            <div className="space-y-1">
              {(Object.keys(materials) as MaterialKey[]).map(key => {
                const m = materials[key]
                return (
                  <button
                    key={key}
                    onClick={() => setCurrentMaterial(key)}
                    className={`w-full flex items-center gap-2 text-xs py-2 px-3 rounded border transition-all ${
                      currentMaterial === key 
                        ? 'bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--foreground)]' 
                        : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--primary)]/50'
                    }`}
                  >
                    <span 
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ 
                        background: m.metalness > 0.5 
                          ? `linear-gradient(135deg, ${m.color} 0%, #fff 50%, ${m.color} 100%)`
                          : m.color
                      }}
                    />
                    <span className="flex-1 text-left">{m.name}</span>
                    <CategoryBadge category={m.category} />
                  </button>
                )
              })}
            </div>
          </div>
          
          {/* Environment selector */}
          <div className="mb-6">
            <label className="text-[10px] text-[var(--muted)] uppercase tracking-widest block mb-2">Environment</label>
            <select
              value={currentEnv}
              onChange={(e) => setCurrentEnv(e.target.value as EnvKey)}
              className="w-full bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] text-xs py-2 px-3 rounded focus:border-[var(--primary)] outline-none"
            >
              {(Object.keys(environments) as EnvKey[]).map(key => (
                <option key={key} value={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</option>
              ))}
            </select>
          </div>
          
          {/* Background blur slider */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] text-[var(--muted)] uppercase tracking-widest">Background Blur</label>
              <span className="text-xs text-[var(--foreground)]">{envBlur.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={envBlur}
              onChange={(e) => setEnvBlur(parseFloat(e.target.value))}
              className="w-full accent-[var(--primary)]"
            />
          </div>
          
          {/* Render options */}
          <div className="mb-6 space-y-3">
            <label className="text-[10px] text-[var(--muted)] uppercase tracking-widest block">Render Options</label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={antialias}
                onChange={(e) => setAntialias(e.target.checked)}
                className="w-4 h-4 accent-[var(--primary)]"
              />
              <span className="text-xs text-[var(--foreground)]">Antialiasing</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showEffects}
                onChange={(e) => setShowEffects(e.target.checked)}
                className="w-4 h-4 accent-[var(--primary)]"
              />
              <span className="text-xs text-[var(--foreground)]">Post-processing</span>
            </label>
          </div>
          
          {/* Current material info */}
          <div className="border-t border-[var(--border)] pt-4">
            <label className="text-[10px] text-[var(--muted)] uppercase tracking-widest block mb-3">Material Properties</label>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Metalness</span>
                <span className="text-[var(--foreground)]">{mat.metalness.toFixed(2)}</span>
              </div>
              <div className="w-full h-1 bg-[var(--background)] rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${mat.metalness * 100}%` }} />
              </div>
              
              <div className="flex justify-between mt-3">
                <span className="text-[var(--muted)]">Roughness</span>
                <span className="text-[var(--foreground)]">{mat.roughness.toFixed(2)}</span>
              </div>
              <div className="w-full h-1 bg-[var(--background)] rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500" style={{ width: `${mat.roughness * 100}%` }} />
              </div>
              
              <div className="flex justify-between mt-3">
                <span className="text-[var(--muted)]">Env Intensity</span>
                <span className="text-[var(--foreground)]">{mat.envMapIntensity?.toFixed(2) || '1.00'}</span>
              </div>
              <div className="w-full h-1 bg-[var(--background)] rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${(mat.envMapIntensity || 1) / 1.5 * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Toggle button */}
      <button
        onClick={() => setPanelOpen(!panelOpen)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-[var(--surface)] border border-[var(--border)] border-l-0 px-1 py-4 rounded-r text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
        style={{ left: panelOpen ? '18rem' : '0' }}
      >
        {panelOpen ? '‹' : '›'}
      </button>
      
      {/* Canvas */}
      <main className="flex-1 relative">
        <Canvas
          key={`canvas-${antialias}`}
          shadows
          camera={{ position: [0, 0, 5], fov: 45 }}
          gl={{ antialias, toneMapping: THREE.ACESFilmicToneMapping }}
          dpr={[1, 2]}
        >
          <Suspense fallback={null}>
            <Scene 
              shape={currentShape}
              materialKey={currentMaterial}
              environment={currentEnv}
              envBlur={envBlur}
              showEffects={showEffects}
            />
          </Suspense>
        </Canvas>
        
        {/* Info overlay */}
        <div className="absolute bottom-4 right-4 bg-[var(--surface)]/90 backdrop-blur border border-[var(--border)] rounded-lg p-4 text-xs">
          <div className="flex items-center gap-3 mb-2">
            <span 
              className="w-6 h-6 rounded-full border border-white/20"
              style={{ 
                background: mat.metalness > 0.5 
                  ? `linear-gradient(135deg, ${mat.color} 0%, #fff 50%, ${mat.color} 100%)`
                  : mat.color
              }}
            />
            <div>
              <div className="text-[var(--foreground)] font-medium">{mat.name}</div>
              <div className="text-[var(--muted)] text-[10px] uppercase">{mat.category}</div>
            </div>
          </div>
          <div className="text-[10px] text-[var(--muted)]">
            {shapes[currentShape]} • {currentEnv} lighting
          </div>
        </div>
        
        {/* Title */}
        <div className="absolute top-4 left-4 text-xs text-[var(--muted)]">
          <span className="text-[var(--primary)]">MATERIAL_LAB</span> — Drag to rotate • Scroll to zoom
        </div>
      </main>
    </div>
  )
}
