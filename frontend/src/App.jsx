
import Authentication from './Authentication/Authenticate'
import { GoogleOAuthProvider } from "@react-oauth/google";
function App() {
  
  return (
    <GoogleOAuthProvider clientId="56318545794-and8lv8bqatv5r4car5b7h7imupudai6.apps.googleusercontent.com">
    <Authentication />
    </GoogleOAuthProvider>
  )
}

export default App
