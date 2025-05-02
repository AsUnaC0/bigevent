import persist from 'pinia-plugin-persistedstate'
import { createPinia } from 'pinia'

const pinia = createPinia()
pinia.use(persist)

export default pinia

// import { useUserStore } from './user'
// export { useUserStore }

export * from './modules/user'