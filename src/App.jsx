import React, { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react'

// SafeIcon component for Lucide icons
const SafeIcon = ({ name, size = 24, className = '', color }) => {
  const icons = {
    'arrow-up-right': ArrowUpRight,
    'mail': Mail,
    'map-pin': MapPin,
    'phone': Phone,
  }
  const IconComponent = icons[name] || (() => null)
  return <IconComponent size={size} className={className} color={color} />
}

// Custom Cursor with mix-blend-mode
const Cursor = () => {
  const [isTouch, setIsTouch] = useState(false)
  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)
  
  const springConfig = { damping: 25, stiffness: 400 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  useEffect(() => {
    // Check for touch device
    const checkTouch = () => {
      setIsTouch(window.matchMedia('(pointer: coarse)').matches)
    }
    checkTouch()
    window.addEventListener('resize', checkTouch)
    
    const moveCursor = (e) => {
      cursorX.set(e.clientX - 8)
      cursorY.set(e.clientY - 8)
    }
    
    window.addEventListener('mousemove', moveCursor)
    
    return () => {
      window.removeEventListener('mousemove', moveCursor)
      window.removeEventListener('resize', checkTouch)
    }
  }, [cursorX, cursorY])

  if (isTouch) return null

  return (
    <motion.div
      className="fixed top-0 left-0 w-4 h-4 bg-white rounded-full pointer-events-none z-[9999]"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        mixBlendMode: 'difference',
      }}
    />
  )
}

// Glitch Text Animation Component
const GlitchText = ({ text, className = '' }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  
  const letters = text.split('')

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.3,
      },
    },
  }

  const child = {
    hidden: {
      opacity: 0,
      y: 50,
      skewY: 10,
    },
    visible: {
      opacity: 1,
      y: 0,
      skewY: 0,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 200,
      },
    },
  }

  return (
    <motion.span
      ref={ref}
      className={`inline-flex flex-wrap ${className}`}
      variants={container}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          variants={child}
          className="inline-block"
          style={{ 
            marginRight: letter === ' ' ? '0.3em' : '0.02em',
            willChange: 'transform, opacity'
          }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.span>
  )
}

// Hero Section
const Hero = () => {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <section 
      ref={ref}
      className="relative min-h-screen flex flex-col justify-center items-center bg-zinc-950 text-stone-50 overflow-hidden"
    >
      {/* Background Image with Parallax */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ y }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/30 via-transparent to-zinc-950 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&q=80" 
          alt="Brutalist concrete architecture"
          className="w-full h-[120%] object-cover opacity-60"
        />
      </motion.div>

      {/* Content */}
      <motion.div 
        className="relative z-20 text-center px-6 max-w-7xl mx-auto"
        style={{ opacity }}
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-zinc-500 text-sm tracking-[0.3em] uppercase mb-8 font-mono"
        >
          Architectural Bureau
        </motion.p>
        
        <h1 className="text-6xl sm:text-8xl md:text-9xl lg:text-[12rem] font-black tracking-tighter leading-none mb-8">
          <GlitchText text="STRUCTURES" />
          <br />
          <GlitchText text="OF VOID" />
        </h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="text-zinc-500 text-lg md:text-xl max-w-2xl mx-auto font-mono"
        >
          Between light and shadow. Concrete and absence. 
          We build monuments to silence.
        </motion.p>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="w-px h-16 bg-gradient-to-b from-zinc-500 to-transparent"
        />
      </motion.div>
    </section>
  )
}

// Project Item with hover preview
const ProjectItem = ({ number, title, image, index }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const itemRef = useRef(null)

  const handleMouseMove = (e) => {
    if (itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect()
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }

  return (
    <motion.div
      ref={itemRef}
      className="relative border-b border-zinc-900 py-8 md:py-12 cursor-none group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
    >
      <motion.div
        className="flex items-baseline gap-4 md:gap-8"
        animate={{ x: isHovered ? 40 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <span className="text-zinc-400 font-mono text-sm md:text-base">
          {number}
        </span>
        <h3 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-zinc-950 uppercase">
          {title}
        </h3>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1 : 0,
            rotate: isHovered ? 0 : -10
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="ml-auto"
        >
          <SafeIcon name="arrow-up-right" size={48} className="text-zinc-950" />
        </motion.div>
      </motion.div>

      {/* Hover Preview Image */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="fixed pointer-events-none z-50 w-80 h-60 overflow-hidden rounded-lg shadow-2xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              x: mousePosition.x - 160,
              y: mousePosition.y - 120,
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
            }}
          >
            <img 
              src={image} 
              alt={title}
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Selected Works Section
const SelectedWorks = () => {
  const projects = [
    {
      number: '01',
      title: 'Monolith Tower',
      image: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&q=80',
    },
    {
      number: '02',
      title: 'Concrete Bunker',
      image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=800&q=80',
    },
    {
      number: '03',
      title: 'Void Museum',
      image: 'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?w=800&q=80',
    },
    {
      number: '04',
      title: 'Shadow Gallery',
      image: 'https://images.unsplash.com/photo-1431576901776-e539bd916ba2?w=800&q=80',
    },
    {
      number: '05',
      title: 'Brutalist House',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    },
  ]

  return (
    <section className="min-h-screen bg-stone-50 text-zinc-950 py-24 md:py-32 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 md:mb-24"
        >
          <p className="text-zinc-500 text-sm tracking-[0.3em] uppercase mb-4 font-mono">
            Selected Works
          </p>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter">
            PROJECTS
          </h2>
        </motion.div>

        <div className="border-t border-zinc-900">
          {projects.map((project, index) => (
            <ProjectItem
              key={project.number}
              number={project.number}
              title={project.title}
              image={project.image}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// Philosophy Section with terminal-like reveal
const Philosophy = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-200px' })
  
  const lines = [
    'ARCHITECTURE IS NOT ABOUT SPACE.',
    'IT IS ABOUT THE VOID THAT DEFINES IT.',
    '',
    'WE DO NOT BUILD WALLS.',
    'WE SCULPT ABSENCE.',
    '',
    'LIGHT ENTERS THROUGH WHAT IS MISSING.',
    'FORM EMERGES FROM WHAT IS NOT THERE.',
    '',
    'OUR MANIFESTO IS SIMPLE:',
    'LESS. BUT BETTER.',
  ]

  return (
    <section 
      ref={ref}
      className="min-h-screen bg-zinc-950 text-stone-50 py-24 md:py-32 px-6 md:px-12 flex items-center"
    >
      <div className="max-w-5xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <p className="text-zinc-500 text-sm tracking-[0.3em] uppercase mb-4 font-mono">
            Philosophy
          </p>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter">
            MANIFESTO
          </h2>
        </motion.div>

        <div className="font-mono text-lg md:text-2xl lg:text-3xl leading-relaxed md:leading-relaxed space-y-2">
          {lines.map((line, index) => (
            <motion.div
              key={index}
              className="overflow-hidden"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: index * 0.15, duration: 0.1 }}
            >
              <motion.p
                className={`${line === '' ? 'h-8' : ''} ${line.startsWith('OUR') ? 'text-zinc-400 mt-8' : ''}`}
                initial={{ y: '100%' }}
                animate={isInView ? { y: 0 } : { y: '100%' }}
                transition={{ 
                  delay: index * 0.15, 
                  duration: 0.5,
                  type: 'spring',
                  stiffness: 100,
                  damping: 20
                }}
              >
                {line || '\u00A0'}
              </motion.p>
            </motion.div>
          ))}
          
          {/* Blinking cursor */}
          <motion.span
            className="inline-block w-3 h-6 md:h-8 bg-stone-50 mt-4"
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8, ease: 'steps(2)' }}
          />
        </div>
      </div>
    </section>
  )
}

// Contact Section
const Contact = () => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <section className="min-h-screen bg-stone-50 text-zinc-950 py-24 md:py-32 px-6 md:px-12 flex flex-col justify-center">
      <div className="max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 md:mb-24"
        >
          <p className="text-zinc-500 text-sm tracking-[0.3em] uppercase mb-4 font-mono">
            Get in Touch
          </p>
        </motion.div>

        <motion.a
          href="mailto:hello@structuresofvoid.com"
          className="block group relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div
            className="text-4xl sm:text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter break-all md:break-normal"
            animate={{ 
              x: isHovered ? 20 : 0,
              color: isHovered ? '#71717a' : '#09090b'
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            HELLO@
            <br />
            STRUCTURESOFVOID.COM
          </motion.div>

          <motion.div
            className="absolute -right-4 top-0 hidden md:block"
            animate={{ 
              scale: isHovered ? 1.2 : 1,
              rotate: isHovered ? 45 : 0
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <SafeIcon name="arrow-up-right" size={80} className="text-zinc-950" />
          </motion.div>
        </motion.a>

        {/* Footer info */}
        <motion.div
          className="mt-24 md:mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div>
            <p className="text-zinc-500 text-sm tracking-[0.2em] uppercase mb-2 font-mono">Location</p>
            <p className="text-lg font-medium">Berlin, Germany</p>
          </div>
          <div>
            <p className="text-zinc-500 text-sm tracking-[0.2em] uppercase mb-2 font-mono">Phone</p>
            <p className="text-lg font-medium">+49 30 1234 5678</p>
          </div>
          <div>
            <p className="text-zinc-500 text-sm tracking-[0.2em] uppercase mb-2 font-mono">Social</p>
            <div className="flex gap-4">
              <a href="#" className="text-lg font-medium hover:text-zinc-500 transition-colors">Instagram</a>
              <a href="#" className="text-lg font-medium hover:text-zinc-500 transition-colors">Behance</a>
              <a href="#" className="text-lg font-medium hover:text-zinc-500 transition-colors">LinkedIn</a>
            </div>
          </div>
        </motion.div>

        {/* Copyright */}
        <motion.div
          className="mt-24 pt-8 border-t border-zinc-200"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <p className="text-zinc-400 text-sm font-mono">
            © 2024 STRUCTURES OF VOID. All rights reserved.
          </p>
        </motion.div>
      </div>

      {/* Cursor scale indicator for email hover */}
      {isHovered && (
        <motion.div
          className="fixed pointer-events-none z-[9998] w-20 h-20 bg-white rounded-full mix-blend-difference"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 5, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          style={{
            left: '50%',
            top: '50%',
            marginLeft: '-40px',
            marginTop: '-40px',
          }}
        />
      )}
    </section>
  )
}

// Main App Component
function App() {
  const [theme, setTheme] = useState('dark')
  const mainRef = useRef(null)

  // Track which section is in view to update theme
  const worksRef = useRef(null)
  const philosophyRef = useRef(null)
  const contactRef = useRef(null)

  const worksInView = useInView(worksRef, { amount: 0.5 })
  const philosophyInView = useInView(philosophyRef, { amount: 0.5 })
  const contactInView = useInView(contactRef, { amount: 0.5 })

  useEffect(() => {
    if (contactInView) {
      setTheme('light')
    } else if (philosophyInView) {
      setTheme('dark')
    } else if (worksInView) {
      setTheme('light')
    } else {
      setTheme('dark')
    }
  }, [worksInView, philosophyInView, contactInView])

  return (
    <div className="relative">
      {/* Custom Cursor */}
      <Cursor />

      {/* Main Content */}
      <motion.main
        ref={mainRef}
        className="relative"
        animate={{
          backgroundColor: theme === 'dark' ? '#09090b' : '#fafaf9',
          color: theme === 'dark' ? '#fafaf9' : '#09090b',
        }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        {/* Hero - Dark */}
        <Hero />

        {/* Selected Works - Light */}
        <div ref={worksRef}>
          <SelectedWorks />
        </div>

        {/* Philosophy - Dark */}
        <div ref={philosophyRef}>
          <Philosophy />
        </div>

        {/* Contact - Light */}
        <div ref={contactRef}>
          <Contact />
        </div>
      </motion.main>
    </div>
  )
}

export default App