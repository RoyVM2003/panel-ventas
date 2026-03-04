import { useEffect } from 'react'

export function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal--visible')
            // Once visible, stop observing (animation plays once)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )

    // Small delay so DOM is fully painted before we start observing
    const timer = setTimeout(() => {
      document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
    }, 100)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [])
}
