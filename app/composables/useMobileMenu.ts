export const useMobileMenu = () => {
  const isOpen = useState('mobile-menu-open', () => false)

  const openMenu = () => {
    isOpen.value = true
  }

  const closeMenu = () => {
    isOpen.value = false
  }

  const toggleMenu = () => {
    isOpen.value = !isOpen.value
  }

  return {
    isOpen,
    openMenu,
    closeMenu,
    toggleMenu,
  }
}

