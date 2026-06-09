'use client'

import { Suspense, useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

function Model() {
  const { scene } = useGLTF('/milady.glb')
  const groupRef = useRef<THREE.Group>(null)
  const baseY = useRef(0)
  const speaking = useRef(false)
  // ── setup + framing — runs ONCE (scene is stable) ───────────────────
  useEffect(() => {
    if (!groupRef.current) return
    const g = groupRef.current

    // soften harsh materials
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (mesh.isMesh) {
        mesh.castShadow = false
        mesh.receiveShadow = false
        const mat = mesh.material as THREE.MeshStandardMaterial
        if (mat) {
          mat.roughness = Math.min(mat.roughness ?? 1, 0.85)
          mat.needsUpdate = true
        }
      }
    })

    // ── T-pose → A-pose ──
    // Sketchfab→Mixamo rig (bones: "mixamorig:LeftArm_011" …). Each bone's
    // local axes are rolled, so `bone.rotation.z` only twists the arm along
    // its length. Swing about the WORLD forward axis so the arms drop straight
    // down regardless of how each bone's own frame is oriented.
    g.updateMatrixWorld(true)
    let leftArm: THREE.Object3D | undefined
    let rightArm: THREE.Object3D | undefined
    scene.traverse((o) => {
      if (/LeftArm_/.test(o.name)) leftArm = o
      else if (/RightArm_/.test(o.name)) rightArm = o
    })
    const WORLD_Z = new THREE.Vector3(0, 0, 1)
    const pWorld = new THREE.Quaternion()
    const swingDown = (bone: THREE.Object3D | undefined, angle: number) => {
      if (!bone || !bone.parent) return
      bone.parent.getWorldQuaternion(pWorld)
      const r = new THREE.Quaternion().setFromAxisAngle(WORLD_Z, angle)
      // newLocal = parentWorld⁻¹ · r · parentWorld · oldLocal → swing in world space
      bone.quaternion.premultiply(pWorld.clone().invert().multiply(r).multiply(pWorld))
    }
    swingDown(leftArm, -1.35) // her left arm (screen-right) down to her side
    swingDown(rightArm, 1.35) // her right arm (screen-left) down to her side

    // ── frame: scale to a fixed world height, centre, nudge right ──
    // NB: Box3.setFromObject() is WRONG for this model. It transforms the
    // mesh's bind box by the mesh node's matrix, which (Sketchfab export:
    // ×0.01 then ×100 with ±90° X rotations) is rotated relative to the
    // upright skeleton — so it reports her depth (~0.35) as her height.
    // Measure the SKELETON's world joints instead → a correct upright box.
    g.updateMatrixWorld(true)
    const box = new THREE.Box3()
    const p = new THREE.Vector3()
    scene.traverse((o) => {
      if ((o as THREE.Bone).isBone || /^mixamorig:/.test(o.name)) {
        box.expandByPoint(o.getWorldPosition(p))
      }
    })
    const dim = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    const scale = 3.0 / dim.y // ↑ this value = zoom in further (nav clips the top past ~3.2)
    g.scale.setScalar(scale)
    g.position.x = -center.x * scale + 0.18 // centred, nudged slightly right
    g.position.y = 0.26 - center.y * scale // +offset lifts her up in the frame
    g.position.z = -center.z * scale
    baseY.current = g.position.y
  }, [scene])

  // the chat dispatches `milady:speaking` while TTS is talking
  useEffect(() => {
    const h = (e: Event) => { speaking.current = !!(e as CustomEvent).detail }
    window.addEventListener('milady:speaking', h)
    return () => window.removeEventListener('milady:speaking', h)
  }, [])

  // gentle idle sway + a livelier waggle/bob while she's speaking
  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    const talking = speaking.current
    const waggle = talking ? Math.sin(t * 7) * 0.035 : 0
    const bob = talking ? Math.abs(Math.sin(t * 6)) * 0.018 : 0
    groupRef.current.rotation.y = Math.sin(t * 0.35) * 0.22 + waggle // ±~13° idle, +waggle talking
    groupRef.current.position.y = baseY.current + Math.sin(t * 0.8) * 0.02 + bob
  })

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  )
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.7} color="#ffffff" />
      {/* key — warm rose from front-right */}
      <directionalLight position={[3, 4, 5]} intensity={2.4} color="#ffeaf2" />
      {/* fill — soft lavender from front-left */}
      <directionalLight position={[-4, 1, 3]} intensity={1.1} color="#c7b8d8" />
      {/* rim — cool from behind to separate from bg */}
      <directionalLight position={[-1, 3, -4]} intensity={1.6} color="#9fb0d0" />
      {/* face fill */}
      <pointLight position={[0, 1.5, 3]} intensity={3} color="#fff0f5" distance={8} />
    </>
  )
}

function Fallback() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((s) => { if (ref.current) ref.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.4) * 0.5 })
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial color="#f2a7c3" wireframe transparent opacity={0.35} />
    </mesh>
  )
}

export default function MiladyViewer() {
  const [failed, setFailed] = useState(false)

  return (
    <div className="w-full h-full overflow-hidden">
      <Canvas
        camera={{ position: [0, 0.3, 5 ], fov: 34 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.15
        }}
      >
        <Lights />
        <Suspense fallback={<Fallback />}>
          {failed ? <Fallback /> : <ModelGuard onFail={() => setFailed(true)} />}
        </Suspense>
      </Canvas>
    </div>
  )
}

function ModelGuard({ onFail }: { onFail: () => void }) {
  try {
    return <Model />
  } catch {
    onFail()
    return <Fallback />
  }
}

useGLTF.preload('/milady.glb')
