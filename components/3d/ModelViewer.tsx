'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'
import JSZip from 'jszip'
import { 
  Loader2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Sun, 
  Moon,
  Maximize2,
  Grid3X3,
  Box
} from 'lucide-react'

interface ModelViewerProps {
  modelUrl?: string
  modelFile?: File
  className?: string
  backgroundColor?: string
  modelColor?: string
  showControls?: boolean
  autoRotate?: boolean
}

export default function ModelViewer({
  modelUrl,
  modelFile,
  className = '',
  backgroundColor = '#1a1a2e',
  modelColor = '#c9a227', // Color dorado/piedra por defecto para STL
  showControls = true,
  autoRotate = false,
}: ModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const modelRef = useRef<THREE.Object3D | null>(null)
  const frameRef = useRef<number>(0)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [isAutoRotating, setIsAutoRotating] = useState(autoRotate)
  const [sensitivity, setSensitivity] = useState(1) // 0.25 = muy preciso, 1 = normal, 2 = rápido

  // Inicializar escena
  useEffect(() => {
    if (!containerRef.current) return

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(isDarkMode ? backgroundColor : '#f5f5f5')
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(5, 5, 5)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.minDistance = 2 // Evitar atravesar el modelo
    controls.maxDistance = 50
    controls.autoRotate = isAutoRotating
    controls.autoRotateSpeed = 2
    controls.enablePan = true
    controls.screenSpacePanning = true // Permite pan vertical con clic derecho
    controls.panSpeed = 1
    controls.maxPolarAngle = Math.PI * 0.95 // Permitir más rango vertical
    controls.minPolarAngle = 0.05 // No ir completamente arriba
    controlsRef.current = controls

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(10, 20, 10)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3)
    fillLight.position.set(-10, 5, -10)
    scene.add(fillLight)

    // Grid
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222)
    gridHelper.name = 'grid'
    scene.add(gridHelper)

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current) return
      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    window.addEventListener('resize', handleResize)

    // Shift + Scroll para rotar verticalmente (órbita polar)
    const handleWheel = (event: WheelEvent) => {
      if (event.shiftKey) {
        event.preventDefault()
        event.stopPropagation()
        
        // Obtener el ángulo polar actual
        const spherical = new THREE.Spherical()
        const offset = new THREE.Vector3()
        
        offset.copy(camera.position).sub(controls.target)
        spherical.setFromVector3(offset)
        
        // Ajustar el ángulo polar basado en el scroll
        const delta = event.deltaY * 0.002 * controls.rotateSpeed
        spherical.phi = Math.max(
          controls.minPolarAngle,
          Math.min(controls.maxPolarAngle, spherical.phi + delta)
        )
        
        // Aplicar la nueva posición
        offset.setFromSpherical(spherical)
        camera.position.copy(controls.target).add(offset)
        camera.lookAt(controls.target)
        controls.update()
      }
    }
    
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', handleResize)
      renderer.domElement.removeEventListener('wheel', handleWheel)
      renderer.dispose()
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [])

  // Cargar modelo
  useEffect(() => {
    if (!sceneRef.current || (!modelUrl && !modelFile)) return

    let objectUrl: string | null = null

    const loadModel = async () => {
      setLoading(true)
      setError(null)
      setProgress(0)

      // Remover modelo anterior
      if (modelRef.current) {
        sceneRef.current!.remove(modelRef.current)
        modelRef.current = null
      }

      try {
        let fileExtension = ''
        let url = modelUrl || ''

        if (modelFile) {
          fileExtension = modelFile.name.split('.').pop()?.toLowerCase() || ''
          objectUrl = URL.createObjectURL(modelFile)
          url = objectUrl
          console.log('Loading file:', modelFile.name, 'Extension:', fileExtension, 'URL:', url)
        } else if (modelUrl) {
          fileExtension = modelUrl.split('.').pop()?.toLowerCase().split('?')[0] || ''
        }

        const onProgress = (event: ProgressEvent) => {
          if (event.lengthComputable) {
            setProgress(Math.round((event.loaded / event.total) * 100))
          }
        }

        let object: THREE.Object3D

        switch (fileExtension) {
          case 'stl':
            object = await loadSTL(url, onProgress)
            break
          case 'glb':
          case 'gltf':
            object = await loadGLTF(url, onProgress)
            break
          case 'obj':
            object = await loadOBJ(url, onProgress)
            break
          case 'zip':
            if (!modelFile) throw new Error('Se requiere el archivo ZIP')
            object = await loadZIP(modelFile, onProgress)
            break
          default:
            throw new Error(`Formato no soportado: ${fileExtension}. Usa STL, GLB, GLTF, OBJ o ZIP.`)
        }

        console.log('Model loaded successfully:', object)

        // Para STL, centrar la geometría directamente
        if (object instanceof THREE.Mesh && object.geometry) {
          // Centrar la geometría en el origen
          object.geometry.computeBoundingBox()
          object.geometry.center()
          
          // Rotar la geometría para STL (Z-up a Y-up)
          object.geometry.rotateX(-Math.PI / 2)
          
          // Recalcular bounding box después de centrar y rotar
          object.geometry.computeBoundingBox()
        }

        // Calcular bounding box del objeto
        const box = new THREE.Box3().setFromObject(object)
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        
        console.log('Model size after processing:', size, 'Max dimension:', maxDim)
        
        // Escalar para que el modelo tenga un tamaño razonable (5 unidades)
        const targetSize = 5
        const scale = maxDim > 0 ? targetSize / maxDim : 1
        object.scale.set(scale, scale, scale)
        
        // Recalcular bounding box después de escalar
        object.updateMatrixWorld(true)
        const scaledBox = new THREE.Box3().setFromObject(object)
        const scaledMin = scaledBox.min
        
        // Mover el objeto para que su base esté en Y=0
        object.position.y = -scaledMin.y
        object.position.x = 0
        object.position.z = 0

        // Habilitar sombras
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })

        sceneRef.current!.add(object)
        modelRef.current = object

        // Ajustar cámara para ver el modelo
        if (cameraRef.current && controlsRef.current) {
          cameraRef.current.position.set(8, 5, 8)
          controlsRef.current.target.set(0, targetSize * scale / 2, 0)
          
          // Ajustar distancia mínima para no atravesar el modelo
          controlsRef.current.minDistance = targetSize * scale * 0.5
          controlsRef.current.update()
        }

        console.log('Model added to scene at position:', object.position)
      } catch (err: any) {
        console.error('Error loading model:', err)
        setError(err.message || 'Error al cargar el modelo')
      } finally {
        setLoading(false)
      }
    }

    loadModel()

    // Cleanup: revocar URL cuando el componente se desmonte o cambie el archivo
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [modelUrl, modelFile])

  // Actualizar color del modelo cuando cambie
  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          child.material.color.set(modelColor)
          child.material.needsUpdate = true
        }
      })
    }
  }, [modelColor])

  // Actualizar sensibilidad de los controles
  useEffect(() => {
    if (controlsRef.current) {
      // Ajustar velocidades de rotación, zoom y pan
      controlsRef.current.rotateSpeed = sensitivity
      controlsRef.current.zoomSpeed = sensitivity
      controlsRef.current.panSpeed = sensitivity
    }
  }, [sensitivity])

  // Loader STL
  const loadSTL = (url: string, onProgress: (event: ProgressEvent) => void): Promise<THREE.Object3D> => {
    return new Promise((resolve, reject) => {
      const loader = new STLLoader()
      loader.load(
        url,
        (geometry) => {
          // Material tipo piedra/bronce para STL
          const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(modelColor),
            metalness: 0.2,
            roughness: 0.8,
            flatShading: false,
            side: THREE.DoubleSide, // Renderizar ambos lados
          })
          
          geometry.computeVertexNormals()
          const mesh = new THREE.Mesh(geometry, material)
          resolve(mesh)
        },
        onProgress,
        (error) => {
          console.error('STL load error:', error)
          reject(new Error('Error cargando archivo STL'))
        }
      )
    })
  }

  // Loader GLTF/GLB
  const loadGLTF = (url: string, onProgress: (event: ProgressEvent) => void): Promise<THREE.Object3D> => {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader()
      loader.load(
        url,
        (gltf) => {
          console.log('GLTF loaded:', gltf)
          resolve(gltf.scene)
        },
        onProgress,
        (error) => {
          console.error('GLTF load error:', error)
          reject(new Error('Error cargando archivo GLTF/GLB'))
        }
      )
    })
  }

  // Loader OBJ
  const loadOBJ = (url: string, onProgress: (event: ProgressEvent) => void): Promise<THREE.Object3D> => {
    return new Promise((resolve, reject) => {
      const loader = new OBJLoader()
      loader.load(
        url,
        (object) => {
          // Aplicar materiales mejorados a todos los meshes
          object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              // Verificar si tiene colores de vértice
              const hasVertexColors = child.geometry && 
                child.geometry.attributes && 
                child.geometry.attributes.color
              
              // Crear material que preserve detalles
              const material = new THREE.MeshStandardMaterial({
                color: hasVertexColors ? 0xffffff : new THREE.Color(modelColor),
                vertexColors: hasVertexColors,
                metalness: 0.1,
                roughness: 0.8,
                side: THREE.DoubleSide, // Renderizar ambos lados
                flatShading: false,
              })
              
              // Si ya tiene material con color, intentar preservarlo
              if (child.material) {
                const existingMat = child.material as THREE.MeshStandardMaterial
                if (existingMat.color && existingMat.color.getHex() !== 0xffffff) {
                  material.color.copy(existingMat.color)
                }
                if (existingMat.map) {
                  material.map = existingMat.map
                }
              }
              
              child.material = material
              
              // Calcular normales si no las tiene para mejor iluminación
              if (child.geometry && !child.geometry.attributes.normal) {
                child.geometry.computeVertexNormals()
              }
            }
          })
          console.log('OBJ loaded with materials applied')
          resolve(object)
        },
        onProgress,
        (error) => {
          console.error('OBJ load error:', error)
          reject(new Error('Error cargando archivo OBJ'))
        }
      )
    })
  }

  // Loader ZIP (con OBJ + MTL + Texturas)
  const loadZIP = async (file: File, onProgress: (event: ProgressEvent) => void): Promise<THREE.Object3D> => {
    console.log('Loading ZIP file:', file.name)
    setProgress(10)
    
    const arrayBuffer = await file.arrayBuffer()
    const zip = await JSZip.loadAsync(arrayBuffer)
    
    setProgress(20)
    console.log('ZIP contents:', Object.keys(zip.files))
    
    // Buscar archivos en el ZIP (puede haber ZIPs anidados)
    const files: { [key: string]: Blob } = {}
    let objFile: string | null = null
    let mtlFile: string | null = null
    const textureFiles: { [key: string]: Blob } = {}
    
    // Función para procesar un ZIP
    const processZip = async (zipObj: JSZip, basePath: string = '') => {
      for (const [path, zipEntry] of Object.entries(zipObj.files)) {
        if (zipEntry.dir) continue
        
        const fullPath = basePath + path
        const fileName = path.split('/').pop() || ''
        const fileNameLower = fileName.toLowerCase()
        const ext = fileNameLower.split('.').pop() || ''
        
        console.log('Processing file:', fullPath, 'ext:', ext)
        
        // Si es un ZIP anidado, extraerlo y procesarlo
        if (ext === 'zip') {
          const nestedZipData = await zipEntry.async('arraybuffer')
          const nestedZip = await JSZip.loadAsync(nestedZipData)
          await processZip(nestedZip, fullPath.replace('.zip', '/'))
          continue
        }
        
        // Obtener el blob del archivo
        const blob = await zipEntry.async('blob')
        files[fullPath] = blob
        
        // Identificar tipos de archivo
        if (ext === 'obj' && !objFile) {
          objFile = fullPath
          console.log('Found OBJ:', fullPath)
        } else if (ext === 'mtl' && !mtlFile) {
          mtlFile = fullPath
          console.log('Found MTL:', fullPath)
        } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tga'].includes(ext)) {
          // Guardar con nombre original y lowercase
          textureFiles[fileName] = blob
          textureFiles[fileNameLower] = blob
          console.log('Found texture:', fileName)
        }
      }
    }
    
    await processZip(zip)
    setProgress(40)
    
    if (!objFile) {
      throw new Error('No se encontró archivo OBJ en el ZIP')
    }
    
    // Crear URLs para los archivos
    const objUrl = URL.createObjectURL(files[objFile])
    const urlsToRevoke = [objUrl]
    
    // Crear mapa de texturas con URLs
    const textureUrls: { [key: string]: string } = {}
    for (const [name, blob] of Object.entries(textureFiles)) {
      const url = URL.createObjectURL(blob)
      textureUrls[name] = url
      urlsToRevoke.push(url)
    }
    
    console.log('Texture URLs created:', Object.keys(textureUrls))
    setProgress(50)
    
    // Cargar texturas como THREE.Texture
    const loadedTextures: { [key: string]: THREE.Texture } = {}
    const textureLoader = new THREE.TextureLoader()
    
    for (const [name, url] of Object.entries(textureUrls)) {
      const texture = textureLoader.load(url)
      // OBJ normalmente necesita flipY = true (por defecto en Three.js)
      texture.flipY = true
      texture.colorSpace = THREE.SRGBColorSpace
      // Configurar wrapping para evitar problemas en los bordes
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.RepeatWrapping
      texture.minFilter = THREE.LinearMipmapLinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.generateMipmaps = true
      loadedTextures[name] = texture
      loadedTextures[name.toLowerCase()] = texture
    }
    
    console.log('Textures loaded:', Object.keys(loadedTextures))
    setProgress(60)
    
    try {
      // Cargar OBJ directamente sin MTL (aplicaremos texturas manualmente)
      const objLoader = new OBJLoader()
      
      return new Promise<THREE.Object3D>((resolve, reject) => {
        objLoader.load(
          objUrl,
          (object) => {
            setProgress(80)
            console.log('OBJ loaded, applying textures...')
            
            // Obtener lista de texturas disponibles
            const textureList = Object.entries(loadedTextures)
            const hasTextures = textureList.length > 0
            
            // Para modelos con UV tiling (u1_v1, u2_v2, etc.), necesitamos mapear correctamente
            // Primero, identificar si es un modelo con UV tiles
            const uvTilePattern = /u(\d+)_v(\d+)/i
            const uvTileTextures: { [key: string]: THREE.Texture } = {}
            let hasUVTiles = false
            
            for (const [texName, tex] of textureList) {
              const match = texName.match(uvTilePattern)
              if (match) {
                hasUVTiles = true
                uvTileTextures[`${match[1]}_${match[2]}`] = tex
              }
            }
            
            console.log('Has UV tiles:', hasUVTiles, 'Tiles:', Object.keys(uvTileTextures))
            
            // Aplicar texturas a cada mesh
            let meshIndex = 0
            object.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                let assignedTexture: THREE.Texture | null = null
                
                if (hasTextures) {
                  const meshName = child.name.toLowerCase()
                  console.log('Processing mesh:', child.name, 'index:', meshIndex)
                  
                  // Si tiene UV tiles, intentar asignar por nombre del mesh o grupo
                  if (hasUVTiles) {
                    // Buscar patrón UV en el nombre del mesh
                    const meshMatch = meshName.match(uvTilePattern)
                    if (meshMatch) {
                      const key = `${meshMatch[1]}_${meshMatch[2]}`
                      if (uvTileTextures[key]) {
                        assignedTexture = uvTileTextures[key]
                        console.log('Assigned UV tile texture:', key, 'to mesh:', meshName)
                      }
                    }
                    
                    // Si no encontró por nombre, buscar por material name
                    if (!assignedTexture && child.material) {
                      const matName = (child.material as THREE.Material).name?.toLowerCase() || ''
                      const matMatch = matName.match(uvTilePattern)
                      if (matMatch) {
                        const key = `${matMatch[1]}_${matMatch[2]}`
                        if (uvTileTextures[key]) {
                          assignedTexture = uvTileTextures[key]
                          console.log('Assigned UV tile texture by material:', key)
                        }
                      }
                    }
                  }
                  
                  // Si no es UV tiles o no encontró, buscar por nombre
                  if (!assignedTexture) {
                    for (const [texName, tex] of textureList) {
                      const texBaseName = texName.toLowerCase().replace(/\.[^/.]+$/, '')
                      if (meshName.includes(texBaseName) || texBaseName.includes(meshName)) {
                        assignedTexture = tex
                        console.log('Assigned texture by name match:', texName)
                        break
                      }
                    }
                  }
                  
                  // Usar primera textura disponible si no se encontró ninguna
                  if (!assignedTexture && textureList.length > 0) {
                    // Para múltiples texturas, intentar distribuirlas
                    const texIndex = meshIndex % textureList.length
                    assignedTexture = textureList[texIndex][1]
                    console.log('Assigned texture by index:', texIndex)
                  }
                }
                
                // Crear material
                const material = new THREE.MeshStandardMaterial({
                  map: assignedTexture,
                  color: 0xffffff,
                  side: THREE.DoubleSide,
                  metalness: 0.0,
                  roughness: 1.0,
                })
                
                // Si no hay textura, usar el color del modelo
                if (!assignedTexture) {
                  material.color = new THREE.Color(modelColor)
                }
                
                child.material = material
                
                // Calcular normales si no existen
                if (child.geometry && !child.geometry.attributes.normal) {
                  child.geometry.computeVertexNormals()
                }
                
                meshIndex++
              }
            })
            
            setProgress(95)
            
            // Limpiar URLs después de un tiempo
            setTimeout(() => {
              urlsToRevoke.forEach(url => URL.revokeObjectURL(url))
            }, 5000)
            
            console.log('ZIP model loaded successfully with', meshIndex, 'meshes')
            resolve(object)
          },
          (event) => {
            if (event.lengthComputable) {
              setProgress(60 + Math.round((event.loaded / event.total) * 20))
            }
          },
          (error) => {
            urlsToRevoke.forEach(url => URL.revokeObjectURL(url))
            console.error('OBJ load error from ZIP:', error)
            reject(new Error('Error cargando modelo desde ZIP'))
          }
        )
      })
    } catch (error) {
      urlsToRevoke.forEach(url => URL.revokeObjectURL(url))
      throw error
    }
  }

  // Funciones de control
  const handleZoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(0.8)
    }
  }

  const handleZoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.multiplyScalar(1.2)
    }
  }

  const handleReset = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(8, 6, 8)
      controlsRef.current.target.set(0, 2, 0)
      controlsRef.current.update()
    }
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(!isDarkMode ? backgroundColor : '#f5f5f5')
    }
  }

  const toggleGrid = () => {
    setShowGrid(!showGrid)
    if (sceneRef.current) {
      const grid = sceneRef.current.getObjectByName('grid')
      if (grid) grid.visible = !showGrid
    }
  }

  const toggleAutoRotate = () => {
    setIsAutoRotating(!isAutoRotating)
    if (controlsRef.current) {
      controlsRef.current.autoRotate = !isAutoRotating
    }
  }

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        containerRef.current.requestFullscreen()
      }
    }
  }

  return (
    <div className={`relative bg-gray-900 rounded-xl overflow-hidden ${className}`}>
      {/* Canvas container */}
      <div 
        ref={containerRef} 
        className="w-full h-full min-h-[400px]"
      />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 text-primary-500 animate-spin mb-4" />
          <p className="text-white text-lg font-medium">Cargando modelo...</p>
          {progress > 0 && (
            <div className="w-48 mt-4">
              <div className="bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-primary-500 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-gray-400 text-sm text-center mt-2">{progress}%</p>
            </div>
          )}
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-4">
          <Box className="h-16 w-16 text-red-500 mb-4" />
          <p className="text-white text-lg font-medium mb-2">Error al cargar</p>
          <p className="text-gray-400 text-center">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!modelUrl && !modelFile && !loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Box className="h-20 w-20 text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg">Arrastra un modelo 3D aquí</p>
          <p className="text-gray-500 text-sm mt-2">Formatos: STL, GLB, GLTF, OBJ</p>
        </div>
      )}

      {/* Controls */}
      {showControls && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-lg p-2">
          <button
            onClick={handleZoomIn}
            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            title="Acercar"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            title="Alejar"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <div className="w-px h-6 bg-gray-600" />
          <button
            onClick={handleReset}
            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            title="Restablecer vista"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
          <button
            onClick={toggleAutoRotate}
            className={`p-2 rounded-lg transition-colors ${isAutoRotating ? 'bg-primary-500 text-white' : 'text-white hover:bg-white/20'}`}
            title="Rotación automática"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 11-9-9" />
              <path d="M21 3v9h-9" />
            </svg>
          </button>
          <div className="w-px h-6 bg-gray-600" />
          
          {/* Sensibilidad */}
          <div className="flex items-center gap-1" title="Sensibilidad del movimiento">
            <button
              onClick={() => setSensitivity(0.25)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                sensitivity === 0.25 
                  ? 'bg-primary-500 text-white' 
                  : 'text-gray-300 hover:bg-white/20'
              }`}
              title="Muy preciso"
            >
              🎯
            </button>
            <button
              onClick={() => setSensitivity(0.5)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                sensitivity === 0.5 
                  ? 'bg-primary-500 text-white' 
                  : 'text-gray-300 hover:bg-white/20'
              }`}
              title="Preciso"
            >
              🐢
            </button>
            <button
              onClick={() => setSensitivity(1)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                sensitivity === 1 
                  ? 'bg-primary-500 text-white' 
                  : 'text-gray-300 hover:bg-white/20'
              }`}
              title="Normal"
            >
              ⚖️
            </button>
            <button
              onClick={() => setSensitivity(2)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                sensitivity === 2 
                  ? 'bg-primary-500 text-white' 
                  : 'text-gray-300 hover:bg-white/20'
              }`}
              title="Rápido"
            >
              🐇
            </button>
          </div>
          
          <div className="w-px h-6 bg-gray-600" />
          <button
            onClick={toggleGrid}
            className={`p-2 rounded-lg transition-colors ${showGrid ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'}`}
            title="Mostrar/ocultar cuadrícula"
          >
            <Grid3X3 className="h-5 w-5" />
          </button>
          <button
            onClick={toggleDarkMode}
            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            title="Cambiar fondo"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            onClick={handleFullscreen}
            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            title="Pantalla completa"
          >
            <Maximize2 className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Format badge */}
      {(modelUrl || modelFile) && !loading && !error && (
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1">
          <span className="text-white text-sm font-medium uppercase">
            {modelFile?.name.split('.').pop() || modelUrl?.split('.').pop()?.split('?')[0]}
          </span>
        </div>
      )}
    </div>
  )
}

