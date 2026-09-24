import { RoomProvider } from './contexts/RoomContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { PortalPage } from './pages/PortalPage'
import { AdminPage } from './pages/AdminPage'

function App() { return <ThemeProvider><RoomProvider>{window.location.pathname.startsWith('/admin') ? <AdminPage /> : <PortalPage />}</RoomProvider></ThemeProvider> }

export default App
